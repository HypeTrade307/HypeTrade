//@ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from '../config';
import "./SettingsMenu.css";

interface UserUpdate {
  username: string;
  email: string;
  emailNotifications: boolean;
}

interface UserPassword {
  old_password: string;
  new_password: string;
  confirmPassword: string;
}

export default function SettingsMenu() {
  const [activeTab, setActiveTab] = useState<string>("profile");

  const [userUpdate, setUserUpdate] = useState<UserUpdate>({
    username: "",
    email: "",
    emailNotifications: true,
  });

  const [passwordData, setPasswordData] = useState<UserPassword>({
    old_password: "",
    new_password: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setUserUpdate({
      ...userUpdate,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not authenticated. Please log in first.");
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/users/me/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Account deleted successfully!");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail || "Error deleting account";
      toast.error(detail);
    }
  };

  const saveChanges = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not authenticated. Please log in first.");
      return;
    }

    try {
      if (activeTab === "profile") {
        const body = {
          username: userUpdate.username,
          email: userUpdate.email,
        };
        await axios.put(`${API_BASE_URL}/users/me`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Profile updated successfully!");
      } else if (activeTab === "security") {
        if (passwordData.new_password !== passwordData.confirmPassword) {
          toast.error("New password and confirm password do not match.");
          return;
        }

        const body = {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        };
        await axios.put(`${API_BASE_URL}/users/me/password`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Password updated successfully!");

        setPasswordData({
          old_password: "",
          new_password: "",
          confirmPassword: "",
        });
      } else if (activeTab === "notifications") {
        toast.success("Notification preferences saved locally.");
      }
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail;
      if (detail === "Invalid new password") {
        toast.error("New password is invalid.");
      } else if (detail === "Old password is incorrect") {
        toast.error("Old password is incorrect.");
      } else {
        toast.error(detail || "Error saving changes");
      }
    }
  };

  return (
    <div className="settings-menu">
      <h2>Settings</h2>

      <div className="settings-tabs">
        <button
          className={activeTab === "profile" ? "tab-active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={activeTab === "security" ? "tab-active" : ""}
          onClick={() => setActiveTab("security")}
        >
          🔒 Security
        </button>
        <button
          className={activeTab === "notifications" ? "tab-active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="settings-section">
          <div className="form-group">
            <label htmlFor="username">New Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={userUpdate.username}
              onChange={handleProfileChange}
              placeholder="Enter your display name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Change Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userUpdate.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
            />
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="settings-section">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="old_password"
              value={passwordData.old_password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="settings-section">
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={userUpdate.emailNotifications}
              onChange={handleProfileChange}
            />
            <label htmlFor="emailNotifications">Email Notifications</label>
          </div>
        </div>
      )}

      <div className="settings-footer">
        <button className="save-button" onClick={saveChanges}>
          Save Changes
        </button>
        <button
          className="delete-button"
          onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
