// portfolios_viewer.tsx

import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Page_Not_found from "./Page_Not_found";

interface StockBase {
  stock_id: number;
  ticker: string;
  stock_name: string;
}

interface Portfolio {
  portfolio_id: number;
  name: string;
  stocks: StockBase[];  // an array of objects
}

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For typeahead
  const [availableStocks, setAvailableStocks] = useState<StockBase[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState<StockBase[]>([]);

  // 1. Fetch the portfolio
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://127.0.0.1:8000/portfolios/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPortfolio(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Portfolio not found");
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [id]);

  // 2. Fetch all stocks for the typeahead
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

  // 3. Filter for typeahead whenever stockSearch changes
  useEffect(() => {
    if (!stockSearch) {
      setFilteredStocks([]);
      return;
    }
    const lowerSearch = stockSearch.toLowerCase();
    const match = availableStocks.filter(s =>
      s.ticker.toLowerCase().includes(lowerSearch) ||
      s.stock_name.toLowerCase().includes(lowerSearch)
    );
    setFilteredStocks(match);
  }, [stockSearch, availableStocks]);

  // 4. Add Stock to Portfolio
  async function addStockToPortfolio(stock_id: number) {
    try {
      const token = localStorage.getItem("token");
      if (!token || !portfolio) return;

      const response = await axios.post(
        `http://127.0.0.1:8000/portfolios/${portfolio.portfolio_id}/stocks/${stock_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPortfolio(response.data);
      setStockSearch("");
      setFilteredStocks([]);
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  }

  // 5. Remove Stock
  async function removeStock(stock_id: number) {
    try {
      const token = localStorage.getItem("token");
      if (!token || !portfolio) return;

      const response = await axios.delete(
        `http://127.0.0.1:8000/portfolios/${portfolio.portfolio_id}/stocks/${stock_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error removing stock:", error);
    }
  }

  // 6. Import existing portfolio as csv file upload. Update the current portfolio to include csv data
  async function uploadFile(file) {

    // if (!file) return;
    if (file) {
      try {

        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("token");
        if (!token || !portfolio) return;

        const response = await axios.post(
            `http://127.0.0.1:8000/portfolios/${portfolio.portfolio_id}/upload`, formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`
              }
            }
        );

        setPortfolio(response.data);

      } catch (error) {
        console.error("Error updating portfolio", error);
      }
    }
  }


  async function importPortfolioFromCSV(event) {

    const inputFile = event.target.files[0];

    try {
      await uploadFile(inputFile);

    } catch (error) {
      console.log(error);
    }
  }


  if (loading) return <div>Loading...</div>;
  if (error) return <Page_Not_found />;

  return (
    <div>
      <button onClick={() => navigate("/")}>Back to Home</button>
      <h2>Portfolio: {portfolio?.name}</h2>

      {/* STOCK SEARCH INPUT */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Search Stock:</label>
        <input
          type="text"
          value={stockSearch}
          onChange={(e) => setStockSearch(e.target.value)}
          style={{ marginLeft: "6px" }}
        />
        {filteredStocks.length > 0 && (
          <div style={{
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            color: "#000",
            position: "absolute",
            zIndex: 999,
            marginTop: "4px"
          }}>
            {filteredStocks.map(stock => (
              <div
                key={stock.stock_id}
                style={{ padding: "4px", cursor: "pointer" }}
                onClick={() => addStockToPortfolio(stock.stock_id)}
              >
                {stock.ticker} - {stock.stock_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIST STOCKS IN PORTFOLIO */}
      <ul>
        {portfolio?.stocks && portfolio.stocks.length > 0 ? (
          portfolio.stocks.map((st, index) => (
            <li key={index}>
              {st.ticker} - {st.stock_name}
              <button style={{ marginLeft: "8px" }} onClick={() => removeStock(st.stock_id)}>
                Remove
              </button>
            </li>
          ))
        ) : (
          <p>No stocks added yet.</p>
        )}
      </ul>

      {/* Upload File Input */}
      <div>
        <label>Import existing portfolio from csv file:</label>
        <form onChange={event => importPortfolioFromCSV(event)}>
          <input type="file" className="input" />
        </form>
      </div>

    </div>
  );
}
