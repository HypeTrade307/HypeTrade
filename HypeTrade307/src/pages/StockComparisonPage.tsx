import React, {useCallback, useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./stockComp.css";
import { API_BASE_URL } from "../config";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import StockSearch from "@/components/StockSearch.tsx";
import AppTheme from "../components/shared-theme/AppTheme";
import Navbar from "@/components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import MarketValue from "@/assets/basic_Graph.tsx";
import AreaGraph from "@/assets/area_Graph.tsx";
// import ViewStockPage from "@/pages/ViewStockPage.tsx";

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

interface Stock {
  stock_id: number;
  stock_name: string;
  ticker: string;
  analysis_mode: string;
  value?: number;
  sentiment?: number;
  previousSentiment?: number; // Added to track sentiment changes
}

export default function StockComparisonPage(props: { disableCustomTheme?: boolean }) {
  const { tkr } = useParams();
  // const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [stock1, setStock1] = useState<Stock | null>(null);
  const [stock2, setStock2] = useState<Stock | null>(null);
  const [stock3, setStock3] = useState<Stock | null>(null);
  // const [sentimentData, setSentimentData] = useState<number[]>([]);
  const [sentimentData1, setSentimentData1] = useState<number[]>([]);
  const [sentimentData2, setSentimentData2] = useState<number[]>([]);
  const [sentimentData3, setSentimentData3] = useState<number[]>([]);
  const [loadingSentiment, setLoadingSentiment] = useState<boolean>(false);
  // const [loading, setLoading] = useState(true);
  const [timeButton, setTimeButton] = useState<"Day" | "Week" | "Month">("Day");

  const [error, setError] = useState("");

  const [chartNumber, setChartNumber] = useState(0);

  function handleDataFromChild(stock: Stock, chartNumber: number) {

    console.log("handleDataFromChild");
    console.log("stock:", stock);
    console.log("chartNumber:", chartNumber);

    if (chartNumber == 1) {
      setStock1(stock);
    } else if (chartNumber == 2) {
      setStock2(stock);
    } else {
      setStock3(stock);
    }

    console.log("chartNumber:", chartNumber);
    setChartNumber(chartNumber);
    console.log("chartNumber after setting:", chartNumber);
  }

  useEffect(() => {
    const fetchStock = async (chartNumber: number) => {
      try {

        console.log("inside compPage fetchStock");

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const stockRes = await axios.get(`${API_BASE_URL}/stocks/`, { headers });
        const match = stockRes.data.find((s: any) => s.ticker === tkr?.toUpperCase());

        if (match) {
          if (chartNumber == 1) {
            setStock1(match);
          } else if (chartNumber == 2) {
            setStock2(match);
          } else {
            setStock3(match);
          }
        }

      } catch (e) {
        console.error("Error fetching stock", e);
      // } finally {
      //   setLoading(false);
      }
    };
    fetchStock(chartNumber);
  }, [tkr]);

  useEffect(() => {
    const fetchSentiment = async () => {

      console.log("inside compPage fetchSentiment");

      console.log("chartNumber:", chartNumber);

      if (chartNumber == 1) {
        setStock(stock1);
      } else if (chartNumber == 2) {
        setStock(stock2);
      } else {
        setStock(stock3);
      }

      if (!stock) return;

      console.log("stock:", stock);

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const interval = timeButton === "Day" ? 1 : timeButton === "Week" ? 7 : 30;

        const res = await axios.get(
          `${API_BASE_URL}/stocks/sentiment/${stock.stock_id}?interval=${interval}`,
          { headers }
        );

        console.log("stock:", stock);
        console.log("setSentimentData:", res.data);

        if (chartNumber == 1) {
          setSentimentData1(res.data);
        } else if (chartNumber == 2) {
          setSentimentData2(res.data);
        } else {
          setSentimentData3(res.data);
        }

        // setSentimentData(res.data);
      } catch (e) {
        console.error("Error fetching sentiment", e);
      }
    };

    fetchSentiment();
  }, [stock, stock1, stock2, stock3, timeButton]);

  const getGraph = (chartNumber: number): string => {

    if (!stock1 && !stock2 && !stock3) {
      return "No stock selected";
    }

    if (loadingSentiment) {
      switch (chartNumber) {
        case 1:
          if (stock1) return `Loading ${stock1.stock_name}'s data...`;
          break;
        case 2:
          if (stock2) return `Loading ${stock2.stock_name}'s data...`;
          break;
        default:
          if (stock3) return `Loading ${stock3.stock_name}'s data...`;
      }
    }

    switch (chartNumber) {
      case 1:
        if (stock1) return `${stock1.stock_name}'s performance over the last ${timeButton}`;
        break;
      case 2:
        if (stock2) return `${stock2.stock_name}'s performance over the last ${timeButton}`;
        break;
      default:
        if (stock3) return `${stock3.stock_name}'s performance over the last ${timeButton}`;
    }
  };

  const getSentimentColor = (sentiment: number | undefined): string => {
    if (sentiment === undefined) return "#888888";
    if (sentiment > 5) return "#4CAF50";
    if (sentiment > 0) return "#8BC34A";
    if (sentiment === 0) return "#9E9E9E";
    if (sentiment > -5) return "#FF9800";
    return "#F44336";
  };

  const getGraphTitle = (chartNumber: number) => {

    console.log("inside getGraphTitle");
    console.log("chartNumber", chartNumber);

    if (chartNumber == 1) {
      if (!stock1) {
        console.log("No stock selected for stock1");
        return "No stock1 selected";
      } else {
        return `${stock1.stock_name}'s performance over the last ${timeButton}`;
      }
    } else if (chartNumber == 2) {
      if (!stock2) {
        console.log("No stock selected for stock2");
        return "No stock2 selected";
      } else {
        return `${stock2.stock_name}'s performance over the last ${timeButton}`;
      }
    } else {
      if (!stock3) {
        console.log("No stock selected for stock3");
        return "No stock3 selected";
      } else {
        return `${stock3.stock_name}'s performance over the last ${timeButton}`;
      }
    }
  };

  return (
    <>
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Navbar />

        <div className="sc-hud-container">
          <Box>

            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="flex-start"
                spacing={1}
            >

              <Grid item xs={12}>
                <h2>Stock Comparison</h2>
              </Grid>


              <Grid item xs={12} sm={6}>
                {/*Spot for chart 1*/}
                <h2>Stock Chart 1:</h2>

                <StockSearch
                    sendDataToParent={handleDataFromChild}
                    setChartNumber={1}
                />

                {stock1 ? (

                    <>
                      <div className="sc-small-hud-container">
                      <div
                          className="sc-hud-box"
                          onClick={(e) => e.stopPropagation()}
                      >
                          <button
                              className="cancel"
                              onClick={() => {
                                setStock1(null);
                                setTimeButton("Day");
                              }}
                          >
                            x
                          </button>

                          <div className="stock-detail-header">
                            <h2>
                              {stock1.stock_name} ({stock1.ticker})
                            </h2>
                            <div className="detail-change">
                              ${stock1.value?.toLocaleString()}
                            </div>
                          </div>

                          <div className="stock-info-grid">
                            <div className="info-item">
                              <span className="info-label">Analysis Mode</span>
                              <span className="info-value">{stock1.analysis_mode}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Sentiment</span>
                              <span
                                  className="sentiment-badge"
                                  // style={{backgroundColor: getSentimentColor(stock1.sentiment)}}
                                  style={{backgroundColor: getSentimentColor(stock1.sentimentData1)}}
                              >
                                {stock1.sentiment}
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

                        {/*<div className="time-controls">*/}
                        {/*  <div className="time-label">Time Period</div>*/}
                        {/*  <div className="time-buttons-container">*/}
                        {/*    {["Day", "Week", "Month"].map((period) => (*/}
                        {/*        <button*/}
                        {/*            key={period}*/}
                        {/*            className={`time-button ${timeButton === period ? "active" : ""}`}*/}
                        {/*            onClick={() => setTimeButton(period as any)}*/}
                        {/*        >*/}
                        {/*          {period}*/}
                        {/*        </button>*/}
                        {/*    ))}*/}
                        {/*  </div>*/}
                        {/*</div>*/}

                          <div className="chart-container">
                            <h3 className="chart-title">{getGraph(1)}</h3>
                            <MarketValue file={stock1.ticker}/>
                            <AreaGraph file={stock1.ticker}/>
                          </div>
                        </div>
                      </div>
                    </>

                ) : (
                    <div className="not-found">Post not found</div>
                )}

                {/*)}*/}
              </Grid>

              <Grid item xs={12} sm={6}>
                {/*Spot for chart 2*/}
                <h2>Stock Chart 2:</h2>
                <StockSearch
                    sendDataToParent={handleDataFromChild}
                    setChartNumber={2}
                />

                {stock2 ? (

                    <>
                      <div className="sc-small-hud-container">
                        <div
                            className="sc-hud-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                          <button
                              className="cancel"
                              onClick={() => {
                                setStock1(null);
                                setTimeButton("Day");
                              }}
                          >
                            x
                          </button>

                          <div className="stock-detail-header">
                            <h2>
                              {stock2.stock_name} ({stock2.ticker})
                            </h2>
                            <div className="detail-change">
                              ${stock2.value?.toLocaleString()}
                            </div>
                          </div>

                          <div className="stock-info-grid">
                            <div className="info-item">
                              <span className="info-label">Analysis Mode</span>
                              <span className="info-value">{stock2.analysis_mode}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Sentiment</span>
                              <span
                                  className="sentiment-badge"
                                  style={{backgroundColor: getSentimentColor(stock2.sentiment)}}
                              >
                                {stock2.sentiment}
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

                          {/*<div className="time-controls">*/}
                          {/*  <div className="time-label">Time Period</div>*/}
                          {/*  <div className="time-buttons-container">*/}
                          {/*    {["Day", "Week", "Month"].map((period) => (*/}
                          {/*        <button*/}
                          {/*            key={period}*/}
                          {/*            className={`time-button ${timeButton === period ? "active" : ""}`}*/}
                          {/*            onClick={() => setTimeButton(period as any)}*/}
                          {/*        >*/}
                          {/*          {period}*/}
                          {/*        </button>*/}
                          {/*    ))}*/}
                          {/*  </div>*/}
                          {/*</div>*/}

                          <div className="chart-container">
                            <h3 className="chart-title">{getGraph(2)}</h3>
                            <MarketValue file={stock2.ticker}/>
                            <AreaGraph file={stock2.ticker}/>
                          </div>
                        </div>
                      </div>
                    </>

                ) : (
                    <div className="not-found">Post not found</div>
                )}
              </Grid>

            </Grid>

            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
            >
              <Grid item xs={12}>
                {/*Spot for the combined chart*/}
                <h2>Combined Chart:</h2>

                {stock3 ? (

                    <>
                      <div className="sc-small-hud-container">
                        <div
                            className="sc-hud-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                          <button
                              className="cancel"
                              onClick={() => {
                                setStock1(null);
                                setTimeButton("Day");
                              }}
                          >
                            x
                          </button>

                          <div className="stock-detail-header">
                            <h2>
                              {stock3.stock_name} ({stock3.ticker})
                            </h2>
                            <div className="detail-change">
                              ${stock3.value?.toLocaleString()}
                            </div>
                          </div>

                          <div className="stock-info-grid">
                            <div className="info-item">
                              <span className="info-label">Analysis Mode</span>
                              <span className="info-value">{stock3.analysis_mode}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Sentiment</span>
                              <span
                                  className="sentiment-badge"
                                  style={{backgroundColor: getSentimentColor(stock3.sentiment)}}
                              >
                                {stock3.sentiment}
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

                          {/*<div className="time-controls">*/}
                          {/*  <div className="time-label">Time Period</div>*/}
                          {/*  <div className="time-buttons-container">*/}
                          {/*    {["Day", "Week", "Month"].map((period) => (*/}
                          {/*        <button*/}
                          {/*            key={period}*/}
                          {/*            className={`time-button ${timeButton === period ? "active" : ""}`}*/}
                          {/*            onClick={() => setTimeButton(period as any)}*/}
                          {/*        >*/}
                          {/*          {period}*/}
                          {/*        </button>*/}
                          {/*    ))}*/}
                          {/*  </div>*/}
                          {/*</div>*/}

                          <div className="chart-container">
                            <h3 className="chart-title">{getGraph(3)}</h3>
                            <MarketValue file={stock3.ticker}/>
                            <AreaGraph file={stock3.ticker}/>
                          </div>
                        </div>
                      </div>
                    </>
                ) : (
                    <div className="not-found">Post not found</div>
                )}
              </Grid>
            </Grid>

          </Box>

        </div>
      </AppTheme>
    </>
  );
}
