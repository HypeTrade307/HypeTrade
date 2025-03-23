// import Links from './pages/router.tsx';
import './App.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Page_Not_found from "./pages/Page_Not_found.tsx";
import Home from "./pages/home_page.tsx";
import Profile_page from "./pages/Profile_Page.tsx";
import Search_other_users from "./pages/Search_Other_Users.tsx"
import LoginForm from "./pages/LoginForm.tsx";
import FriendRemove from "./pages/FriendRemove.tsx";
import ViewStock from "./pages/ViewStock.tsx";
import PortView from "./pages/Portfolio_friend_view.tsx";
import ChatPage from "./pages/chat.tsx";
import Forum_page from "./pages/forum_page.tsx";
import PortfolioPage
 from './pages/Portfoilos_viewer.tsx';
// TODO: Update as new pages are added
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile_page />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/search" element={<Search_other_users />} />
                <Route path="/friends" element={<FriendRemove />} />
                <Route path="/stock" element={<ViewStock />} />
                <Route path="/PortView/:friendID" element={<PortView />} />
                <Route path="/portfolios/:id" element={<PortfolioPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/forum" element={<Forum_page />} />
                <Route path="*" element={<Page_Not_found />} />
            </Routes>
        </Router>
    );
}

export default App;