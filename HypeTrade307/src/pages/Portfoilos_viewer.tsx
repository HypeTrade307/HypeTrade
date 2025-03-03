// portfolios_viewer.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Page_Not_found from "./Page_Not_found.tsx";

interface Portfolio {
    portfolio_id: number;
    name: string;
    stocks: string[]; // Adjust type if stocks are objects
}

export default function PortfolioPage() {
    const { id } = useParams<{ id: string }>(); // Get portfolio id from URL
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <Page_Not_found />;
    }

    return (
        <div>
            <button onClick={() => navigate("/")}>Back to Home</button>
            <h2>Portfolio: {portfolio?.name}</h2>
            <ul>
                {portfolio?.stocks && portfolio.stocks.length > 0 ? (
                    portfolio.stocks.map((stock, index) => (
                        <li key={index} className="border-b py-2">{stock}</li>
                    ))
                ) : (
                    <p>No stocks added yet.</p>
                )}
            </ul>
        </div>
    );
}
