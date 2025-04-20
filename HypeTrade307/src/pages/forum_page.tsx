import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import "./Forum.css";

// Define interfaces
interface Thread {
    thread_id: number;
    title: string;
    creator_id: number;
    stock_id: number;
    created_at: string;
    stock_ref?: {
        ticker: string;
        stock_name: string;
    };
}

interface Stock {
    stock_id: number;
    ticker: string;
    stock_name: string;
}

function Forum() {
    const navigate = useNavigate();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState("");
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    // For typeahead
    const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
    const [stockSearch, setStockSearch] = useState("");
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);

    // Fetch threads
    useEffect(() => {
        async function fetchThreads() {
            try {
                const token = localStorage.getItem("token");
                // if (!token) {
                //     setError("Not authenticated");
                //     setLoading(false);
                //     return;
                // }

                const response = await axios.get("https://hypet-145797464141.us-central1.run.app/api/api/threads/", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setThreads(response.data);
            } catch (err: any) {
                console.error("Error fetching threads:", err);
                setError(err.response?.data?.detail || "Failed to load threads");
            } finally {
                setLoading(false);
            }
        }

        fetchThreads();
    }, []);

    // Fetch stocks for typeahead
    useEffect(() => {
        async function fetchStocks() {
            try {
                const token = localStorage.getItem("token");
                // if (!token) {
                //     setError("Not authenticated");
                //     return;
                // }

                const response = await axios.get("https://hypet-145797464141.us-central1.run.app/api/api/stocks", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setAvailableStocks(response.data);
            } catch (err) {
                console.error("Failed to fetch stocks", err);
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

    // Create thread
    const handleCreateThread = async () => {
        if (!title || !selectedStock) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            console.log("Token being sent:", token);
            // if (!token) {
            //     setError("Not authenticated");
            //     return;
            // }

            const response = await axios.post(
                "https://hypet-145797464141.us-central1.run.app/api/api/threads/",
                {
                    title: title,
                    stock_id: selectedStock.stock_id,
                    // creator_id:
                },
                {
                    headers: { Authorization: `Bearer ${token}` }                }
            );

            // Navigate to the new thread page
            navigate(`/thread/${response.data.thread_id}`);
        } catch (err: any) {
            console.error("Full error response:", err.response?.data);
            setError(JSON.stringify(err.response?.data, null, 2));  // Pretty print error
            // console.error("Error creating thread:", err);
            // setError(err.response?.data?.detail || "Failed to create thread");
        }
    };

    // Select stock from dropdown
    const handleSelectStock = (stock: Stock) => {
        setSelectedStock(stock);
        setStockSearch(`${stock.ticker} - ${stock.stock_name}`);
        setFilteredStocks([]);
    };

    // Reset modal
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setTitle("");
        setSelectedStock(null);
        setStockSearch("");
    };

    // Handle clicks outside the modal to close it
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
            handleCloseModal();
        }
    };

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Navbar />
            <div className="forum-container">
                <div className="forum-header">
                    <h1>Forum</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="create-thread-button"
                    >
                        Create Thread
                    </button>
                </div>

                {/* Thread List */}
                <div className="thread-list">
                    {loading ? (
                        <div className="loading-indicator">Loading threads...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : threads.length > 0 ? (
                        threads.map((thread) => (
                            <div
                                key={thread.thread_id}
                                className="thread-item"
                                onClick={() => navigate(`/thread/${thread.thread_id}`)}
                            >
                                <div className="thread-title">{thread.title}</div>
                                {thread.stock_ref && (
                                    <div className="thread-stock">
                    <span className="stock-badge">
                      {thread.stock_ref.ticker}
                    </span>
                                    </div>
                                )}
                                <div className="thread-date">
                                    {new Date(thread.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No threads available. Create one!</div>
                    )}
                </div>

                {/* Create Thread Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={handleOverlayClick}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Create New Thread</h2>
                                <button className="close-button" onClick={handleCloseModal}>×</button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="thread-title">Thread Title:</label>
                                    <input
                                        id="thread-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter thread title"
                                        className="thread-title-input"
                                    />
                                </div>

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
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="create-button"
                                    onClick={handleCreateThread}
                                    disabled={!title || !selectedStock}
                                >
                                    Create Thread
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppTheme>
    );
}

export default Forum;