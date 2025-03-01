import { useState } from "react";

export default function BasicPage() {
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
            const response = await fetch("http://127.0.0.1:8000/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const data: string[] = await response.json();
            setResponseData(data);
        } catch (err) {
            setError("Error fetching data.");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                    <h3 className="font-bold">Response:</h3>
                    <ul>
                        {responseData.map((item, index) => (
                            <li key={index}> {item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}