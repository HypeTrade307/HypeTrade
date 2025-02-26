import {useState} from "react";
import "../stocks.css";

interface Stock {
    name: string;
    abbreviation: string;
    value: number;
    sentiment: number;
}

function  ViewStock() {
    const [pickStock, setPickStock] = useState<Stock | null>(null); // Way to know if a stock was selected

    const stockList: Stock[] = [
        { name: "Apple", abbreviation: "AAPL", value: 180, sentiment: 5.12 },
        { name: "Tesla", abbreviation: "TSLA", value: 700, sentiment: -6.27 },
        { name: "Nvidia", abbreviation: "NVDA", value: 450, sentiment: 9.85 }
    ];


    return (
        <div>
            <h1 className="title">Top 20 Stox</h1>
            <ul className="stock-list">
                {stockList.map((stock) => (
                    // key is what will show, which will be a stock name in this case
                    // and when the name is clicked, it will update the front end's status to display
                    // a stock-specific window
                    <div>
                        <button
                            className="stock-button"
                            key={stock.name}
                            // className="px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => setPickStock(stock)}
                        >
                            {stock.name}
                        </button>
                    </div>
                ))}
            </ul>

            {pickStock && (
                <div
                    className="hud-container"
                    onClick={() => setPickStock(null)} // Click outside to close
                >
                    <div
                        className="hud-box"
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                    >
                        <button onClick={() => setPickStock(null)}
                        >
                            x
                        </button>
                        <h2>
                            {pickStock.name} ({pickStock.abbreviation})
                        </h2>
                        <p className="text-lg mt-2">Stock Value: ${pickStock.value}</p>
                        <p className="text-lg">Sentiment: {pickStock.sentiment}</p>
                        <div>
                            <p>Graph Placeholder</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewStock;