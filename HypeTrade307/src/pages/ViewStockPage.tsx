//@ts-nocheck
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MarketValue from "../assets/basic_Graph.tsx";
import AreaGraph from "../assets/area_Graph.tsx";
import { API_BASE_URL } from "../config";
import "../stocks.css";

export default function ViewStockPopupPage() {
  const { tkr } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState<any | null>(null);
  const [sentimentData, setSentimentData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [timeButton, setTimeButton] = useState<"Day" | "Week" | "Month">("Day");

  const portfolioId = localStorage.getItem("currentPortfolioId");

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const stockRes = await axios.get(`${API_BASE_URL}/stocks/`, { headers });
        const match = stockRes.data.find((s: any) => s.ticker === tkr?.toUpperCase());

        if (match) {
          setStock(match);
        }
      } catch (e) {
        console.error("Error fetching stock", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [tkr]);

  useEffect(() => {
    const fetchSentiment = async () => {
      if (!stock) return;

      try {
        setLoadingSentiment(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const interval = timeButton === "Day" ? 1 : timeButton === "Week" ? 7 : 30;

        const res = await axios.get(
          `${API_BASE_URL}/stocks/sentiment/${stock.stock_id}?interval=${interval}`,
          { headers }
        );

        setSentimentData(res.data);
      } catch (e) {
        console.error("Error fetching sentiment", e);
      } finally {
        setLoadingSentiment(false);
      }
    };

    fetchSentiment();
  }, [stock, timeButton]);

  const getSentimentColor = (sentiment: number | undefined): string => {
    if (sentiment === undefined) return "#888888";
    if (sentiment > 5) return "#4CAF50";
    if (sentiment > 0) return "#8BC34A";
    if (sentiment === 0) return "#9E9E9E";
    if (sentiment > -5) return "#FF9800";
    return "#F44336";
  };

  const getGraphTitle = () => {
    if (!stock) return "No stock selected";
    if (loadingSentiment) return `Loading ${stock.stock_name}'s data...`;
    return `${stock.stock_name}'s performance over the last ${timeButton}`;
  };

  if (loading) return <div>Loading...</div>;
  if (!stock) return <div>Stock not found.</div>;

  return (
    <>
      {portfolioId && (
        <button
          onClick={() => navigate(`/Portfolios/${portfolioId}`)}
          style={{
            margin: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            position: "absolute",
            top: "1rem",
            left: "1rem",
            zIndex: 9999,
          }}
        >
          ← Back to Portfolio
        </button>
      )}

      <div className="hud-container">
        <div className="hud-box">

          <div className="stock-detail-header">
            <h2>{stock.stock_name} ({stock.ticker})</h2>
            <div className="detail-change">${stock.value?.toLocaleString()}</div>
          </div>

          <div className="stock-info-grid">
            <div className="info-item">
              <span className="info-label">Analysis Mode</span>
              <span className="info-value">{stock.analysis_mode}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sentiment</span>
              <span
                className="sentiment-badge"
                style={{ backgroundColor: getSentimentColor(stock.sentiment) }}
              >
                {stock.sentiment}
              </span>
            </div>
          </div>

          <div className="time-controls">
            <div className="time-label">Time Period</div>
            <div className="time-buttons-container">
              {["Day", "Week", "Month"].map((period) => (
                <button
                  key={period}
                  className={`time-button ${timeButton === period ? "active" : ""}`}
                  onClick={() => setTimeButton(period as any)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">{getGraphTitle()}</h3>
            <MarketValue file={stock.ticker} />
            <AreaGraph ticker={stock.ticker} />
          </div>
        </div>
      </div>
    </>
  );
}
