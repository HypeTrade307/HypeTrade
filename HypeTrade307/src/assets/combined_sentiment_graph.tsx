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

interface SentValueProps {
    file1: string; // Prop to dynamically select the JSON file
    file2: string; // Prop to dynamically select the JSON file
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

const CombinedSentGraph: React.FC<SentValueProps> = ({ file1, file2 }) => {

    const [data, setChartData] = useState<DataPoint[]>([]);
    const [data1, setChartData1] = useState<DataPoint[]>([]);
    const [data2, setChartData2] = useState<DataPoint[]>([]);
    const [lastN, setLastN] = useState<number>(3); // Default to last 3 items
    const [ticker1, setTicker1] = useState("");
    const [ticker2, setTicker2] = useState("");

    // Construct the file path dynamically based on the passed file prop
    const filePath1 = `/market_value/${file1}_history.json`;
    const filePath2 = `/market_value/${file2}_history.json`;

    // Function to fetch data from JSON files
    const fetchData = async (number : number): Promise<DataPoint[]> => {
        try {

            setTicker1(file1);
            setTicker2(file2);

            if (number == 1) {
                const response1 = await fetch(filePath1);
                console.log("response1:", response1);
                return await response1.json();
            } else {
                const response2 = await fetch(filePath2);
                return await response2.json();
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            check = 0;
            return [];
        }
    };

    useEffect(() => {
        fetchData(1).then(setChartData1);
    }, [filePath1]); // Re-fetch data when filePath changes

    useEffect(() => {
        fetchData(2).then(setChartData2);
    }, [filePath2]); // Re-fetch data when filePath changes

    interface Company {
        ticker: string;
        date: string;
        value: number;
    }

    function groupByKey<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
        return array.reduce((hash, obj) => {
            const groupKey = String(obj[key]);
            hash[groupKey] = hash[groupKey] || [];
            hash[groupKey].push(obj);
            return hash;
        }, {} as Record<string, T[]>);
    }

    let company: Company[] = [];
    company = groupByKey(company, "ticker");

    console.log(company);

    // Function to fetch last N data on button click
    const handleFetchData = async () => {
        const fetchedData1 = await fetchData(1);
        const fetchedData2 = await fetchData(2);
        const lastNItems1 = fetchedData1.slice(-lastN); // Get last N items
        const lastNItems2 = fetchedData2.slice(-lastN); // Get last N items
        setChartData1(lastNItems1);
        setChartData2(lastNItems2);

        console.log("Data1", data1);
        console.log("Data2", data2);

        const inputData = [].concat(data1, data2);
        console.log("InputData", inputData);
        // const inputData = [].concat(ticker1);
        // const grouped = _.groupBy(inputData, "ticker");
        // const grouped = .groupBy(inputData, "ticker");
        // console.log("Grouped", grouped);
        const values = [];

        for (const [key, value] of Object.entries(company)) {
            const row = { ticker: key };
            for (const item of value) {
                row[item.ticker] = item.value;
            }
            values.push(row);
        }
        console.log("Values", values);

        setChartData(values);

        console.log("data", data);

        // setChartData([...data1, ...data2]);
        // setChartData([...data1]);
    };

    const handleResetData = async () => {
        const fetchedData1 = await fetchData(1);
        const fetchedData2 = await fetchData(2);
        setChartData1(fetchedData1);
        console.log("Reset Data1", fetchedData1);
        setChartData2(fetchedData2);
        console.log("Reset Data2", fetchedData2);
    };

    // console.log("ticker1", ticker1);
    // console.log("ticker2", ticker2);
    //
    // console.log("ticker1", {ticker1});
    // console.log("ticker2", {ticker2});

    const obj1 = JSON.parse(JSON.stringify({ ticker1 }));
    console.log("obj1.ticker", obj1.ticker1);

    const obj2 = JSON.parse(JSON.stringify({ ticker2 }));
    console.log("obj2.ticker", obj2.ticker2);
    // console.log("{obj1.ticker1}", obj1.ticker1);

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
                <LineChart data={data} margin={{ top: 50, right: 30, left: 0, bottom: 50 }}>
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin-10', 'dataMax']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <CartesianGrid vertical={false} strokeDasharray="2" />
                    <Line
                        type="monotone"
                        dataKey={JSON.stringify(obj1.ticker1)}
                        stroke="#fa8fd8"
                        strokeWidth={2}
                        dot={{ stroke: "#002cff", strokeWidth: 2 }} // Pink dots
                        isAnimationActive={false}
                        data={data1.map((point) => (point.value ? point : { ...point, value: null }))}
                    />

                    <Line
                        type="monotone"
                        dataKey={ticker2}
                        stroke="#fa8fd8"
                        strokeWidth={2}
                        dot={{ stroke: "#ff0000", strokeWidth: 2 }} // Pink dots
                        isAnimationActive={false}
                        data={data2.map((point) => (point.value ? point : { ...point, value: null }))}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CombinedSentGraph;
