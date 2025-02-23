import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Page_Not_found from "./Page_Not_found.tsx";
import Main_page from "./Main_page.tsx";
import Profile_page from "./Profile_Page.tsx";

const Links: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="" element={<Main_page />} />
                <Route path="/Profile" element={<Profile_page />} />
                <Route path="*" element={<Page_Not_found />} />
            </Routes>
        </Router>
    );
};

export default Links;