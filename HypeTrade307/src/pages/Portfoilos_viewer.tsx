// @ts-nocheck
// portfolios_viewer.tsx

//@ts-ignore
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import Navbar from "../components/NavbarSection/Navbar";
import Page_Not_found from "./Page_Not_found";
import { API_BASE_URL } from '../config';

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

export default function PortfolioPage(props: { disableCustomTheme?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [availableStocks, setAvailableStocks] = useState<StockBase[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState<StockBase[]>([]);

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    { title: "View Portfolio", description: "This page shows all the stocks in your selected portfolio." },
    { title: "Add Stocks", description: "Use the search box to find stocks and add them to your portfolio." },
    { title: "Import CSV", description: "You can also import a CSV file to bulk add stocks." },
    { title: "Click to View", description: "Click on a stock to view all the stock details (similar to the ViewStock page)." },
    { title: "Done!", description: "You're ready to manage your portfolio!" }
  ];

  const nextStep = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      setTutorialOpen(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("tutorialMode") === "true") {
      setTutorialOpen(true);
    }
  }, []);

  //1. Fetch the portfolio
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const token = localStorage.getItem("token");
        console.log("Token in PortfolioPage:", token);
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/portfolios/${id}`, {
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
  useEffect(() => {
    if (id) {
      localStorage.setItem("currentPortfolioId", id);
    }
  }, [id]);
  // 2. Fetch all stocks for the typeahead
  useEffect(() => {
    async function fetchStocks() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/stocks/`, {
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
        `${API_BASE_URL}/portfolios/${portfolio.portfolio_id}/stocks/${stock_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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
        `${API_BASE_URL}/portfolios/${portfolio.portfolio_id}/stocks/${stock_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error removing stock:", error);
    }
  }

  //@ts-ignore
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
            `${API_BASE_URL}/portfolios/${portfolio.portfolio_id}/upload`, formData,
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

//@ts-ignore
  async function importPortfolioFromCSV(event: React.ChangeEvent<HTMLInputElement>) {
    const inputFile = event.target.files?.[0];
    try {
      if (inputFile) {
        await uploadFile(inputFile);
      }
    } catch (error) {
      console.log(error);
    }
  }


  if (loading) return <div>Loading...</div>;
  if (error) return <Page_Not_found />;

  // @ts-ignore
    return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "white" }}>
        <button onClick={() => navigate("/")}>Back to Home</button>
        <h2>Portfolio: {portfolio?.name}</h2>

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

        <ul style={{ listStyleType: "none", padding: 0 }}>
          {portfolio?.stocks && portfolio.stocks.length > 0 ? (
            portfolio.stocks.map((st, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <div
                  onClick={() => navigate(`/stocks/${st.ticker}`)}
                  style={{
                    cursor: "pointer",
                    color: "#4dabf5",
                    flex: 1,
                    padding: "4px",
                    borderRadius: "4px",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#2c2c2c")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {st.ticker} - {st.stock_name}
                </div>
                <button onClick={() => removeStock(st.stock_id)}>Remove</button>
              </li>
            ))
          ) : (
            <p>No stocks added yet.</p>
          )}
        </ul>

        <div>
          <label>Import existing portfolio from csv file:</label>
          <form onChange={importPortfolioFromCSV}>
            <input type="file" className="input" />
          </form>
        </div>
      </div>

      {tutorialOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '45%',
            right: '80%',
            zIndex: 9999,
            background: 'white',
            color: 'black',
            padding: '1rem',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            width: '320px'
          }}
        >
          <h3 style={{ marginTop: 0 }}>{tutorialSteps[step].title}</h3>
          <p>{tutorialSteps[step].description}</p>
          <button
            style={{ marginTop: '0.5rem', width: '100%' }}
            onClick={nextStep}
          >
            {step < tutorialSteps.length - 1 ? "Next" : "Finish"}
          </button>
        </div>
      )}
    </AppTheme>
  );
}
