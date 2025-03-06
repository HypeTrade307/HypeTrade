import { useState, useEffect } from "react";
import "./SettingsMenu.css";

interface UserSettings {
    username: string;
    email: string;
    emailNotifications: boolean;
}

export default function SettingsMenu() {
    const [settings, setSettings] = useState<UserSettings>({
        username: "", // TODO populate username and email
        email: "",
        emailNotifications: true,
    });

    const [activeTab, setActiveTab] = useState<string>("profile");
    const [saveStatus, setSaveStatus] = useState<string>("");

    // Load settings from localStorage
    useEffect(() => {
        const storedSettings = localStorage.getItem("userSettings");
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    }, []);

    // Save settings to localStorage
    const saveSettings = () => {
        localStorage.setItem("userSettings", JSON.stringify(settings));
        setSaveStatus("Settings saved successfully!");

        // save message displays for 1.5 secs
        setTimeout(() => {
            setSaveStatus("");
        }, 1500);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    return (
        <div className="settings-menu">
            <h2>Settings</h2>

            {/* Tab navigation */}
            <div className="settings-tabs">
                <button
                    className={activeTab === "profile" ? "tab-active" : ""}
                    onClick={() => setActiveTab("profile")}
                >
                    Profile
                </button>
                <button
                    className={activeTab === "notifications" ? "tab-active" : ""}
                    onClick={() => setActiveTab("notifications")}
                >
                    Notifications
                </button>
            </div>

            {/* Name settings */}
            {activeTab === "profile" && (
                <div className="settings-section">
                    <div className="form-group">
                        <label htmlFor="displayName">New Username</label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={settings.username}
                            onChange={handleInputChange}
                            placeholder="Enter your display name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Change Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={settings.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* TODO add something for change password */}
                </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
                <div className="settings-section">
                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            name="emailNotifications"
                            checked={settings.emailNotifications}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="emailNotifications">Email Notifications</label>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="settings-footer">
                {saveStatus && <div className="save-status">{saveStatus}</div>}
                <button className="save-button" onClick={saveSettings}>
                    Save Changes
                </button>
            </div>
        </div>
    );
}