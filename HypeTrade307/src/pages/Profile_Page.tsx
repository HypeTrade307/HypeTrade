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

    // Toggle between portfolio creation and viewer
    const togglePortfolioViewer = () => {
        setShowPortfolioViewer(!showPortfolioViewer);
    };

    // Toggle settings menu visibility
    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    // Close settings when clicking outside
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
                    {/* Top Navigation */}
                    <div className="top-navigation">
                    <Home_page_button />
                        <h1 className="profile-title">My Profile</h1>
                        <button className="settings-button" onClick={toggleSettings}>
                            ⚙️ Settings
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="profile-content">
                        {/* Left Sidebar - Friends List */}
                        <div className="friends-sidebar">
                            <h2>Friends</h2>
                            <FriendRemove />
                        </div>

                        {/* Main Content - Portfolios */}
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

                    {/* HUD for settings */}
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
                </AppTheme>
        </>
    );
}

export default Profile_page;