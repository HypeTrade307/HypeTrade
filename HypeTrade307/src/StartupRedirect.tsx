// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { API_BASE_URL } from "./config";

// const StartupRedirect = () => {
//     const navigate = useNavigate();

//     useEffect(() => {
//         const rememberMe = localStorage.getItem("rememberMe") === "true";
//         const token = localStorage.getItem("token");

//         if (rememberMe && token) {
//             axios
//                 .get(`${API_BASE_URL}/users/me`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 })
//                 .then((res) => {
//                     const isAdmin = res.data?.is_admin;
//                     navigate(isAdmin ? "/admin" : "/profile");
//                 })
//                 .catch(() => {
//                     localStorage.removeItem("token"); // clean up invalid token
//                 });
//         }
//     }, [navigate]);

//     return null;
// };

// export default StartupRedirect;