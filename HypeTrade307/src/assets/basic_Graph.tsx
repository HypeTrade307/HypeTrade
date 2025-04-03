import React, {useEffect, useState} from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";

// Define TypeScript type for data
interface DataPoint {
    date: string;
    value: number;
}

// Function to fetch data from JSON file
const fetchData = async (): Promise<DataPoint[]> => {
    try {
        const response = await fetch("/data.json");

        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const MyGraph: React.FC = () => {
    const [data, setChartData] = useState<DataPoint[]>([]);
    const [lastN, setLastN] = useState<number>(3); // default to last 3 items
    useEffect(() => {
        fetchData().then(setChartData);

    }, []);

    // Function to fetch data on button click
    const handleFetchData = async () => {
        const fetchedData = await fetchData();
        // Ensure lastN isn't greater than data length.
        const lastNItems = fetchedData.slice(-lastN);
        setChartData(lastNItems);
    };

    const handleResetData = async () => {
        const fetchedData = await fetchData();
        setChartData(fetchedData);
    };
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
                <button onClick={handleFetchData} style={{ padding: "8px 16px", cursor: "pointer" }}>
                    Fetch Data
                </button>
                <button
                    onClick={handleResetData}
                    style={{ padding: "8px 16px", cursor: "pointer", marginLeft: "10px" }}
                >
                    Reset Data
                </button>
            </div>
                <ResponsiveContainer width="102%" height={300}>
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <CartesianGrid vertical={false} strokeDasharray="2"/>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#fa8fd8"
                            strokeWidth={2}

                            dot={{ stroke: "#fa8fd8", strokeWidth: 2 }} // Blue dots
                            isAnimationActive={false}
                            data={data.map((point) => (point.value ? point : { ...point, value: null }))}
                        />
                    </LineChart>
                </ResponsiveContainer>

        </div>
    );
};

export default MyGraph;
