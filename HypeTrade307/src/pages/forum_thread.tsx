import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import { Button } from "@mui/material";

// Define Post and Thread interfaces
interface Post {
    title: string;
    description: string;
}

interface Thread {
    id: number;
    pageTitle: string;
    canViewPortfolio: boolean;
    posts: Post[];
    isOwner: boolean; // Added this property to represent if the current user is the owner
}

const Thread: React.FC = () => {
    const { threadID } = useParams();
    const [thread, setThread] = useState<Thread | null>(null);

    // Sample threads data
    const threadsData: Thread[] = [
        {
            id: 1,
            pageTitle: 'AAPL - Apple',
            canViewPortfolio: true,
            posts: [
                { title: "Web Development", description: "A portfolio showcasing web development projects." },
                { title: "Design", description: "A portfolio with some design work." }
            ],
            isOwner: true // Hardcoded owner for now
        },
        {
            id: 2,
            pageTitle: 'NVDA - Nvidia',
            canViewPortfolio: false,
            posts: [
                { title: "Web Development", description: "A portfolio showcasing web development projects." },
                { title: "Design", description: "A portfolio with some design work." }
            ],
            isOwner: false // Not owned by the user
        },
        {
            id: 3,
            pageTitle: 'TICKER - Stocks, etc...',
            canViewPortfolio: true,
            posts: [
                { title: "Web Development", description: "A portfolio showcasing web development projects." },
                { title: "Design", description: "A portfolio with some design work." }
            ],
            isOwner: true // Owned by the user
        },
    ];

    // Find thread data based on the URL param threadID
    useEffect(() => {
        if (threadID) {
            const threadData = threadsData.find((t) => t.id === Number(threadID));
            setThread(threadData || null);
        }
    }, [threadID]);

    // Function to delete the thread (for now just log the action)
    const deleteThread = (id: number) => {
        console.log(`Deleting thread with ID: ${id}`);
        // Actual deletion logic would go here (e.g., API call or state update)
    };

    if (!thread) {
        return <div>Thread not found!</div>;
    }

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            {/* Navigation bar */}
            <Navbar />

            {/* Main Content */}
            <div>
                <h1>{thread.pageTitle}</h1>
                <div>
                    <h2>Portfolio List</h2>
                    <ul>
                        {thread.posts.map((post, index) => (
                            <li key={index}>
                                <h3>{post.title}</h3>
                                <p>{post.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Show delete button only if the user is the owner */}
                {thread.isOwner && (
                    <Button variant="contained" color="error" onClick={() => deleteThread(thread.id)}>
                        Delete Thread
                    </Button>
                )}
            </div>
        </AppTheme>
    );
};

export default Thread;
