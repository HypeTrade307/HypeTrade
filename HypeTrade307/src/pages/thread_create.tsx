import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "./thread_create.css";

const ThreadCreate = () => {
    const [title, setTitle] = useState("");
    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState("");
    const router = useRouter();

    useEffect(() => {
        axios.get("/api/stocks") // assuming there's an endpoint for fetching stocks
            .then(response => setStocks(response.data))
            .catch(error => console.error("Error fetching stocks:", error));
    }, []);

    const createThread = async () => {
        if (!title || !selectedStock) return;
        try {
            const response = await axios.post("/api/threads/", {
                title,
                stock_id: selectedStock
            });
            router.push(`/thread/${response.data.thread_id}`);
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    return (
        <div className="thread-create-container">
            <h1>Create a New Thread</h1>
            <input
                type="text"
                placeholder="Thread Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <select onChange={(e) => setSelectedStock(e.target.value)}>
                <option value="">Select a Stock</option>
                {stocks.map(stock => (
                    <option key={stock.id} value={stock.id}>{stock.name}</option>
                ))}
            </select>
            <button onClick={createThread}>Create Thread</button>
        </div>
    );
};

export default ThreadCreate;
