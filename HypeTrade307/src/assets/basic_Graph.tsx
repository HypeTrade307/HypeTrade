import React, { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TooltipProps } from "recharts";
// Define TypeScript type for data
interface DataPoint {
    date: string;
    value: number;
}

interface MarketValueProps {
    file: string; // Prop to dynamically select the JSON file
}


const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
  
      console.log("Hovered data:", data); // Debug: check what keys exist
  
      return (
        <div style={{ background: "#000000 ", padding: "10px", border: "1px solid #ccc" }}>
          <p><strong>Value:</strong> {data.value}</p>
          <p><strong>Date:</strong> {data.date}</p>
        </div>
      );
    }
    return null;
  };


let check = 0;
const MarketValue: React.FC<MarketValueProps> = ({ file }) => {
    const [data, setChartData] = useState<DataPoint[]>([]);
    const [lastN, setLastN] = useState<number>(3); // Default to last 3 items

    // Construct the file path dynamically based on the passed file prop
    const filePath = `/market_value/${file}_history.json`;

    // Function to fetch data from JSON file
    const fetchData = async (): Promise<DataPoint[]> => {
        try {
            const response = await fetch(filePath);
            check = 1;
            return await response.json();

        } catch (error) {
            console.error("Error fetching data:", error);
            check = 0;
            return [];
        }
    };

    useEffect(() => {
        fetchData().then(setChartData);
    }, [filePath]); // Re-fetch data when filePath changes

    // Function to fetch last N data on button click
    const handleFetchData = async () => {
        const fetchedData = await fetchData();
        const lastNItems = fetchedData.slice(-lastN); // Get last N items
        setChartData(lastNItems);
    };

    const handleResetData = async () => {
        const fetchedData = await fetchData();
        setChartData(fetchedData);
    };
    if (check == 0) {
        return <div><p style={{ color: "black" }}>no market data found {file} is not a top 20 stock</p></div>;
    }
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "10px" }}>
                <label htmlFor="lastNInput">Fetch last n values: </label>
                <input
                    id="lastNInput"
                    type="number"
                    value={lastN}
                    onChange={(e) => setLastN(Number(e.target.value))}
                    style={{ width: "75px", marginRight: "10px" }}
                />
                <button onClick={handleFetchData} type="submit" className="submit-button">
                    Fetch Data
                </button>
                <button
                    onClick={handleResetData}
                    type="submit" className="submit-button"
                >
                    Reset Data
                </button>
            </div>
            <ResponsiveContainer width="102%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin-10', 'dataMax']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <CartesianGrid vertical={false} strokeDasharray="2" />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#fa8fd8"
                        strokeWidth={2}
                        dot={{ stroke: "#fa8fd8", strokeWidth: 2 }} // Pink dots
                        isAnimationActive={false}
                        data={data.map((point) => (point.value ? point : { ...point, value: null }))}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MarketValue;
