import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import "./specific_stock.css";
import { toast } from "react-toastify";
//@ts-ignore
import { API_BASE_URL } from '../config';

interface Stock {
    stock_id: number;
    ticker: string;
    stock_name: string;
}

interface SentimentData {
    timestamp: string;
    value: number;  // Changed to match API response
    article_count?: number;
}

function SpecificStockRequest() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stockError, setStockError] = useState("");
    const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
    const [stockSearch, setStockSearch] = useState("");
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
    const [isFetchingSentiment, setIsFetchingSentiment] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [updateStatus, setUpdateStatus] = useState<string>("");
    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        async function fetchStocks() {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/stocks/`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setAvailableStocks(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch stocks", err);
                setError("Failed to load available stocks");
                setLoading(false);
            }
        }
        fetchStocks();
        
        // Try to load the last selected stock from localStorage
        try {
            const saved = localStorage.getItem("last_selected_stock");
            if (saved) {
                const parsed = JSON.parse(saved);
                setSelectedStock(parsed);
                handleSelectStock(parsed);
            }
        } catch (err) {
            console.error("Error loading saved stock", err);
            // Clear potentially corrupted data
            localStorage.removeItem("last_selected_stock");
        }
    }, []);

    useEffect(() => {
        if (!stockSearch) {
            setFilteredStocks([]);
            return;
        }
        const lowerSearch = stockSearch.toLowerCase();
        const matches = availableStocks.filter(stock =>
            stock.ticker.toLowerCase().includes(lowerSearch) ||
            stock.stock_name.toLowerCase().includes(lowerSearch)
        );
        setFilteredStocks(matches);
    }, [stockSearch, availableStocks]);

    const handleSelectStock = async (stock: Stock) => {
        setSelectedStock(stock);
        setStockSearch(`${stock.ticker} - ${stock.stock_name}`);
        setFilteredStocks([]);
        setIsFetchingSentiment(true);
        setStockError(""); // Clear any previous stock-specific errors
        
        localStorage.setItem("last_selected_stock", JSON.stringify(stock));
        
        try {
            const res = await axios.get(`${API_BASE_URL}/specific-stock/${stock.stock_id}?n=5`);
            if (res.data && Array.isArray(res.data)) {
                setSentimentData(res.data);
                setLastUpdated("Fetched just now");
                setUpdateStatus("Live data loaded.");
            } else {
                console.error("Unexpected data format", res.data);
                setStockError("Received unexpected data format from server");
                setSentimentData([]);
            }
        } catch (err: any) {
            console.error("Failed to load sentiment data", err);
            
            // More specific error handling
            if (err.response) {
                if (err.response.status === 404) {
                    setStockError(`No sentiment data available for ${stock.ticker}. Try requesting an update.`);
                } else {
                    setStockError(`Error ${err.response.status}: ${err.response.data?.detail || 'Unknown error'}`);
                }
            } else if (err.request) {
                setStockError("Network error. Please check your connection.");
            } else {
                setStockError("An unexpected error occurred");
            }
            
            setSentimentData([]);
        } finally {
            setIsFetchingSentiment(false);
        }
    };

    const handleRequestUpdate = async () => {
        if (!selectedStock) {
            setError("Please select a stock first");
            return;
        }
        setIsFetchingSentiment(true);
        setError("");
        const token = localStorage.getItem("token");
        
        try {
            await axios.post(`${API_BASE_URL}/specific-stock/request`, {
                ticker: selectedStock.ticker,
                stock_id: selectedStock.stock_id
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            toast.success("Sentiment request submitted");
            setUpdateStatus("Update requested. Please check back later.");
        } catch (err: any) {
            console.error("Request update error:", err);
            
            // More specific error handling for the update request
            if (err.response) {
                toast.error(`Error: ${err.response.data?.detail || 'Request failed'}`);
            } else if (err.request) {
                toast.error("Network error. Please check your connection.");
            } else {
                toast.error("Failed to request sentiment analysis");
            }
        } finally {
            setIsFetchingSentiment(false);
        }
    };

    const getSentimentColor = (score: number) => {
        if (score > 0.05) return "positive";
        if (score < -0.05) return "negative";
        return "neutral";
    };

    // Handle application-wide error (show in UI but don't block rendering)
    if (loading && !selectedStock) {
        return (
            <AppTheme>
                <CssBaseline enableColorScheme />
                <Navbar />
                <div className="post-container">
                    <div className="loading-indicator">Loading stocks...</div>
                </div>
            </AppTheme>
        );
    }

    // Main render
    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Navbar />
            <div className="post-container">
                <div className="post-header-section">
                    <h1 className="post-title-main">Stock Sentiment Analysis</h1>
                    <p>Select a stock to view its sentiment analysis or request an update</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-section">
                    {!isAuthenticated && (
                        <div className="error-message">
                            Please log in to request stock sentiment analysis
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="stock-search">Select Stock:</label>
                        <div className="stock-search-container">
                            <input
                                id="stock-search"
                                type="text"
                                value={stockSearch}
                                onChange={(e) => setStockSearch(e.target.value)}
                                placeholder="Search by ticker or name"
                                className="stock-search-input"
                            />
                            {filteredStocks.length > 0 && (
                                <div className="stock-dropdown">
                                    {filteredStocks.map((stock) => (
                                        <div
                                            key={stock.stock_id}
                                            className="stock-option"
                                            onClick={() => handleSelectStock(stock)}
                                        >
                                            <span className="stock-ticker">{stock.ticker}</span>
                                            <span className="stock-name">{stock.stock_name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {selectedStock && (
                        <div className="sentiment-container">
                            <div className="sentiment-header">
                                <h3>Sentiment Analysis for {selectedStock.ticker}</h3>
                                <button
                                    className="update-button"
                                    onClick={handleRequestUpdate}
                                    disabled={!isAuthenticated || isFetchingSentiment}
                                >
                                    {isFetchingSentiment ? "Processing..." : "Request Update"}
                                </button>
                            </div>
                            
                            {lastUpdated && !stockError && (
                                <div className="last-updated-container">
                                    <div className="last-updated">
                                        <strong>Last updated on: </strong>{lastUpdated}
                                    </div>
                                    <div className="update-status">
                                        {updateStatus}
                                    </div>
                                </div>
                            )}
                            
                            {/* Display stock-specific errors */}
                            {stockError && <div className="error-message">{stockError}</div>}
                            
                            {isFetchingSentiment ? (
                                <div className="loading-indicator">Loading sentiment data...</div>
                            ) : sentimentData?.length > 0 ? (
                                <div className="sentiment-results">
                                    <div className="sentiment-list">
                                        {sentimentData.map((data, index) => (
                                            <div key={index} className="sentiment-item">
                                                <div className="sentiment-date">
                                                    {new Date(data.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className={`sentiment-score ${getSentimentColor(data.value)}`}>
                                                    {data.value.toFixed(4)}
                                                </div>
                                                <div className="article-count">
                                                    Articles: {data.article_count || 'N/A'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="sentiment-average">
                                        <strong>Average Sentiment: </strong>
                                        <span className={`${getSentimentColor(
                                            sentimentData.reduce((sum, item) => sum + item.value, 0) / sentimentData.length
                                        )}`}>
                                            {(sentimentData.reduce((sum, item) => sum + item.value, 0) / sentimentData.length).toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            ) : !stockError ? (
                                <div className="no-data-message">
                                    No sentiment data available for this stock. Click "Request Update" to analyze.
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </AppTheme>
    );
}

export default SpecificStockRequest;