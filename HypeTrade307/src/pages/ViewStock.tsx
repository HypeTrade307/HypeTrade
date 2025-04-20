// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
//@ts-ignore
import { useParams, useNavigate } from "react-router-dom";
import "../stocks.css";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import axios from "axios";
import MarketValue from "../assets/basic_Graph.tsx";
import AreaGraph from "../assets/area_Graph.tsx";
// Define API base URL to fetch data in mySQL 
const API_BASE_URL = "https://hypet-145797464141.us-central1.run.app/api/api";

interface Stock {
    stock_id: number;
    stock_name: string;
    ticker: string;
    analysis_mode: string;
    value?: number;
    sentiment?: number;
    previousSentiment?: number; // Added to track sentiment changes
}

interface Notification {
    notification_id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    sender_id: number;
    receiver_id: number;
}

interface Portfolio {
    portfolio_id: number;
    portfolio_name: string;
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    
    // Portfolio states
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [portfolioStocks, setPortfolioStocks] = useState<Stock[]>([]);
    const [loadingPortfolioStocks, setLoadingPortfolioStocks] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
    
    const [lastStockFetch, setLastStockFetch] = useState<Date | null>(null);
    const navigate = useNavigate();

    // Fetch authenticated user from API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsAuthenticated(false);
                    return;
                }

                // below basically checks if there is a current user, if not, notis and portfolios are not
                const response = await axios.get("https://hypet-145797464141.us-central1.run.app/api/notifications/user/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setIsAuthenticated(false);
            }
        };

        fetchUser();
    }, []);

    // Load saved portfolio selection from localStorage
    useEffect(() => {
        if (isAuthenticated) {
            const savedPortfolioId = localStorage.getItem("selectedPortfolioId");
            if (savedPortfolioId) {
                // We'll set the selectedPortfolio after we fetch portfolios
                // Just keeping the ID for now
                const portfolioId = parseInt(savedPortfolioId);
                
                // Fetch portfolios and then set selected portfolio
                fetchPortfolios().then((fetchedPortfolios) => {
                    const portfolio = fetchedPortfolios.find((p: { portfolio_id: number; }) => p.portfolio_id === portfolioId);
                    if (portfolio) {
                        setSelectedPortfolio(portfolio);
                    }
                });
            }
        }
    }, [isAuthenticated]);
    
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
        if (!isAuthenticated) return;
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                return;
            }
            
            const response = await axios.put(
                `${API_BASE_URL}/notifications/mark-all-read/`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                // Update local state
                setNotifications(notifications.map(notification => ({
                    ...notification,
                    is_read: true
                })));
            }
        } catch (err) {
            console.error("Failed to mark notifications as read:", err);
        }
    };
 
    // Mark a single notification as read
    const markAsRead = async (notificationId: number) => {
        if (!isAuthenticated) return;
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                return;
            }
            
            const response = await axios.put(
                `${API_BASE_URL}/notifications/mark-read/${notificationId}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                // Update local state
                setNotifications(notifications.map(notification => 
                    notification.notification_id === notificationId ? {...notification, is_read: true} : notification
                ));
            }
        } catch (err) {
            console.error(`Failed to mark notification ${notificationId} as read:`, err);
        }
    };
 
    // Toggle notification panel
    const toggleNotifications = () => {
        if (!isAuthenticated) {
            // Redirect to login or show login prompt
            navigate('/login', { state: { returnUrl: window.location.pathname } });
            return;
        }
        
        setShowNotifications(!showNotifications);
        
        // If opening notifications and user is authenticated, fetch latest
        if (!showNotifications && isAuthenticated) {
            fetchNotifications();
        }
    };
    
    // Fetch notifications from backend
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            setLoadingNotifications(true);
            const token = localStorage.getItem("token");
            
            if (!token) {
                console.error("No authentication token found");
                setLoadingNotifications(false);
                return;
            }
            
            const response = await axios.get(
                `${API_BASE_URL}/notifications/user/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                setNotifications(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoadingNotifications(false);
        }
    }, [isAuthenticated]);

    // Fetch notifications on component mount if user is authenticated
    useEffect(() => {
        if (isAuthenticated) { // TODO userId &&
            fetchNotifications();
            
            // Check for notifications every minute
            const intervalId = setInterval(fetchNotifications, 60000);
            return () => clearInterval(intervalId); // Clean up on unmount
        }
    }, [isAuthenticated, fetchNotifications]);

    // Fetch top 20 stocks from the backend - Initial load
    const fetchTopStocks = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const response = await axios.get(`${API_BASE_URL}/stocks/top/?limit=20`, { headers });
            
            if (response.status === 200) {
                setStockList(response.data);
                setLastStockFetch(new Date());
            }
        } catch (err) {
            console.error("Failed to fetch stocks:", err);
            setError("Failed to load stocks. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user portfolios
    const fetchPortfolios = useCallback(async () => {
        if (!isAuthenticated) return [];
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                return [];
            }
            
            const response = await axios.get(
                `${API_BASE_URL}/portfolios`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                setPortfolios(response.data);
                return response.data;
            }
            return [];
        } catch (err) {
            console.error("Failed to fetch portfolios:", err);
            return [];
        }
    }, [isAuthenticated]);

    // Fetch stocks in a portfolio
    const fetchPortfolioStocks = useCallback(async (portfolioId: number) => {
        if (!isAuthenticated) return;
        
        try {
            setLoadingPortfolioStocks(true);
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                setLoadingPortfolioStocks(false);
                return;
            }
            
            const response = await axios.get(
                `${API_BASE_URL}/portfolios/${portfolioId}/stocks`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                setPortfolioStocks(response.data);
            }
        } catch (err) {
            console.error(`Failed to fetch stocks for portfolio ${portfolioId}:`, err);
        } finally {
            setLoadingPortfolioStocks(false);
        }
    }, [isAuthenticated]);

    // Search for stocks
    const searchStocks = useCallback(async (query: string) => {
        if (!query.trim() || !isAuthenticated) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        
        try {
            setLoadingSearch(true);
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                setLoadingSearch(false);
                return;
            }
            
            const response = await axios.get(
                `${API_BASE_URL}/stocks/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const lowerSearch = query.toLowerCase();
            
            const match = response.data.filter((s: { ticker: string; stock_name: string; }) =>
                s.ticker.toLowerCase().includes(lowerSearch) ||
                s.stock_name.toLowerCase().includes(lowerSearch)
            );
            setSearchResults(match);
            
            if (response.status === 200) {
                setSearchResults(match);
                setShowSearchResults(true);
            }
        } catch (err) {
            console.error("Failed to search for stocks:", err);
        } finally {
            setLoadingSearch(false);
        }
    }, [isAuthenticated]);

    // Add stock to portfolio
    const addStockToPortfolio = useCallback(async (stockId: number) => {
        if (!isAuthenticated || !selectedPortfolio) return;
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                return;
            }
            
            const response = await axios.post(
                `${API_BASE_URL}/portfolios/${selectedPortfolio.portfolio_id}/stocks/${stockId}`,
                { stock_id: stockId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200 || response.status === 201) {
                // Refresh portfolio stocks
                fetchPortfolioStocks(selectedPortfolio.portfolio_id);
                // Clear search
                setSearchQuery("");
                setSearchResults([]);
                setShowSearchResults(false);
            }
        } catch (err) {
            console.error(`Failed to add stock to portfolio:`, err);
        }
    }, [isAuthenticated, selectedPortfolio, fetchPortfolioStocks]);

    // Remove stock from portfolio
    const removeStockFromPortfolio = useCallback(async (stockId: number) => {
        if (!isAuthenticated || !selectedPortfolio) return;
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                return;
            }
            
            const response = await axios.delete(
                `${API_BASE_URL}/portfolios/${selectedPortfolio.portfolio_id}/stocks/${stockId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                // Refresh portfolio stocks
                fetchPortfolioStocks(selectedPortfolio.portfolio_id);
            }
        } catch (err) {
            console.error(`Failed to remove stock from portfolio:`, err);
        }
    }, [isAuthenticated, selectedPortfolio, fetchPortfolioStocks]);

    // Handle portfolio selection
    const handlePortfolioSelect = useCallback((portfolio: Portfolio) => {
        setSelectedPortfolio(portfolio);
        localStorage.setItem("selectedPortfolioId", portfolio.portfolio_id.toString());
        fetchPortfolioStocks(portfolio.portfolio_id);
    }, [fetchPortfolioStocks]);

    // Initial stock fetch
    useEffect(() => {
        fetchTopStocks();

        // If authenticated, fetch portfolios
        if (isAuthenticated) {
            fetchPortfolios();
        }
    }, [fetchTopStocks, fetchPortfolios, isAuthenticated]);

    // Fetch portfolio stocks when a portfolio is selected
    useEffect(() => {
        if (selectedPortfolio) {
            fetchPortfolioStocks(selectedPortfolio.portfolio_id);
        }
    }, [selectedPortfolio, fetchPortfolioStocks]);

    // Set up polling for stock updates
    useEffect(() => {
        // Only set up polling if we've already done the initial fetch
        // if (!lastStockFetch) return;
        
        const stockUpdateInterval = setInterval(async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                
                // Update top stocks
                const response = await axios.get(`${API_BASE_URL}/stocks/top/?limit=20`, { headers });
                
                if (response.status === 200) {
                    const newStocks: Stock[] = response.data;
                    
                    // Compare with previous stock data to detect sentiment changes
                    stockList.forEach(oldStock => {
                        const newStock = newStocks.find((s: Stock) => s.stock_id === oldStock.stock_id);

                        /*createSentimentChangeNotification(
                            oldStock.stock_id,
                            oldStock.stock_name,
                            5, // OLD SENT
                            7 // NEW SENT
                        ); */
                        
                        if (newStock && oldStock.sentiment !== undefined && newStock.sentiment !== undefined) {
                            const sentimentDiff = Math.abs(newStock.sentiment - oldStock.sentiment);
                            
                            // Check if sentiment changed by 2 or more
                            if (sentimentDiff >= 2 && isAuthenticated) {
                                // Create a notification about the significant sentiment change
                                createSentimentChangeNotification(
                                    oldStock.stock_id,
                                    oldStock.stock_name,
                                    oldStock.sentiment,
                                    newStock.sentiment
                                );
                            }
                        }
                    });
                    
                    // Update the stock list
                    setStockList(newStocks);
                }
                
                // Update portfolio stocks if a portfolio is selected
                if (selectedPortfolio) {
                    await fetchPortfolioStocks(selectedPortfolio.portfolio_id);
                }
            } catch (err) {
                console.error("Failed to update stocks:", err);
            }
        }, 300000); // Check every 5 minutes
        
        return () => clearInterval(stockUpdateInterval);
    }, [lastStockFetch, isAuthenticated, stockList, selectedPortfolio, fetchPortfolioStocks]);

    // Create a notification for significant sentiment changes
    const createSentimentChangeNotification = async (
        stockId: number,
        stockName: string,
        oldSentiment: number,
        newSentiment: number
    ) => {
        if (!isAuthenticated) return;
        
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            
            const direction = newSentiment > oldSentiment ? "positive" : "negative";
            const message = `Significant ${direction} sentiment change for ${stockName}: from ${oldSentiment.toFixed(1)} to ${newSentiment.toFixed(1)}`;
            
            // Call the API endpoint to create a notification
            await axios.post(
                `${API_BASE_URL}/notifications/create`,
                {
                    message: message,
                    stock_id: stockId
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Refresh notifications
            fetchNotifications();
        } catch (err) {
            console.error("Failed to create sentiment change notification:", err);
        }
    };

    // Fetch sentiment data when a stock is selected
    useEffect(() => {
        if (pickStock) {
            const fetchSentiment = async () => {
                try {
                    setLoadingSentiment(true);
                    // Convert time period to days for API
                    const interval = timeButton === "Day" ? 1 : timeButton === "Week" ? 7 : 30;
                    
                    const token = localStorage.getItem("token");
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                    
                    const response = await axios.get(
                        `${API_BASE_URL}/stocks/sentiment/${pickStock.stock_id}?interval=${interval}`,
                        { headers }
                    );
                    
                    if (response.status === 200) {
                        setSentimentData(response.data);
                    }
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
    };

    // Function to determine sentiment color based on value
    const getSentimentColor = (sentiment: number | undefined): string => {
        if (sentiment === undefined) return "#888888"; // gray if no sentiment
        
        if (sentiment > 5) return "#4CAF50"; // Strong positive - green
        if (sentiment > 0) return "#8BC34A"; // Positive - light green
        if (sentiment === 0) return "#9E9E9E"; // Neutral - gray
        if (sentiment > -5) return "#FF9800"; // Negative - orange
        return "#F44336"; // Strong negative - red
    };

    // Function to handle search input changes
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length >= 2) {
            searchStocks(query);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />

                <div className="stock-page-container">
                    {/* Notification Button */}
                    {isAuthenticated && (
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
                    )}

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
                    
                    {/* Portfolio Selection */}
                    {isAuthenticated && (
                        <div className="portfolio-section">
                            <div className="portfolio-selection">
                                <label htmlFor="portfolio-select">Select Portfolio:</label>
                                <select 
                                    id="portfolio-select"
                                    value={selectedPortfolio?.portfolio_id || ""}
                                    onChange={(e) => {
                                        const portfolioId = parseInt(e.target.value);
                                        const portfolio = portfolios.find(p => p.portfolio_id === portfolioId);
                                        if (portfolio) {
                                            handlePortfolioSelect(portfolio);
                                        } else {
                                            setSelectedPortfolio(null);
                                            localStorage.removeItem("selectedPortfolioId");
                                            setPortfolioStocks([]);
                                        }
                                    }}
                                >
                                    <option value="">-- Select a Portfolio --</option>
                                    {portfolios.map((portfolio) => (
                                        <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                                            {portfolio.portfolio_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Stock Search for Portfolio (only visible when a portfolio is selected) */}
                            {selectedPortfolio && (
                                <div className="stock-search-section">
                                    <div className="search-container">
                                        <input 
                                            type="text"
                                            placeholder="Search for stocks to add..."
                                            value={searchQuery}
                                            onChange={handleSearchInputChange}
                                            className="stock-search-input"
                                        />
                                        {loadingSearch && <span className="search-loading">Searching...</span>}
                                    </div>
                                    
                                    {showSearchResults && searchResults.length > 0 && (
                                        <div className="search-results">
                                            {searchResults.map((stock) => (
                                                <div 
                                                    key={stock.stock_id} 
                                                    className="search-result-item"
                                                    onClick={() => addStockToPortfolio(stock.stock_id)}
                                                >
                                                    <span className="search-ticker">{stock.ticker + "\t"}</span>
                                                    <span className="break">{" | "}</span>
                                                    <span className="search-name">{stock.stock_name}</span>
                                                    <button className="add-to-portfolio-btn">+ Add</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {showSearchResults && searchResults.length === 0 && searchQuery.trim() !== "" && (
                                        <div className="no-search-results">
                                            No stocks found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* S&P 500 Top Stocks */}
                    {!loading && !error && (
                        <div className="stocks-section">
                            <h2 className="section-title">S&P 500 Top Stocks</h2>
                            <div className="stocks-grid">
                                {stockList.map((stock) => (
                                    <div 
                                        className="stock-card" 
                                        key={`top-${stock.ticker}`}
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
                        </div>
                    )}
                    
                    {/* Portfolio Stocks Section */}
                    {isAuthenticated && selectedPortfolio && (
                        <div className="portfolio-stocks-section">
                            <h2 className="section-title">{selectedPortfolio.portfolio_name} Stocks</h2>
                            
                            {loadingPortfolioStocks ? (
                                <div className="loading-container">
                                    Loading portfolio stocks...
                                </div>
                            ) : portfolioStocks.length > 0 ? (
                                <div className="stocks-grid">
                                    {portfolioStocks.map((stock) => (
                                        <div 
                                            className="stock-card" 
                                            key={`portfolio-${stock.ticker}`}
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
                                            <button 
                                                className="remove-from-portfolio-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent opening stock details
                                                    removeStockFromPortfolio(stock.stock_id);
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-portfolio">
                                    <p>No stocks in this portfolio. Use the search box above to add stocks.</p>
                                </div>
                            )}
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

                                    <MarketValue file={pickStock.ticker} />
                                    //@ts-ignore
                                    <AreaGraph file={pickStock.ticker}/>
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
