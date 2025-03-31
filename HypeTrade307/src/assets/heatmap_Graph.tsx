
import { Treemap, ResponsiveContainer } from 'recharts';

// Function to determine color based on value
const getColor = (value: number) => {

    if (value > 0) {
        return `rgb(0, ${Math.min(255, 50 + value * 5)}, 0)`; // Green for positive values
    } else {
        return `rgb(${Math.min(255, 50 + Math.abs(value) * 5)}, 0, 0)`; // Red for negative values
    }
};

// Example data
const data = [
    { name: 'A', size: 400 },
    { name: 'B', size: -300 },
    { name: 'C', size: 100 },
    { name: 'D', size: -200 },
    { name: 'E', size: 500 },
];

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
const processedData = data.map(item => ({
    ...item,
    value: Math.abs(item.size), // value and size are |x| and x to each other
}));

const HeatMap = () => {
    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <Treemap data={processedData} dataKey="value" stroke="#fff" content={CustomizedContent} />
            </ResponsiveContainer>
        </div>
    );
};

export default HeatMap;
