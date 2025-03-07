 import React from "react";
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import Page_Not_found from "./Page_Not_found.tsx";
 import Main_page from "./Main_page.tsx";
 import Profile_page from "./Profile_Page.tsx";
 import Search_other_users from "./Search_Other_Users.tsx"
 import LoginForm from "./LoginForm.tsx";
 import FriendRemove from "./FriendRemove.tsx";
 import PortView from "./Portfolio_friend_view.tsx";

 const Links: React.FC = () => {
     return (
         <Router>
             <Routes>
                 <Route path="" element={<Main_page />} />
                 <Route path="/Profile" element={<Profile_page />} />
                 <Route path="/login" element={<LoginForm />} />
                 <Route path="/Search" element={<Search_other_users />} />
                 <Route path="*" element={<Page_Not_found />} />
                 <Route path="/FriendList" element={<FriendRemove />} />
               <Route path="/PortView/:friendID" element={<PortView />} />
           </Routes>
         </Router>
     );
};

export default Links;