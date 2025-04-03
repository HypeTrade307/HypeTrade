import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DataPoint {
    date: string;
    value: number;
}

const fetchData = async (): Promise<DataPoint[]> => {
    try {
        const response = await fetch("/data/.json");
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

// Function to calculate the gradient offset based on current data
const calculateGradientOffset = (data: DataPoint[]) => {
    if (data.length === 0) return 1; // default value when there's no data

    const dataMax = Math.max(...data.map((i) => i.value));
    const dataMin = Math.min(...data.map((i) => i.value));

    if (dataMax <= 0) {
        return 0;
    }
    if (dataMin >= 0) {
        return 1;
    }
    return dataMax / (dataMax - dataMin);
};

const Example: React.FC = () => {
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const [lastN, setLastN] = useState<number>(3); // default to last 3 items

    useEffect(() => {
        fetchData().then(setChartData);
    }, []);

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

    const off = calculateGradientOffset(chartData);

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
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="2"/>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <defs>
                        {/* Linear gradient to split between green (positive) and red (negative) */}
                        <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={off} stopColor="green" stopOpacity={1} />
                            <stop offset={off} stopColor="red" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#000"
                        fill="url(#splitColor)"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Example;
