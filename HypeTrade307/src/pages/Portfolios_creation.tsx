import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Portfolio {
    portfolio_id: number;
    portfolio_name: string;
}

export default function Portfolios_creation() {
    const [portfolioName, setPortfolioName] = useState<string>("");
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

    // Optionally load portfolios from backend in useEffect
    useEffect(() => {
        async function fetchPortfolios() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://127.0.0.1:8000/portfolios", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPortfolios(response.data);
            } catch (error) {
                console.error("Failed to fetch portfolios", error);
            }
        }
        fetchPortfolios();
    }, []);

    const createPortfolio = async () => {
        if (portfolioName.trim()) {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.post(
                    "http://127.0.0.1:8000/portfolios",
                    { portfolio_name: portfolioName },
                    {
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    }
                );
                // Assuming response returns the new portfolio:
                setPortfolios([...portfolios, response.data]);
                setPortfolioName("");
            } catch (error) {
                console.error("Error creating portfolio", error);
                alert("Failed to create portfolio");
            }
        }
    };
    const removePortfolio = async (portfolioId: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://127.0.0.1:8000/portfolios/${portfolioId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPortfolios((prevPortfolios) => prevPortfolios.filter((p) => p.portfolio_id !== portfolioId));
        } catch (error) {
            console.error("Error deleting portfolio", error);
            alert("Failed to delete portfolio");
        }
    };

    return (
        <div>
            <h1>Welcome to your Portfolios</h1>
            <h2>Create a Portfolio</h2>
            <input
                placeholder="Enter Portfolio Name"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
            />
            <button onClick={createPortfolio}>Create Portfolio</button>

            <h3>Portfolios</h3>
            <ul>
                {portfolios.length === 0 ? (
                    <p>No Portfolios created.</p>
                ) : (
                    portfolios.map((portfolio) => (
                        <li key={portfolio.portfolio_id}>
                            <Link to={`/Portfolios/${portfolio.portfolio_id}`}>{portfolio.portfolio_name}</Link>
                            <button 
                                style={{marginLeft: "1rem"}}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this portfolio?")) {
                                        removePortfolio(portfolio.portfolio_id);
                                    }
                                }}
                            >Remove</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
