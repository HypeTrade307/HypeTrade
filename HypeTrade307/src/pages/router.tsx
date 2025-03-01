import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Page_Not_found from "./Page_Not_found.tsx";
import Main_page from "./Main_page.tsx";
import Profile_page from "./Profile_page.tsx";
import Search_other_users from "./Search_Other_Users.tsx";
import LoginForm from "./LoginForm.tsx";

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
                <Route path="/" element={<Main_page />} />
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
