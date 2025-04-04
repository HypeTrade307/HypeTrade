import { useState, useEffect } from "react";
import Home_page_button from "./Home_page_button.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import FriendRemove from "./FriendRemove.tsx";
import Portfolios_creation from "./Portfolios_creation.tsx";
import SettingsMenu from "./SettingsMenu.tsx";
import PortfolioViewer from "./Portfoilos_viewer.tsx";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import "./Profile_Page.css";

function Profile_page(props: { disableCustomTheme?: boolean }) {
    const [showPortfolioViewer, setShowPortfolioViewer] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [portfolioTutorialOpen, setPortfolioTutorialOpen] = useState(false);
    const [portfolioStep, setPortfolioStep] = useState(0);

    // Check tutorial mode for portfolio tutorial
    useEffect(() => {
        const tutorialMode = JSON.parse(localStorage.getItem("tutorialMode") || "false");

        if (tutorialMode) {
            setPortfolioTutorialOpen(true);
        }
    }, []);

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

    const nextPortfolioStep = () => {
        if (portfolioStep < portfolioTutorialSteps.length - 1) {
            setPortfolioStep(portfolioStep + 1);
        } else {
            setPortfolioTutorialOpen(false);
        }
    };

    const portfolioTutorialSteps = [
        { title: "Adding portfolios", description: "This is the Portfolio Creation section. Here, you can create and manage your investment portfolios." },
        { title: "Adding Portfolios", description: "Type the name of your portfolio in the text box, then click the 'Create Portfolio' button to add it to your list." },
        { title: "Viewing Portfolios", description: "Click 'View All Portfolios' to see an overview of your created portfolios." },
        { title: "You're All Set!", description: "Now you know how to create and manage portfolios effectively." }
    ];

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

            {/* Right-Aligned Portfolio Tutorial Popup */}
            <Dialog
    open={portfolioTutorialOpen}
    disableEscapeKeyDown // Prevent closing with Esc
    hideBackdrop={true}  // Remove the backdrop entirely
    PaperProps={{
        sx: {
            position: "fixed",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "300px",
            boxShadow: 3,
            borderRadius: 2,
            padding: "10px",
            pointerEvents: "auto", // Ensures the dialog is interactive
        }
    }}
>
    <DialogTitle>{portfolioTutorialSteps[portfolioStep].title}</DialogTitle>
    <DialogContent>
        <p>{portfolioTutorialSteps[portfolioStep].description}</p>
        <Button onClick={nextPortfolioStep}>
            {portfolioStep < portfolioTutorialSteps.length - 1 ? "Next" : "Finish"}
        </Button>
    </DialogContent>
</Dialog>
        </>
    );
}

export default Profile_page;
