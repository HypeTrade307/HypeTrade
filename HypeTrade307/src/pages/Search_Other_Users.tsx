//@ts-ignore
import React, { useState } from "react";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function BasicPage(props: {disableCustomTheme?: boolean }) {
    const [inputText, setInputText] = useState("");
    const [responseData, setResponseData] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!inputText.trim()) return;
        setLoading(true);
        setError("");
        setResponseData(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/process`, { text: inputText }, {
                headers: { "Content-Type": "application/json" }
            });

            // Axios automatically parses JSON responses
            // The data is available in response.data
            if (response.data) {
                setResponseData(response.data);
            } else {
                throw new Error("No data received");
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error fetching data.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />

                <Navbar />

                <div className="p-4 max-w-md mx-auto">
                    <input
                        type="text"
                        className="border p-2 w-full"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text..."
                    />
                    <button
                        className="bg-blue-500 text-white p-2 mt-2 w-full"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Submit"}
                    </button>

                    {error && <p className="text-red-500 mt-2">{error}</p>}

                    {responseData && (
                        <div className="mt-4 border p-2">
                            <h3 className="font-bold">Results ({responseData.length} found):</h3>
                            <ul className="list-disc list-inside">
                                {responseData.map((item, index) => (
                                    <li key={index}>
                                        <a href={`https://hypetrade.com/${item}`} target="_blank" className="text-blue-500 underline">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </AppTheme>
        </>
    );
}