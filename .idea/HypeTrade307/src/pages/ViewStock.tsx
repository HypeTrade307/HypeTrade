import { useState, useEffect } from "react";
import "../stocks.css";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";

// Define API base URL to fetch data in mySQL 
const API_BASE_URL = "http://127.0.0.1:8000";

interface Stock {
    stock_id: number;
    stock_name: string;
    ticker: string;
    analysis_mode: string;
    value?: number;
    sentiment?: number;
}

interface Notification {
    notification_id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    sender_id: number;
    receiver_id: number;
}

type TimePeriod = "Day" | "Week" | "Month";

function ViewStock(props: { disableCustomTheme?: boolean }) {
    const [stockList, setStockList] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pickStock, setPickStock] = useState<Stock | null>(null);
    const [timeButton, setTimeButton] = useState<TimePeriod>("Day");
    const [sentimentData, setSentimentData] = useState<number[]>([]);
    const [loadingSentiment, setLoadingSentiment] = useState<boolean>(false);
    
    // Notification states
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
    
    // Get the current user ID - you'll need to implement user authentication
    // This is just a placeholder - replace with your actual user authentication method
    const currentUserId = 1; // Example user ID
    
    // Format date for display
    const formatNotificationTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        
        // Same day
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        
        // More than a day ago
        return date.toLocaleDateString();
    };
 
    // Count unread notifications
    const unreadCount = notifications.filter(notification => !notification.is_read).length;

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Update local state
            setNotifications(notifications.map(notification => ({
                ...notification,
                is_read: true
            })));
        } catch (err) {
            console.error("Failed to mark notifications as read:", err);
        }
    };
 
    // Mark a single notification as read
    const markAsRead = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/mark-read/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Update local state
            setNotifications(notifications.map(notification => 
                notification.notification_id === id ? {...notification, is_read: true} : notification
            ));
        } catch (err) {
            console.error(`Failed to mark notification ${id} as read:`, err);
        }
    };
 
    // Toggle notification panel
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        
        // If opening notifications and there are unread ones, fetch latest
        if (!showNotifications) {
            fetchNotifications();
        }
    };
    
    // Fetch notifications from backend
    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const response = await fetch(`${API_BASE_URL}/notifications/user/${currentUserId}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
        
        const intervalId = setInterval(fetchNotifications, 60000); // Check every minute
        
        return () => clearInterval(intervalId); // Clean up on unmount
    }, []);

    // Fetch top 20 stocks from the backend
    useEffect(() => {
        const fetchTopStocks = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/stocks/top/?limit=20`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Add dummy stock prices
                const stocksWithValues = data.map((stock: Stock) => ({
                    ...stock,
                    value: Math.floor(Math.random() * 1000) + 50, // Random value between 50 and 1050
                    sentiment: parseFloat((Math.random() * 20 - 10).toFixed(2))  // Random sentiment between -10 and 10
                }));
                
                setStockList(stocksWithValues);
            } catch (err) {
                console.error("Failed to fetch stocks:", err);
                setError("Failed to load stocks. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchTopStocks();
    }, []);

    // Fetch sentiment data when a stock is selected
    useEffect(() => {
        if (pickStock) {
            const fetchSentiment = async () => {
                try {
                    setLoadingSentiment(true);
                    // Convert time period to days
                    const interval = timeButton === "Day" ? 1 : timeButton === "Week" ? 7 : 30;
                    
                    const response = await fetch(`${API_BASE_URL}/stocks/sentiment/${pickStock.stock_id}?interval=${interval}`);
                    
                    if (!response.ok) {
                        throw new Error(`API error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    setSentimentData(data);
                } catch (err) {
                    console.error("Failed to fetch sentiment data:", err);
                } finally {
                    setLoadingSentiment(false);
                }
            };

            fetchSentiment();
        }
    }, [pickStock, timeButton]);

    const getGraph = (): string => {
        if (!pickStock) {
            return "No stock selected";
        }

        if (loadingSentiment) {
            return `Loading ${pickStock.stock_name}'s data...`;
        }

        return `${pickStock.stock_name}'s performance over the last ${timeButton}`;
    }

    // Function to determine sentiment color based on value
    const getSentimentColor = (sentiment: number | undefined): string => {
        if (sentiment === undefined) return "#888888"; // gray if no sentiment
        
        if (sentiment > 5) return "#4CAF50"; // Strong positive - green
        if (sentiment > 0) return "#8BC34A"; // Positive - light green
        if (sentiment === 0) return "#9E9E9E"; // Neutral - gray
        if (sentiment > -5) return "#FF9800"; // Negative - orange
        return "#F44336"; // Strong negative - red
    }

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />

                <div className="stock-page-container">
                    {/* Notification Button */}
                    <div className="notification-container">
                        <button 
                            className="notification-button" 
                            onClick={toggleNotifications}
                        >
                            🔔
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>
                        
                        {/* notification dropdown */}
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="mark-read-button" onClick={markAllAsRead}>
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                
                                <div className="notification-list">
                                    {loadingNotifications ? (
                                        <p className="notification-loading">Loading notifications...</p>
                                    ) : notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div 
                                                key={notification.notification_id} 
                                                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                                onClick={() => markAsRead(notification.notification_id)}
                                            >
                                                <p className="notification-message">{notification.message}</p>
                                                <span className="notification-time">{formatNotificationTime(notification.created_at)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-notifications">No notifications</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Display stuff */}
                    <h1 className="title">Top 20 S&P 500 Stocks</h1>
                    
                    {loading && (
                        <div className="loading-container">
                            Loading stocks...
                        </div>
                    )}
                    
                    {error && (
                        <div className="error-container">
                            {error}
                        </div>
                    )}
                    
                    {!loading && !error && (
                        <div className="stocks-grid">
                            {stockList.map((stock) => (
                                <div 
                                    className="stock-card" 
                                    key={stock.ticker}
                                    onClick={() => setPickStock(stock)}
                                >
                                    <div className="stock-header">
                                        <span className="stock-abbr">{stock.ticker}</span>
                                        <span 
                                            className="stock-sentiment"
                                            style={{ backgroundColor: getSentimentColor(stock.sentiment) }}
                                        >
                                            {stock.sentiment}
                                        </span>
                                    </div>
                                    <div className="stock-name">{stock.stock_name}</div>
                                    <div className="stock-value">${stock.value?.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pickStock && (
                        <div
                            className="hud-container"
                            onClick={() => setPickStock(null)}
                        >
                            <div
                                className="hud-box"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="cancel"
                                    onClick={() => {setPickStock(null); setTimeButton("Day")}}
                                >
                                    x
                                </button>
                                
                                <div className="stock-detail-header">
                                    <h2>
                                        {pickStock.stock_name} ({pickStock.ticker})
                                    </h2>
                                    <div className="detail-change">
                                        ${pickStock.value?.toLocaleString()}
                                    </div>
                                </div>
                                
                                <div className="stock-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Analysis Mode</span>
                                        <span className="info-value">{pickStock.analysis_mode}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Sentiment</span>
                                        <span 
                                            className="sentiment-badge"
                                            style={{ backgroundColor: getSentimentColor(pickStock.sentiment) }}
                                        >
                                            {pickStock.sentiment}
                                        </span>
                                    </div>
                                </div>

                                <div className="time-controls">
                                    <div className="time-label">Time Period</div>
                                    <div className="time-buttons-container">
                                        <button
                                            className={`time-button ${timeButton === "Day" ? "active" : ""}`}
                                            onClick={() => setTimeButton("Day")}
                                        >
                                            Day
                                        </button>
                                        <button
                                            className={`time-button ${timeButton === "Week" ? "active" : ""}`}
                                            onClick={() => setTimeButton("Week")}
                                        >
                                            Week
                                        </button>
                                        <button
                                            className={`time-button ${timeButton === "Month" ? "active" : ""}`}
                                            onClick={() => setTimeButton("Month")}
                                        >
                                            Month
                                        </button>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h3 className="chart-title">{getGraph()}</h3>
                                    {loadingSentiment ? (
                                        <div className="chart-loading">
                                            Loading sentiment data...
                                        </div>
                                    ) : sentimentData.length > 0 ? (
                                        <div className="chart-placeholder">
                                            Sentiment data: {sentimentData.join(', ')}
                                            {/* You could add a real chart library here like Recharts */}
                                        </div>
                                    ) : (
                                        <div className="chart-placeholder">
                                            No sentiment data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppTheme>
        </>
    )
}

export default ViewStock;