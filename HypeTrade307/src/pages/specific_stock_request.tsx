//@ts-nocheck
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import "./specific_stock.css";
//@ts-ignore
import { API_BASE_URL } from '../config';

// Define interfaces
interface Stock {
    stock_id: number;
    ticker: string;
    stock_name: string;
}

interface SentimentData {
    timestamp: string;
    sentiment_score: number;
    article_count: number;
}

function SpecificStockRequest() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // For typeahead
    const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
    const [stockSearch, setStockSearch] = useState("");
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    // For sentiment data
    const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
    const [isFetchingSentiment, setIsFetchingSentiment] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [updateStatus, setUpdateStatus] = useState<string>("");

    // Check authentication
    const isAuthenticated = !!localStorage.getItem("token");

    // Fetch stocks for typeahead
    useEffect(() => {
        async function fetchStocks() {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                const response = await axios.get("https://hypet-145797464141.us-central1.run.app/api/stocks/", {
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
    }, []);

    // Filter stocks based on search input
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

    // Select stock from dropdown
    const handleSelectStock = (stock: Stock) => {
        setSelectedStock(stock);
        setStockSearch(`${stock.ticker} - ${stock.stock_name}`);
        setFilteredStocks([]);

        // Simulate fetching sentiment data with hard-coded values
        setIsFetchingSentiment(true);

        // Simulate API call delay
        setTimeout(() => {
            const isRecentlyUpdated = stock.stock_id % 2 === 0;

            if (isRecentlyUpdated) {
                setLastUpdated("15 minutes ago");
                setUpdateStatus("Recently scraped.");
                setSentimentData(generateSentimentData(0.3));
            } else {
                setLastUpdated("45 minutes ago");
                setUpdateStatus("Currently scraping again. Please wait for 15 minutes.");
                setSentimentData(generateSentimentData(0.7));
            }

            setIsFetchingSentiment(false);
        }, 500);
    };

    // Generate mock sentiment data
    const generateSentimentData = (baseSentiment: number): SentimentData[] => {
        const data: SentimentData[] = [];
        const now = new Date();

        for (let i = 0; i < 5; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Create a slight variation in sentiment scores
            const variation = (Math.random() - 0.5) * 0.1;

            data.push({
                timestamp: date.toISOString(),
                sentiment_score: baseSentiment + variation,
                article_count: Math.floor(Math.random() * 20) + 5
            });
        }

        return data;
    };

    // Request sentiment analysis update - now just simulates an update
    const handleRequestUpdate = () => {
        if (!selectedStock) {
            setError("Please select a stock first");
            return;
        }

        setIsFetchingSentiment(true);
        setError("");

        // Simulate API call delay
        setTimeout(() => {
            // Always set to "recently updated" after requesting an update
            setLastUpdated("Just now");
            setUpdateStatus("Recently scraped.");
            setSentimentData(generateSentimentData(0.3));
            setIsFetchingSentiment(false);
        }, 1500);
    };

    // Helper function to get sentiment color based on score
    const getSentimentColor = (score: number) => {
        if (score > 0.05) return "positive";
        if (score < -0.05) return "negative";
        return "neutral";
    };

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Navbar />
            <div className="post-container">
                <div className="post-header-section">
                    <h1 className="post-title-main">Stock Sentiment Analysis</h1>
                    <p>Select a stock to view its sentiment analysis or request an update</p>
                </div>

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

                    {error && <div className="error-message">{error}</div>}

                    {/* Display sentiment results directly under the input */}
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

                            {/* Last updated section */}
                            {lastUpdated && (
                                <div className="last-updated-container">
                                    <div className="last-updated">
                                        <strong>Last updated on: </strong>{lastUpdated}
                                    </div>
                                    <div className="update-status">
                                        {updateStatus}
                                    </div>
                                </div>
                            )}

                            {isFetchingSentiment ? (
                                <div className="loading-indicator">Loading sentiment data...</div>
                            ) : sentimentData.length > 0 ? (
                                <div className="sentiment-results">
                                    <div className="sentiment-list">
                                        {sentimentData.map((data, index) => (
                                            <div key={index} className="sentiment-item">
                                                <div className="sentiment-date">
                                                    {new Date(data.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className={`sentiment-score ${getSentimentColor(data.sentiment_score)}`}>
                                                    {data.sentiment_score.toFixed(4)}
                                                </div>
                                                <div className="article-count">
                                                    Articles: {data.article_count}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="sentiment-average">
                                        <strong>Average Sentiment: </strong>
                                        <span className={`${getSentimentColor(
                                            sentimentData.reduce((sum, item) => sum + item.sentiment_score, 0) / sentimentData.length
                                        )}`}>
                                            {(sentimentData.reduce((sum, item) => sum + item.sentiment_score, 0) / sentimentData.length).toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-data-message">
                                    No sentiment data available for this stock. Click "Request Update" to analyze.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {loading && !selectedStock && <div className="loading-indicator">Loading stocks...</div>}
            </div>
        </AppTheme>
    );
}

export default SpecificStockRequest;