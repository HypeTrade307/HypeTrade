//@ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Box, Button, Container, Grid, Stack } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

// Components
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import Home_page_button from "./Home_page_button.tsx";
import FriendList from "./FriendList.tsx";
import Portfolios_creation from "./Portfolios_creation.tsx";
import SettingsMenu from "./SettingsMenu.tsx";
import PortfolioViewer from "./Portfoilos_viewer.tsx";

// Styles
import "./Profile_Page.css";
import { API_BASE_URL } from "../config";

// Tutorial step definitions
const TUTORIAL_STEPS_LEFT = [
    { title: "Friends List", description: "Here is the friends list. You can add friends by going to the 'Search' page" },
    { title: "Friend Actions", description: "You can remove friends, view their profiles, and view there portfolios (if you have access)" },
    { title: "You're all set", description: "You can now interact with the friends list" },
];

const TUTORIAL_STEPS_RIGHT = [
    { title: "Managing Portfolios", description: "Here is the portfolio page. You can add portfolios and access them." },
    { title: "Adding a portfolio", description: "Type the name of the portfolio you wish to add, then click 'Create Portfolio' to add it to the list of portfolios." },
    { title: "Removing a portfolio", description: "Click on the trash icon to remove a portfolio from your list." },
    { title: "Adding stocks to a portfolio", description: "Click on a portfolio. This will take you to a page where you can add stocks to them." },
    { title: "You're all set", description: "Now you can manage your portfolios!" },
];

function Profile_page(props: { disableCustomTheme?: boolean }) {
    // Navigation and state hooks
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // UI state hooks
    const [showPortfolioViewer, setShowPortfolioViewer] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [profilePic] = useState("");

    // Tutorial state hooks
    const [showTutorialLeft, setShowTutorialLeft] = useState(false);
    const [stepLeft, setStepLeft] = useState(0);
    const [showTutorialRight, setShowTutorialRight] = useState(false);
    const [stepRight, setStepRight] = useState(0);

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data && response.data.user_id) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error checking authentication:", error);
                setIsAuthenticated(false);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    // Load tutorial settings from local storage
    useEffect(() => {
        const tutorialMode = localStorage.getItem("tutorialMode");
        if (tutorialMode === "true") {
            setShowTutorialLeft(true);
            setShowTutorialRight(true);
        }
    }, []);

    // Tutorial navigation functions
    const nextStepLeft = () => {
        if (stepLeft < TUTORIAL_STEPS_LEFT.length - 1) {
            setStepLeft(stepLeft + 1);
        } else {
            setShowTutorialLeft(false);
        }
    };

    const nextStepRight = () => {
        if (stepRight < TUTORIAL_STEPS_RIGHT.length - 1) {
            setStepRight(stepRight + 1);
        } else {
            setShowTutorialRight(false);
        }
    };

    // UI toggle functions
    const togglePortfolioViewer = () => {
        setShowPortfolioViewer(!showPortfolioViewer);
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const handleClickOff = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains("settings-overlay")) {
            setShowSettings(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />
                <div className="profile-container">
                    <div className="loading-message">Loading profile...</div>
                </div>
            </AppTheme>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Navbar />

            {/* Main Content Container */}
            <div className="profile-container">
                {/* Top Navigation Bar */}
                <div className="top-navigation">
                    <Home_page_button />
                    <h1 className="profile-title">My Profile</h1>
                    <button className="settings-button" onClick={toggleSettings}>
                        ⚙️ Settings
                    </button>
                </div>

                {/* Main Content Layout */}
                <div className="profile-content">
                    {/* Friends Sidebar */}
                    <div className="friends-sidebar">
                        <h2>Friends</h2>
                        <FriendList />
                    </div>

                    {/* Portfolio Content */}
                    <div className="main-content">
                        {showPortfolioViewer ? (
                            <PortfolioViewer />
                        ) : (
                            <>
                                <div className="portfolio-header">
                                    <h2>My Portfolios</h2>
                                    <button className="view-portfolio-button" onClick={togglePortfolioViewer}>
                                        View All Portfolios
                                    </button>
                                </div>
                                <Portfolios_creation />
                            </>
                        )}
                    </div>
                </div>

                {/* Settings Modal */}
                {showSettings && (
                    <div className="settings-overlay" onClick={handleClickOff}>
                        <div className="settings-modal">
                            <button className="close-button" onClick={toggleSettings}>
                                ×
                            </button>
                            <SettingsMenu />
                        </div>
                    </div>
                )}
            </div>

            {/* Tutorial Popups */}
            {showTutorialLeft && (
                <div
                    style={{
                        position: "fixed",
                        top: "45%",
                        left: "40px",
                        background: "white",
                        color: "black",
                        padding: "1rem",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        width: "300px",
                        zIndex: 9999
                    }}
                >
                    <h3>{TUTORIAL_STEPS_LEFT[stepLeft].title}</h3>
                    <p>{TUTORIAL_STEPS_LEFT[stepLeft].description}</p>
                    <button onClick={nextStepLeft} style={{ marginTop: "0.5rem", width: "100%" }}>
                        {stepLeft < TUTORIAL_STEPS_LEFT.length - 1 ? "Next" : "Finish"}
                    </button>
                </div>
            )}

            {showTutorialRight && (
                <div
                    style={{
                        position: "fixed",
                        top: "45%",
                        right: "40px",
                        background: "white",
                        color: "black",
                        padding: "1rem",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        width: "300px",
                        zIndex: 9999
                    }}
                >
                    <h3>{TUTORIAL_STEPS_RIGHT[stepRight].title}</h3>
                    <p>{TUTORIAL_STEPS_RIGHT[stepRight].description}</p>
                    <button onClick={nextStepRight} style={{ marginTop: "0.5rem", width: "100%" }}>
                        {stepRight < TUTORIAL_STEPS_RIGHT.length - 1 ? "Next" : "Finish"}
                    </button>
                </div>
            )}
        </AppTheme>
    );
}

export default Profile_page;