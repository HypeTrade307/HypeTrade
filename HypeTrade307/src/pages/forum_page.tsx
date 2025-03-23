import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import "./Forum.css";

function Forum() {
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        fetch("/api/threads")
            .then((res) => res.json())
            .then((data) => setThreads(data))
            .catch((err) => console.error("Error fetching threads:", err));
    }, []);

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Navbar />
            <div className="forum-container">
                <div className="forum-header">
                    <h1>Forum</h1>
                    <Link to="/forum/create" className="create-thread-button">Create Thread</Link>
                </div>
                <div className="thread-list">
                    {threads.length > 0 ? (
                        threads.map((thread) => (
                            <Link key={thread.id} to={`/forum/threads/${thread.id}`} className="thread-item">
                                {thread.title}
                            </Link>
                        ))
                    ) : (
                        <p>No threads available.</p>
                    )}
                </div>
            </div>
        </AppTheme>
    );
}

export default Forum;
