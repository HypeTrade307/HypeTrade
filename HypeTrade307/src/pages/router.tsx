import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Page_Not_found from "./Page_Not_found.tsx";
import Main_page from "./Main_page.tsx";
import Profile_page from "./Profile_Page.tsx";
import LoginForm from "./LoginForm.tsx";
import Portfolios_creation from "./Portfolios_creation.tsx";
import PortfolioPage from "./Portfoilos_viewer.tsx";
import Search_other_users from "./Search_Other_Users.tsx"
import FriendRemove from "./FriendRemove.tsx";
import Check_if_friends from "./check_if_friends.jsx";

const Links: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="" element={<Main_page />} />
                <Route path="/Portfolios/:id" element={<PortfolioPage />} />
                <Route path="/Portfolios" element={<Portfolios_creation />} />
                <Route path="/profile" element={<Profile_page />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/Search" element={<Search_other_users />} />
                <Route path="*" element={<Page_Not_found />} />
                {/* Protect Profile Page */}
                <Route path="/Profile" element={isAuthenticated ? <Profile_page /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default Links;
