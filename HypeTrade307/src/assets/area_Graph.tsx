import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TooltipProps } from "recharts";
interface DataPoint {
    date: string;
    value: number;
}

interface AreaGraphProps {
    file: string;
}
let check = 0;

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
  



const AreaGraph: React.FC<AreaGraphProps> = ({ file }) => {
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const [lastN, setLastN] = useState<number>(3);
    

    
    const filePath = `seniment_value/${file}_random.json`;

    const fetchData = async (filePath: string): Promise<DataPoint[]> => {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error("File not found");
            const data = await response.json();
            check = 1;
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            check = 0;
            return [];
        }   
    };

    useEffect(() => {
        fetchData(filePath).then(setChartData);
    }, [filePath]);

    const handleFetchData = async () => {
        const fetchedData = await fetchData(filePath);
        const lastNItems = fetchedData.slice(-lastN);
        setChartData(lastNItems);
    };

    const handleResetData = async () => {
        const fetchedData = await fetchData(filePath);
        setChartData(fetchedData);
    };

    const calculateGradientOffset = (data: DataPoint[]) => {
        if (data.length === 0) return 1;
        const dataMax = Math.max(...data.map((i) => i.value));
        const dataMin = Math.min(...data.map((i) => i.value));
        if (dataMax <= 0) return 0;
        if (dataMin >= 0) return 1;
        return dataMax / (dataMax - dataMin);
    };

    const off = calculateGradientOffset(chartData);

    
    if (check == 0) {
        return <div><p style={{ color: "black" }}>no seniment data found {file} is not a top 20 stock</p></div>;
    }
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "10px" }}>
                <p>hiiiii {file} hhhhhhhhh</p>
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
                    <XAxis dataKey="date" color='black' />
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
