import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Thread {
    thread_id: number;
    title: string;
    // Include other necessary fields from your model
}

export default function ForumPage() {
    const [threadTitle, setThreadTitle] = useState<string>("");
    const [threads, setThreads] = useState<Thread[]>([]);

    useEffect(() => {
        async function fetchThreads() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://127.0.0.1:8000/threads", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setThreads(response.data);
            } catch (error) {
                console.error("Failed to fetch threads", error);
            }
        }
        fetchThreads();
    }, []);

    const createThread = async () => {
        if (threadTitle.trim()) {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.post(
                    "http://127.0.0.1:8000/threads",
                    { title: threadTitle },
                    {
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    }
                );
                setThreads([...threads, response.data]);
                setThreadTitle("");
            } catch (error) {
                console.error("Error creating thread", error);
                alert("Failed to create thread");
            }
        }
    };

    const removeThread = async (threadId: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://127.0.0.1:8000/threads/${threadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThreads((prevThreads) => prevThreads.filter((t) => t.thread_id !== threadId));
        } catch (error) {
            console.error("Error deleting thread", error);
            alert("Failed to delete thread");
        }
    };

    return (
        <div>
            <h1>Forum Discussion</h1>
            <h2>Create a New Thread</h2>
            <input
                placeholder="Enter Thread Title"
                value={threadTitle}
                onChange={(e) => setThreadTitle(e.target.value)}
            />
            <button onClick={createThread}>Create Thread</button>

            <h3>Threads</h3>
            <ul>
                {threads.length === 0 ? (
                    <p>No Threads created.</p>
                ) : (
                    threads.map((thread) => (
                        <li key={thread.thread_id}>
                            <Link to={`/threads/${thread.thread_id}`}>{thread.title}</Link>
                            <button 
                                style={{marginLeft: "1rem"}}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this thread?")) {
                                        removeThread(thread.thread_id);
                                    }
                                }}
                            >Remove</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}