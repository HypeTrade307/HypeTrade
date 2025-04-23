//@ts-nocheck
import {useEffect, useState} from "react";
import Home_page_button from "./Home_page_button.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import FriendList from "./FriendList.tsx";
import Portfolios_creation from "./Portfolios_creation.tsx";
import SettingsMenu from "./SettingsMenu.tsx";
import PortfolioViewer from "./Portfoilos_viewer.tsx";
import "./Profile_Page.css";
import {Box, Button, Container, Link, Stack } from "@mui/material";
// import Grid from "@mui/material/Grid2";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";

function Profile_page(props: { disableCustomTheme?: boolean }) {
    const navigate = useNavigate();
    const [showPortfolioViewer, setShowPortfolioViewer] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [profilePic, setProfilePic] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Tutorial Left
    const [showTutorialLeft, setShowTutorialLeft] = useState(false);
    const [stepLeft, setStepLeft] = useState(0);
    const tutorialStepsLeft = [
        { title: "Friends List", description: "Here is the friends list. You can add friends by going to the 'Search' page" },
        { title: "Friend Actions", description: "You can remove friends, view their profiles, and view there portfolios (if you have access)" },
        { title: "You're all set", description: "You can now interact with the friends list" },
    ];

    // Tutorial Right
    const [showTutorialRight, setShowTutorialRight] = useState(false);
    const [stepRight, setStepRight] = useState(0);
    const tutorialStepsRight = [
        { title: "Managing Portfolios", description: "Here is the portfolio page. You can add portfolios and access them." },
        { title: "Adding a portfolio", description: "Type the name of the portfolio you wish to add, then click 'Create Portfolio' to add it to the list of portfolios." },
        { title: "Removing a portfolio", description: "Click on the trash icon to remove a portfolio from your list." },
        { title: "Adding stocks to a portfolio", description: "Click on a portfolio. This will take you to a page where you can add stocks to them." },
        { title: "You're all set", description: "Now you can manage your portfolios!" },
    ];

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/notifications/user/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.length > 0 && response.data[0].receiver_id) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    useEffect(() => {
    const tutorialMode = localStorage.getItem("tutorialMode");
    if (tutorialMode === "true") {
        setShowTutorialLeft(true);
        setShowTutorialRight(true);
    }
}, []);
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

    if (!isAuthenticated) {
        return null; // Will redirect to login page
    }

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />

                <div className="profile-container2">
                    <Container
                        fixed
                        sx={{
                            '@media screen and (max-width: 768px)': {
                                padding: "0",
                                marginY: "10px"
                            },
                        }}
                    >
                        <Grid
                            container
                            direction="row"
                            justifyContent="center"
                            alignItems="flex-start"
                            spacing={2}
                            sx={{
                                '@media screen and (max-width: 768px)': {
                                    alignItems: "center",
                                    margin: "0",
                                    spacing: 0,
                                    width: "100%",
                                },
                            }}
                        >
                            <Grid
                                // LHS Column
                                container
                                item
                                direction="column"
                                justifyContent="flex-start"
                                // alignItems="center"
                                // xs={12} sm={4}
                            >
                                {/*profile section*/}
                                <Grid
                                    item
                                    xs={12} sm={4}
                                >
                                    <Stack direction="column"
                                           // justifyContent="center"
                                           alignItems="flex-start"
                                           spacing={2}
                                    >
                                        <Box
                                            component="img"
                                            sx={{
                                                height: 233,
                                                width: 350,
                                                maxHeight: { xs: 233, md: 167 },
                                                maxWidth: { xs: 350, md: 250 },
                                                borderRadius: '10px',
                                                // display: flex;
                                                // flex-direction: column;
                                                // align-items: stretch;
                                                // justify-content: flex-start;
                                                // height: 20vh;
                                            }}
                                            alt="The house from the offer."
                                            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&w=350&dpr=2"
                                            // src={profilePic}
                                        />
                                        {/*<ProfilePic src={profilePic}/>*/}
                                    </Stack>
                                </Grid>
                            </Grid>
                            <Grid
                                // RHS Column
                                container
                                item
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="stretch"
                                // xs={12} sm={8}
                                sx={{
                                    '@media screen and (max-width: 768px)': {
                                        alignItems: "center",
                                        margin: "auto",
                                    },
                                }}
                            >
                                <Grid
                                    // Name and Follow Button
                                    container
                                    item
                                    direction="column"
                                    justifyContent="flex-start"
                                    alignItems="flex-start"
                                    sx={{
                                        '@media screen and (max-width: 768px)': {
                                            alignItems: "center",
                                            marginY: "10px"
                                        },
                                    }}
                                >
                                    <div className="NameStatusIconContainer">
                                        <div className="userName">
                                            My Profile
                                            {/*{nickName}*/}
                                        </div>
                                    </div>

                                    <Grid
                                        // Follow Button container
                                        container
                                        item
                                        direction="column"
                                        justifyContent="flex-start"
                                        alignItems="flex-start"
                                        sx={{
                                            '@media screen and (max-width: 768px)': {
                                                alignItems: "center",
                                                marginTop: "10px"
                                            },
                                        }}
                                    >

                                        <Grid
                                            // Follow Button container
                                            container
                                            direction="column"
                                            justifyContent="flex-start"
                                            alignItems="flex-start"
                                            sx={{
                                                '@media screen and (max-width: 768px)': {
                                                    alignItems: "center",
                                                    marginTop: "10px"
                                                },
                                            }}
                                        >
                                            <div>
                                                <Button
                                                    disableRipple
                                                    container
                                                    direction="column"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    // fullWidth={true}

                                                    variant="outlined"
                                                    style={{color:'lightblue'}}
                                                    // onClick={followUser}
                                                >
                                                    Follow
                                                </Button>
                                            </div>

                                        </Grid>

                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Container>
                </div>

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
                            <FriendList />
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
