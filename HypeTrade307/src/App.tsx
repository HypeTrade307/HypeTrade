//@ts-nocheck
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Page_Not_found from "./pages/Page_Not_found.tsx";
import Home from "./pages/home_page.tsx";
import Profile_page from "./pages/Profile_Page.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import Search_other_users from "./pages/Search_Other_Users.tsx";
import LoginForm from "./pages/LoginForm.tsx";
import FriendRemove from "./pages/FriendRemove.tsx";
import ViewStock from "./pages/ViewStock.tsx";
import PortView from "./pages/Portfolio_friend_view.tsx";
import ChatPage from "./pages/chat.tsx";
import Forum_page from "./pages/forum_page.tsx";
import Thread_page from "./pages/thread_viewer.tsx";
import Post_page from "./pages/post_viewer.tsx";
import PortfolioPage from './pages/Portfoilos_viewer.tsx';
import Specific_Stock from './pages/specific_stock_request.tsx'
import ViewStockPage from "./pages/ViewStockPage.tsx";
import HelpPage from "./pages/HelpPage.tsx";
import AdminPanel from './pages/AdminPanel.tsx';

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile_page />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/search" element={<Search_other_users />} />
                <Route path="/friends" element={<FriendRemove />} />
                <Route path="/stock" element={<ViewStock />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/PortView/:friendID" element={<PortView />} />
                <Route path="/portfolios/:id" element={<PortfolioPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/thread/:threadId" element={<Thread_page />} />
                <Route path="/forum" element={<Forum_page />} />
                <Route path="/thread/:threadId/:postId" element={<Post_page />} />
                <Route path="/specific-stock" element={<Specific_Stock />} />
                <Route path="/stocks/:tkr" element={<ViewStockPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="*" element={<Page_Not_found />} />
            </Routes>
        </Router>
    );
}

export default App;
