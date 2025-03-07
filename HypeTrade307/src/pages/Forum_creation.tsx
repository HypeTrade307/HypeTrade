import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForumCreation = () => {
  const [title, setTitle] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [availableStocks, setAvailableStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 1. Fetch all stocks for the typeahead
  useEffect(() => {
    async function fetchStocks() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://127.0.0.1:8000/stocks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableStocks(response.data);
      } catch (error) {
        console.error("Failed to fetch stocks", error);
      }
    }
    fetchStocks();
  }, []);

  // 2. Filter stocks for typeahead when stockSearch changes
  useEffect(() => {
    if (!stockSearch) {
      setFilteredStocks([]);
      return;
    }
    const lowerSearch = stockSearch.toLowerCase();
    const matches = availableStocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(lowerSearch) ||
        s.stock_name.toLowerCase().includes(lowerSearch)
    );
    setFilteredStocks(matches);
  }, [stockSearch, availableStocks]);

  // 3. Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !selectedStock) {
      setError("Title and stock are required.");
      return;
    }

    try {
      // Posting the data to the API to create a thread
      const response = await axios.post(
        "http://127.0.0.1:8000/api/threads", // Ensure the endpoint is correct
        {
          title,
          stock_id: selectedStock.stock_id, // Use the selected stock's ID
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        navigate(`/thread/${response.data.thread_id}`); // Navigate to the thread page
      } else {
        setError("Failed to create thread.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the thread.");
    }
  };

  // Handle stock selection and hide suggestions
  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setStockSearch(stock.ticker); // Update the input field with the selected stock's ticker
    setFilteredStocks([]); // Clear suggestions
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>Back to Home</button>
      <h2>Create a New Thread</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Thread Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ position: "relative" }}>
          <label htmlFor="stockSearch">Search for Stock</label>
          <input
            type="text"
            id="stockSearch"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            placeholder="Start typing stock name or ticker"
          />
          {filteredStocks.length > 0 && (
            <div
              style={{
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#000",
                position: "absolute",
                zIndex: 999,
                marginTop: "4px",
                width: "100%",
              }}
            >
              {filteredStocks.map((stock) => (
                <div
                  key={stock.stock_id}
                  style={{ padding: "4px", cursor: "pointer" }}
                  onClick={() => handleStockSelect(stock)} // Use the new function
                >
                  {stock.ticker} - {stock.stock_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit">Create Thread</button>
      </form>
    </div>
  );
};

export default ForumCreation;