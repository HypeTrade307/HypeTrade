import {useState} from "react";
import "../stocks.css";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";

interface Stock {
    name: string;
    abbreviation: string;
    value: number;
    sentiment: number;
}

type TimePeriod = "Day" | "Week" | "Month";

function  ViewStock(props: {disableCustomTheme?: boolean }) {
    const [pickStock, setPickStock] = useState<Stock | null>(null); // Way to know if a stock was selected
    const [timeButton, setTimeButton] = useState<TimePeriod>("Day"); // Day is the default value

    const stockList: Stock[] = [
        { name: "Apple", abbreviation: "AAPL", value: 180, sentiment: 5.12 },
        { name: "Tesla", abbreviation: "TSLA", value: 700, sentiment: -6.27 },
        { name: "Nvidia", abbreviation: "NVDA", value: 450, sentiment: 9.85 }
    ];

    const getGraph = (): string => {
        if (!pickStock) {
            return "No stock selected";
        }

        // Right now, it just displays the time period, but later we can populate the graph here too

        return `${pickStock.name}'s performance over the last ${timeButton}`;
    }

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />

                <Navbar />

                <div>
                    <h2 className="title">Top 20 Stox</h2>

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
                                <button
                                    className="cancel"
                                    onClick={() => {setPickStock(null) ; setTimeButton("Day")}}
                                >
                                    x
                                </button>
                                <h2>
                                    {pickStock.name} ({pickStock.abbreviation})
                                </h2>
                                <p className="add something here">Stock Value: ${pickStock.value}</p>
                                <p className="add something here">Sentiment: {pickStock.sentiment}</p>

                                <ul className="button-list">
                                    <button
                                        className="time-buttons"
                                        onClick={() => setTimeButton("Month")}
                                        >
                                        Month
                                    </button>

                                    <button
                                        className="time-buttons"
                                        onClick={() => setTimeButton("Week")}
                                    >
                                        Week
                                    </button>

                                    <button
                                        className="time-buttons"
                                        onClick={() => setTimeButton("Day")}
                                    >
                                        Day
                                    </button>
                                </ul>

                                <div>
                                    <p>{getGraph()}</p>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </AppTheme>
        </>
    )
}

export default ViewStock;