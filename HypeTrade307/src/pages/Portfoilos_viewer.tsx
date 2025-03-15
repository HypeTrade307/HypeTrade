import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Page_Not_found from "./Page_Not_found.tsx";

interface Portfolio {
    id: number;
    name: string;
}

export default function PortfolioPage() {
    const { id } = useParams<{ id: string }>();  // Grab the portfolio ID from the URL
    const navigate = useNavigate();
    const [stockName, setStockName] = useState<string>("");  // State for stock name
    const [stocks, setStocks] = useState<string[]>([]);  // State for list of stocks
    const [portfolio, setPortfolio] = useState<Portfolio | undefined>(undefined);  // State for portfolio data

    // Fetch portfolios and stocks from localStorage on component mount Portfolios
    useEffect(() => {
        const storedPortfolios = localStorage.getItem("Portfolios");
        if (storedPortfolios) {
            const portfolios: Portfolio[] = JSON.parse(storedPortfolios);
            const foundPortfolio = portfolios.find((portfolio) => portfolio.id.toString() === id);
            setPortfolio(foundPortfolio);

            // Load stocks for the portfolio from localStorage
            if (foundPortfolio) {
                const storedStocks = localStorage.getItem(`stocks_${foundPortfolio.id}`);
                if (storedStocks) {
                    setStocks(JSON.parse(storedStocks));
                }
            }
        }
    }, [id]);

    // Save stocks to localStorage whenever they change
    useEffect(() => {
        if (portfolio) {
            localStorage.setItem(`stocks_${portfolio.id}`, JSON.stringify(stocks));
        }
    }, [stocks, portfolio]);

    // Handle adding a stock
    const addStock = () => {
        if (stockName.trim()) {
            setStocks([...stocks, stockName]);
            setStockName("");  // Reset stock name input
        }
    };

    // If portfolio is not found, display an error message
    if (!portfolio) {
        return Page_Not_found();
    }

    return (
        <div>
            <button
                onClick={() => navigate("/")}  // Navigate back to the home page
            >
                Back to Home
            </button>

            <h2>Portfolio {portfolio.name}</h2>
            <div >
                <input
                    placeholder="Stock Name"
                    value={stockName}
                    onChange={(e) => setStockName(e.target.value)}  // Update stock name
                />
                <button
                    onClick={addStock}  // Add stock to the list
                >
                    Add Stock
                </button>
            </div>

            <ul>
                {stocks.length === 0 ? (
                    <p>No stocks added yet.</p>
                ) : (
                    stocks.map((stock, index) => (
                        <li key={index} className="border-b py-2">{stock}</li>  // List added stocks
                    ))
                )}
            </ul>
        </div>
    );
}
