// @ts-nocheck
import { useState, useEffect } from "react";
import { Treemap, ResponsiveContainer } from "recharts";

// Function to determine color based on value
const getColor = (value: number) => {
    if (value > 0) {
        return `rgb(0, ${Math.min(255, 50 + value * 5)}, 0)`; // Green for positive values
    } else {
        return `rgb(${Math.min(255, 50 + Math.abs(value) * 5)}, 0, 0)`; // Red for negative values
    }
};

// Custom renderer to apply colors dynamically
const CustomizedContent = (props) => {
    const { x, y, width, height, name, size } = props;
    const fillColor = getColor(size); // Color still based on actual value

    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fillColor} stroke="#fff" />
            <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14}>
                {name} ({size})
            </text>
        </g>
    );
};

const HeatMap = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("/data2.json")
            .then((response) => response.json())
            .then((jsonData) => {
                const processedData = jsonData.map((item) => ({
                    ...item,
                    value: Math.abs(item.size),
                }));
                setData(processedData);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>

                <Treemap data={data} dataKey="value" stroke="#fff" isAnimationActive={false} content={CustomizedContent} />
            </ResponsiveContainer>
        </div>
    );
};

export default HeatMap;
