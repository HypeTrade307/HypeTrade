import { useState, useEffect } from "react";
import "../stocks.css";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

interface Stock {
    name: string;
    abbreviation: string;
    value: number;
    sentiment: number;
}

interface Notification {
    id: number;
    message: string;
    read: boolean;
    timestamp: string;
}

type TimePeriod = "Day" | "Week" | "Month";

function ViewStock(props: {disableCustomTheme?: boolean }) {
    const [pickStock, setPickStock] = useState<Stock | null>(null);
    const [timeButton, setTimeButton] = useState<TimePeriod>("Day");

    const stockList: Stock[] = [
        { name: "Apple", abbreviation: "AAPL", value: 180, sentiment: 5.12 },
        { name: "Tesla", abbreviation: "TSLA", value: 700, sentiment: -6.27 },
        { name: "Nvidia", abbreviation: "NVDA", value: 450, sentiment: 9.85 }
    ];

    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, message: "AAPL stock's sentimental value is up 2.3", read: false, timestamp: "10:30 AM" },
        { id: 2, message: "TSLA stock's sentimental value is down 3.1", read: false, timestamp: "11:45 AM" },
        { id: 3, message: "Fred sent you a friend request!", read: true, timestamp: "Yesterday" }
    ]);

    const unreadCount = notifications.filter(notification => !notification.read).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({
            ...notification,
            read: true
        })));
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? {...notification, read: true} : notification
        ));
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const getGraph = (): string => {
        if (!pickStock) {
            return "No stock selected";
        }
        return `${pickStock.name}'s performance over the last ${timeButton}`;
    };

    // Tutorial states
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const tutorialMode = JSON.parse(localStorage.getItem("tutorialMode") || "false");
        if (tutorialMode) {
            setTutorialOpen(true);
        }
    }, []);

    const nextStep = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        } else {
            setTutorialOpen(false);
        }
    };

    const tutorialSteps = [
        { title: "Viewing stock sentiment", description: "This is where you can track stock performance and sentiment analysis." },
        { title: "Select a Stock", description: "Click on a stock to view its details and sentiment analysis." },
        { title: "View Stock Graph", description: "Change the time period to view the stock performance over different durations." },
        { title: "You're All Set!", description: "Now you can analyze the stock performance and make informed decisions." }
    ];

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />

                <div>
                    <h1 className="title">Top 20 Stox</h1>

                    {/* Notification Button */}
                    <div className="notification-container">
                        <button
                            className="notification-button"
                            onClick={toggleNotifications}
                        >
                            🔔
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>

                        {/* notification dropdown */}
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="mark-read-button" onClick={markAllAsRead}>
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="notification-list">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <p className="notification-message">{notification.message}</p>
                                                <span className="notification-time">{notification.timestamp}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-notifications">No notifications</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <ul className="stock-list">
                        {stockList.map((stock) => (
                            <div key={stock.abbreviation}>
                                <button
                                    className="stock-button"
                                    onClick={() => setPickStock(stock)}
                                >
                                    {stock.name}
                                </button>
                            </div>
                        ))}
                    </ul>

                    {/* Stock Details Popup */}
                    {pickStock && (
                        <div
                            className="hud-container"
                            onClick={() => setPickStock(null)} // Click outside to close
                        >
                            <div
                                className="hud-box"
                                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                            >
                                <button
                                    className="cancel"
                                    onClick={() => { setPickStock(null); setTimeButton("Day"); }}
                                >
                                    x
                                </button>
                                <h2>
                                    {pickStock.name} ({pickStock.abbreviation})
                                </h2>
                                <p>Stock Value: ${pickStock.value}</p>
                                <p>Sentiment: {pickStock.sentiment}</p>

                                <ul className="button-list">
                                    <button
                                        className="time-buttons"
                                        onClick={() => setTimeButton("Month")}
                                    >
                                        Month
                                    </button>

                                    <button
                                        className="time-buttons"
                                        onClick={() => setTimeButton("Week")}
                                    >
                                        Week
                                    </button>

                                    <button
                                        className="time-buttons"
                                        onClick={() => setTimeButton("Day")}
                                    >
                                        Day
                                    </button>
                                </ul>

                                <div>
                                    <p>{getGraph()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppTheme>

            {/* Tutorial Popup */}
            <Dialog
                open={tutorialOpen}
                onClose={() => {}} // Prevents clicking outside from closing
                sx={{
                    position: "fixed",
                    left: "12%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    maxWidth: "300px"
                }}
                disableEscapeKeyDown
                hideBackdrop
            >
                <DialogTitle>{tutorialSteps[step].title}</DialogTitle>
                <DialogContent>
                    <p>{tutorialSteps[step].description}</p>
                    <Button onClick={nextStep}>{step < tutorialSteps.length - 1 ? "Next" : "Finish"}</Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ViewStock;