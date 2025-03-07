// Threads_creation.tsx (combines creation and viewing)
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface StockBase {
  stock_id: number;
  ticker: string;
  stock_name: string;
}

interface Thread {
  thread_id: number;
  title: string;
  stock: StockBase;
  created_at: string;
}

export default function ForumPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockBase | null>(null);
  
  // Stock search functionality
  const [availableStocks, setAvailableStocks] = useState<StockBase[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState<StockBase[]>([]);

  // Fetch existing threads
  useEffect(() => {
    async function fetchThreads() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/threads", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setThreads(response.data);
      } catch (error) {
        console.error("Failed to fetch threads", error);
      }
    }
    fetchThreads();
  }, []);

  // Fetch all stocks for typeahead
  useEffect(() => {
    async function fetchStocks() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://127.0.0.1:8000/stocks", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableStocks(response.data);
      } catch (error) {
        console.error("Failed to fetch stocks", error);
      }
    }
    fetchStocks();
  }, []);

  // Filter stocks for search
  useEffect(() => {
    if (!stockSearch) {
      setFilteredStocks([]);
      return;
    }
    const lowerSearch = stockSearch.toLowerCase();
    setFilteredStocks(
      availableStocks.filter(s =>
        s.ticker.toLowerCase().includes(lowerSearch) ||
        s.stock_name.toLowerCase().includes(lowerSearch)
      )
    );
  }, [stockSearch, availableStocks]);

  // Create new thread
  const createThread = async () => {
    if (!newThreadTitle.trim() || !selectedStock) {
      alert("Please fill in all fields and select a stock");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/threads",
        {
          title: newThreadTitle,
          stock_id: selectedStock.stock_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setThreads([...threads, response.data]);
      setNewThreadTitle("");
      setSelectedStock(null);
      setStockSearch("");
    } catch (error) {
      console.error("Error creating thread", error);
      alert("Failed to create thread");
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>Back to Home</button>
      <h1>Forum Discussions</h1>

      {/* Thread Creation Section */}
      <div style={{ margin: "2rem 0" }}>
        <h2>Start New Discussion</h2>
        <input
          placeholder="Thread Title"
          value={newThreadTitle}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          style={{ marginRight: "1rem" }}
        />

        {/* Stock Selection */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <input
            placeholder="Search Stock..."
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          {filteredStocks.length > 0 && (
            <div style={{
              position: "absolute",
              zIndex: 1000,
              backgroundColor: "white",
              border: "1px solid #ddd",
              width: "100%"
            }}>
              {filteredStocks.map(stock => (
                <div
                  key={stock.stock_id}
                  style={{ padding: "0.5rem", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedStock(stock);
                    setStockSearch(`${stock.ticker} - ${stock.stock_name}`);
                    setFilteredStocks([]);
                  }}
                >
                  {stock.ticker} - {stock.stock_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={createThread}>Create Thread</button>
      </div>

      {/* Existing Threads List */}
      <h2>Recent Discussions</h2>
      <ul>
        {threads.map(thread => (
          <li key={thread.thread_id} style={{ margin: "1rem 0" }}>
            <Link to={`/threads/${thread.thread_id}`}>
              <strong>{thread.title}</strong> - {thread.stock.ticker}
            </Link>
            <span style={{ marginLeft: "1rem", color: "#666" }}>
              {new Date(thread.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}