import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TooltipProps } from "recharts";

interface DataPoint {
    timestamp: string;
    value: number;
}

interface AreaGraphProps {
    ticker: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;
        return (
            <div style={{ background: "#000", padding: "10px", border: "1px solid #ccc", color: "white" }}>
                <p><strong>Value:</strong> {data.value}</p>
                <p><strong>Date:</strong> {new Date(data.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    hour12: true
                })}</p>
            </div>
        );
    }
    return null;
};

const AreaGraph: React.FC<AreaGraphProps> = ({ ticker }) => {
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const [lastN, setLastN] = useState<number>(3);
    const [error, setError] = useState<boolean>(false);

    const fetchStockIdAndData = async (n: number) => {
        try {
            // Step 1: Get stock ID from ticker
            const idRes = await fetch(`/api/stocks/${ticker}/id`);
            if (!idRes.ok) throw new Error("Failed to fetch stock ID");
            const { stock_id } = await idRes.json();

            // Step 2: Fetch sentiment data
            const dataRes = await fetch(`/api/specific-stock/${stock_id}?n=${n}`);
            if (!dataRes.ok) throw new Error("Failed to fetch sentiment data");
            const data = await dataRes.json();

            setChartData(data.reverse());
            setError(false);
        } catch (err) {
            console.error(err);
            setChartData([]);
            setError(true);
        }
    };

    useEffect(() => {
        fetchStockIdAndData(lastN);
    }, [ticker, lastN]);

    const calculateGradientOffset = (data: DataPoint[]) => {
        if (data.length === 0) return 1;
        const dataMax = Math.max(...data.map(i => i.value));
        const dataMin = Math.min(...data.map(i => i.value));
        if (dataMax <= 0) return 0;
        if (dataMin >= 0) return 1;
        return dataMax / (dataMax - dataMin);
    };

    const off = calculateGradientOffset(chartData);

    if (error) {
        return <p style={{ color: "white" }}>No sentiment data found for ticker: {ticker}</p>;
    }

    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ color: "black"}} htmlFor="lastNInput">Fetch last n values: </label>
                <input
                    id="lastNInput"
                    type="number"
                    value={lastN}
                    onChange={(e) => setLastN(Number(e.target.value))}
                    style={{ width: "75px", marginRight: "10px" }}
                />
                <button onClick={() => fetchStockIdAndData(lastN)} style={{ padding: "8px 16px", cursor: "pointer" }}>
                    Fetch Data
                </button>
                <button onClick={() => fetchStockIdAndData(999)} style={{ padding: "8px 16px", marginLeft: "10px" }}>
                    Reset Data
                </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="2" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(timestamp) =>
                            new Date(timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true
                            })
                        }
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
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

export default AreaGraph;
