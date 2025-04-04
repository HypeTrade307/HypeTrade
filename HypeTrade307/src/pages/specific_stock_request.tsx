import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import "./specific_stock.css";

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

interface SentimentRequest {
    ticker: string;
    stock_id: number;
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
    const [timeframe, setTimeframe] = useState<string>("week");
    const [numResults, setNumResults] = useState<number>(5);

    // Check authentication
    const isAuthenticated = !!localStorage.getItem("token");

    // Fetch stocks for typeahead
    useEffect(() => {
        async function fetchStocks() {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                const response = await axios.get("http://127.0.0.1:8000/stocks", {
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
        // Automatically fetch sentiment data when a stock is selected
        fetchSentimentData(stock.stock_id);
    };

    // Fetch sentiment data for a stock
    const fetchSentimentData = async (stockId: number) => {
        if (!stockId) return;

        try {
            setIsFetchingSentiment(true);
            setError("");

            const token = localStorage.getItem("token");
            if (!token) {
                setError("You must be logged in to view stock sentiment");
                setIsFetchingSentiment(false);
                return;
            }

            // Use the new API endpoint to get last n sentiment values
            const response = await axios.get(
                `http://127.0.0.1:8000/specific-stock/${stockId}?n=${numResults}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSentimentData(response.data);
            setIsFetchingSentiment(false);
        } catch (err: any) {
            console.error("Error fetching sentiment data:", err);
            if (err.response?.status === 404) {
                setSentimentData([]);
                setError("No sentiment data available for this stock.");
            } else {
                setError(err.response?.data?.detail || "Failed to fetch sentiment data");
            }
            setIsFetchingSentiment(false);
        }
    };

    // Request sentiment analysis update
    const handleRequestUpdate = async () => {
        if (!selectedStock) {
            setError("Please select a stock first");
            return;
        }

        try {
            setIsFetchingSentiment(true);
            setError("");

            const token = localStorage.getItem("token");
            if (!token) {
                setError("You must be logged in to request sentiment analysis");
                setIsFetchingSentiment(false);
                return;
            }

            const requestData: SentimentRequest = {
                ticker: selectedStock.ticker,
                stock_id: selectedStock.stock_id
            };

            // Request sentiment analysis
            await axios.post("http://127.0.0.1:8000/specific-stock/request", requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // After requesting, fetch the updated data
            await fetchSentimentData(selectedStock.stock_id);
        } catch (err: any) {
            console.error("Error requesting sentiment analysis:", err);
            setError(err.response?.data?.detail || "Failed to request sentiment analysis");
            setIsFetchingSentiment(false);
        }
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