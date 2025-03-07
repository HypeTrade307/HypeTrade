// import Links from './pages/router.tsx';
import './App.css'

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Page_Not_found from "./pages/Page_Not_found.tsx";
import Home from "./pages/home_page.tsx";
import Profile_page from "./pages/Profile_Page.tsx";
import Search_other_users from "./pages/Search_Other_Users.tsx"
import LoginForm from "./pages/LoginForm.tsx";
import FriendRemove from "./pages/FriendRemove.tsx";
import ViewStock from "./pages/ViewStock.tsx";
import PortView from "./pages/Portfolio_friend_view.tsx";

// TODO: Update as new pages are added
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile_page />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/search" element={<Search_other_users />} />
                <Route path="*" element={<Page_Not_found />} />
                <Route path="/friends" element={<FriendRemove />} />
                <Route path="/stock" element={<ViewStock />} />
                <Route path="/PortView/:friendID" element={<PortView />} />
            </Routes>
        </Router>
    );
}

export default App;