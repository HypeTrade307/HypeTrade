import { useState } from "react";
import Home_page_button from "./Home_page_button.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import FriendRemove from "./FriendRemove.tsx";
import Portfolios_creation from "./Portfolios_creation.tsx";
import SettingsMenu from "./SettingsMenu.tsx";
import PortfolioViewer from "./Portfoilos_viewer.tsx";
import "./Profile_Page.css";

function Profile_page(props: { disableCustomTheme?: boolean }) {
    const [showPortfolioViewer, setShowPortfolioViewer] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    // Tutorial Left
    const [showTutorialLeft, setShowTutorialLeft] = useState(true);
    const [stepLeft, setStepLeft] = useState(0);
    const tutorialStepsLeft = [
        { title: "Friends List", description: "Here is the friends list. You can add friends by going to the 'Search' page" },
        { title: "Friend Actions", description: "You can remove friends, view their profiles, and view there portfolios (if you have access)" },
        { title: "You're all set", description: "You can now interact with the friends list" },
    ];

    // Tutorial Right
    const [showTutorialRight, setShowTutorialRight] = useState(true);
    const [stepRight, setStepRight] = useState(0);
    const tutorialStepsRight = [
        { title: "Managing Portfolios", description: "Here is the portfolio page. You can add portfolios and access them." },
        { title: "Adding a portfolio", description: "Type the name of the portfolio you wish to add, then click 'Create Portfolio' to add it to the list of portfolios." },
        { title: "Removing a portfolio", description: "Click on the trash icon to remove a portfolio from your list." },
        { title: "Adding stocks to a portfolio", description: "Click on a portfolio. This will take you to a page where you can add stocks to them." },
        { title: "You're all set", description: "Now you can manage your portfolios!" },
    ];

    const nextStepLeft = () => {
        if (stepLeft < tutorialStepsLeft.length - 1) {
            setStepLeft(stepLeft + 1);
        } else {
            setShowTutorialLeft(false);
        }
    };

    const nextStepRight = () => {
        if (stepRight < tutorialStepsRight.length - 1) {
            setStepRight(stepRight + 1);
        } else {
            setShowTutorialRight(false);
        }
    };

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

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />

                <div className="profile-container">
                    <div className="top-navigation">
                        <Home_page_button />
                        <h1 className="profile-title">My Profile</h1>
                        <button className="settings-button" onClick={toggleSettings}>
                            ⚙️ Settings
                        </button>
                    </div>

                    <div className="profile-content">
                        <div className="friends-sidebar">
                            <h2>Friends</h2>
                            <FriendRemove />
                        </div>

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

                {/* Left Tutorial Popup */}
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
                        <h3>{tutorialStepsLeft[stepLeft].title}</h3>
                        <p>{tutorialStepsLeft[stepLeft].description}</p>
                        <button onClick={nextStepLeft} style={{ marginTop: "0.5rem", width: "100%" }}>
                            {stepLeft < tutorialStepsLeft.length - 1 ? "Next" : "Finish"}
                        </button>
                    </div>
                )}

                {/* Right Tutorial Popup */}
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
                        <h3>{tutorialStepsRight[stepRight].title}</h3>
                        <p>{tutorialStepsRight[stepRight].description}</p>
                        <button onClick={nextStepRight} style={{ marginTop: "0.5rem", width: "100%" }}>
                            {stepRight < tutorialStepsRight.length - 1 ? "Next" : "Finish"}
                        </button>
                    </div>
                )}
            </AppTheme>
        </>
    );
}

export default Profile_page;
