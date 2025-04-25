import React, {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {API_BASE_URL} from '../config';

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

export default function StockSearch({sendDataToParent, setChartNumber: number}) {

    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [error, setError] = useState("");

    const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
    const [stockSearch, setStockSearch] = useState("");
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);

    const [pickStock, setPickStock] = useState<Stock | null>(null);
    const [data, setData] = useState("");
    const [chartNumber, setChartNumber] = useState(0);


    // // Handle portfolio selection
    // const handlePortfolioSelect = useCallback((portfolio: Portfolio) => {
    //     setSelectedPortfolio(portfolio);
    //     localStorage.setItem("selectedPortfolioId", portfolio.portfolio_id.toString());
    //     fetchPortfolioStocks(portfolio.portfolio_id);
    // }, [fetchPortfolioStocks]);
    //
    // // Initial stock fetch
    // useEffect(() => {
    //     fetchTopStocks();
    //
    //     // If authenticated, fetch portfolios
    //     if (isAuthenticated) {
    //         fetchPortfolios();
    //     }
    // }, [fetchTopStocks, fetchPortfolios, isAuthenticated]);
    //
    // // Fetch portfolio stocks when a portfolio is selected
    // useEffect(() => {
    //     if (selectedPortfolio) {
    //         fetchPortfolioStocks(selectedPortfolio.portfolio_id);
    //     }
    // }, [selectedPortfolio, fetchPortfolioStocks]);


    const handleStockClick = useCallback((pickStock: Stock) => {
        // sendDataToParent(data);

        setPickStock(pickStock);
        console.log("pickStock", pickStock);
        setChartNumber(chartNumber + number);
        console.log("chartNumber", chartNumber);
        console.log("number", number);


        console.log("chartNumber", chartNumber);

        sendDataToParent(pickStock, number);

        setChartNumber(0);
        setStockSearch("");
        setFilteredStocks([]);
    }, [setPickStock, setChartNumber]);

    // //1. Fetch the portfolio
    // useEffect(() => {
    //   async function fetchPortfolio() {
    //     try {
    //       const token = localStorage.getItem("token");
    //       if (!token) {
    //         setError("Not authenticated");
    //         return;
    //       }
    //       const response = await axios.get(`${API_BASE_URL}/portfolios/${id}`, {
    //         headers: { Authorization: `Bearer ${token}` }
    //       });
    //       setPortfolio(response.data);
    //     } catch (err: any) {
    //       console.error(err);
    //       setError(err.response?.data?.detail || "Portfolio not found");
    //     }
    //   }
    //   fetchPortfolio();
    // }, [id]);
    // useEffect(() => {
    //   if (id) {
    //     localStorage.setItem("currentPortfolioId", id);
    //   }
    // }, [id]);

    // 2. Fetch all stocks for the typeahead
    useEffect(() => {
        async function fetchStocks() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get(`${API_BASE_URL}/stocks`, {
                    headers: {Authorization: `Bearer ${token}`}
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


    // TODO: Replace this with just adding the stocks to a temporary selection. Don't need to save via api
    // 4. Add Stock to Portfolio
    async function addStockToPortfolio(stock_id: number) {
        try {
            const token = localStorage.getItem("token");
            if (!token || !portfolio) return;

            const response = await axios.post(
                `${API_BASE_URL}/portfolios/${portfolio.portfolio_id}/stocks/${stock_id}`,
                {},
                {headers: {Authorization: `Bearer ${token}`}}
            );

            setPortfolio(response.data);
            setStockSearch("");
            setFilteredStocks([]);

        } catch (error) {
            console.error("Error adding stock:", error);
        }
    }

    // // 5. Remove Stock
    // async function removeStock(stock_id: number) {
    //   try {
    //     const token = localStorage.getItem("token");
    //     if (!token || !portfolio) return;
    //
    //     const response = await axios.delete(
    //       `${API_BASE_URL}/portfolios/${portfolio.portfolio_id}/stocks/${stock_id}`,
    //       { headers: { Authorization: `Bearer ${token}` } }
    //     );
    //     setPortfolio(response.data);
    //   } catch (error) {
    //     console.error("Error removing stock:", error);
    //   }
    // }


    return (

        <div style={{
            // padding: "2rem",
            maxWidth: "800px",
            margin: "0 auto",
            color: "white"
        }}>

            {/*<div>*/}
            {/*  <input type="text" value={data} onChange={(e) => setData(e.target.value)} />*/}
            {/*  <button onClick={handleStockClick}>Send Data to Parent</button>*/}
            {/*</div>*/}

            <div>
                <label>Search Stock:</label>
                <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    style={{marginLeft: "6px"}}
                />
                {filteredStocks.length > 0 && (
                    <div style={{
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        color: "#000",
                        marginTop: "4px"
                    }}>
                        {filteredStocks.map(stock => (
                            <div
                                key={stock.stock_id}
                                style={{padding: "4px", cursor: "pointer"}}
                                onClick={() => handleStockClick(stock)}
                            >
                                {stock.ticker} - {stock.stock_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
