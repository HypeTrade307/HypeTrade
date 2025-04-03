import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import CssBaseline from "@mui/material/CssBaseline";

interface Post {
    title: string;
    description: string;
}

interface Thread {
    id: number;
    pageTitle: string;
    canViewPortfolio: boolean;
    posts: Post[];
}

const Thread: React.FC = () => {
    const { threadID } = useParams();
    // const navigate = useNavigate();
    const [thread, setThread] = useState<Thread | null>(null);

    const threadsData: Thread[] = [
        {
            id: 1,
            pageTitle: 'AAPL - Apple',
            canViewPortfolio: true,
            posts: [
                { title: "Web Development", description: "A portfolio showcasing web development projects." },
                { title: "Design", description: "A portfolio with some design work." }
            ]
        },
        {
            id: 2,
            pageTitle: 'NVDA - Nvidia',
            canViewPortfolio: false,
            posts: [
                { title: "Web Development", description: "A portfolio showcasing web development projects." },
                { title: "Design", description: "A portfolio with some design work." }
            ]
        },
        {
            id: 3,
            pageTitle: 'TICKER - Stocks, etc...',
            canViewPortfolio: true,
            posts: [
                { title: "Web Development", description: "A portfolio showcasing web development projects." },
                { title: "Design", description: "A portfolio with some design work." }
            ]
        },
    ];

    useEffect(() => {
        if (threadID) {
            const threadData = threadsData.find((t) => t.id === Number(threadID));
            setThread(threadData || null);
        }
    }, [threadID]);

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
                </div>
            </div>
        </AppTheme>
    );
};

export default Thread;