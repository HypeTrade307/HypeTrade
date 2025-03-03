import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Portfolios {
    id: number;
    name: string;
}

export default function Portfolios_creation() {
    const [PortfoliosName, setPortfoliosName] = useState<string>("");
    const [Portfolios, setPortfolios] = useState<Portfolios[]>([]);

    // Load saved Portfolios from localStorage
    useEffect(() => {
        const storedPortfolios = localStorage.getItem("Portfolios");
        if (storedPortfolios) {
            setPortfolios(JSON.parse(storedPortfolios));
        }
    }, []);

    // Save Portfolios to localStorage profile
    useEffect(() => {
        localStorage.setItem("Portfolios", JSON.stringify(Portfolios));
    }, [Portfolios]);

    const createPortfolios = () => {
        if (PortfoliosName.trim()) {
            const newPortfolios: Portfolios = { id: Date.now(), name: PortfoliosName };
            setPortfolios([...Portfolios, newPortfolios]);
            setPortfoliosName("");
        }
    };

    return (
        <div>
            <h1>Welcome to your Portfolios</h1>
            <h2>Create a Portfolio</h2>
            <input
                placeholder="Enter Portfolios Name"
                value={PortfoliosName}
                onChange={(e) => setPortfoliosName(e.target.value)}
            />
            <button onClick={createPortfolios}>
                Create Portfolios
            </button>

            <h3>Portfolios</h3>
            <ul>
                {Portfolios.length === 0 ? (
                    <p>No Portfolios created.</p>
                ) : (
                    Portfolios.map((Portfolios) => (
                        <li key={Portfolios.id} >
                            <Link
                                to={`/Portfolios/${Portfolios.id}`}
                            >
                                {Portfolios.name}
                            </Link>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
