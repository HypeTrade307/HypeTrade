import React, {useEffect, useState} from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
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
    const [data, setData] = useState<DataPoint[]>([]);
    const [lastN, setLastN] = useState<number>(3); // default to last 3 items
    useEffect(() => {
        fetchData().then(setData);
    }, []);

    // Function to fetch data on button click
    const handleFetchData = async () => {
        const fetchedData = await fetchData();
        // Use slice to get the last n values; ensure n isn't greater than data length
        const lastNItems = fetchedData.slice(-lastN);
        setData(lastNItems);
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
            </div>
                <ResponsiveContainer width="102%" height={300}>
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#ea0e85" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>

        </div>
    );
};

export default MyGraph;
