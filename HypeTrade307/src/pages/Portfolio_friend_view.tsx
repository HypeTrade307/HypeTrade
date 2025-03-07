import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/NavbarSection/Navbar.tsx";  // Navbar import
import friendRemoveStyles from "./FriendRemove.module.css"; // Renaming import to avoid conflict
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import CssBaseline from "@mui/material/CssBaseline";

interface Portfolio {
    title: string;
    description: string;
}

interface Friend {
    id: number;
    name: string;
    canViewPortfolio: boolean;
    portfolios: Portfolio[];
}

const PortView: React.FC = () => {
    const { friendID } = useParams();
    const navigate = useNavigate();
    const [friend, setFriend] = useState<Friend | null>(null);

    const friendsData: Friend[] = [
        {
            id: 123456,
            name: "James",
            canViewPortfolio: true,
            portfolios: [
                { title: "Web Development", description: "A portfolio showcasing web development projects." },
                { title: "Design", description: "A portfolio with some design work." }
            ]
        },
        {
            id: 234567,
            name: "Fred",
            canViewPortfolio: false,
            portfolios: []
        },
        {
            id: 345678,
            name: "Peter",
            canViewPortfolio: true,
            portfolios: [
                { title: "Photography", description: "A collection of photography work." }
            ]
        },
        {
            id: 456789,
            name: "John",
            canViewPortfolio: true,
            portfolios: [
                { title: "Art", description: "A portfolio of digital art pieces." }
            ]
        },
        {
            id: 567890,
            name: "Alice",
            canViewPortfolio: false,
            portfolios: []
        },
        {
            id: 678901,
            name: "Bob",
            canViewPortfolio: true,
            portfolios: [
                { title: "Graphic Design", description: "A portfolio of graphic design work." }
            ]
        }
    ];

    useEffect(() => {
        if (friendID) {
            const friendData = friendsData.find((f) => f.id === Number(friendID));
            setFriend(friendData || null);
        }
    }, [friendID]);

    if (!friend) {
        return <div>Friend not found!</div>;
    }

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            {/* Navigation bar */}
            <Navbar />

            {/* Main Content */}
            <div className={friendRemoveStyles.container}>
                <div className={friendRemoveStyles.buttonWrapper}>
                    <button onClick={() => navigate("/friends")} style={inlineButtonStyle}>
                        ← Back to Friends
                    </button>
                </div>

                <div className={friendRemoveStyles.portfolioContainer}>
                    <h1>{friend.name}'s Portfolio</h1>

                    {/* Access Control Logic */}
                    {friend.canViewPortfolio ? (
                        <div>
                            <h2>Portfolio List</h2>
                            <ul className={friendRemoveStyles.portfolioList}>
                                {friend.portfolios.map((portfolio, index) => (
                                    <li key={index} className={friendRemoveStyles.portfolioItem}>
                                        <h3>{portfolio.title}</h3>
                                        <p>{portfolio.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>This user has restricted access to their portfolio.</p>
                    )}
                </div>
            </div>
        </AppTheme>
    );
};

// Fixed: Button styles for the "Back to Friends" button
const inlineButtonStyle: React.CSSProperties = {
    position: "fixed",
    top: "10px",
    left: "10px",
    padding: "10px 15px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    zIndex: 1000,
};

export default PortView;