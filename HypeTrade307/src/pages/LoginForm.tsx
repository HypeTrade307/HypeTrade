import { useState } from "react";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import { useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import axios from "axios";
import { toast } from "react-toastify";

interface User {
    email: string;
    username: string;
    password: string;
}

const LoginForm = (props: { disableCustomTheme?: boolean }) => {
    const [signUp, setSignUp] = useState<boolean>(false);
    const navigate = useNavigate();

    // State for login form
    const [loginUser, setLoginUser] = useState<Omit<User, "username">>({
        email: "",
        password: "",
    });

    // State for signup form
    const [newUser, setNewUser] = useState<User>({
        email: "",
        username: "",
        password: "",
    });

    // Handles user trying to log in
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginUser({
            ...loginUser, // creates copy of loginUser obj
            [e.target.name]: e.target.value,
        });
    };

    // Handles user wanting to sign up
    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser({
            ...newUser, // creates copy of newUser obj
            [e.target.name]: e.target.value,
        });
    };

    // Handles login submission (FIXED: Added `async`)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/auth/login",
                loginUser
            );
            localStorage.setItem("token", response.data.access_token);
            toast.success("Login successful!");
            navigate("/Portfolios");
        } catch (err) {
            console.error(err);
            toast.error("Invalid credentials");
        }
    };

    // Handle signup submission (FIXED: Used axios instead of fetch)
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/auth/signup",
                newUser
            );

            if (response.status === 201) {
                toast.success("Account created successfully!");
                setSignUp(false); // close signup window
                navigate("/profile");
            } else {
                throw new Error(response.data.detail || "Signup failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error signing up. Maybe the email is taken.");
        }
    };

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />
                <div className="login-container">
                    <form onSubmit={handleLogin}>
                        <h2>Welcome to</h2>
                        <h1>HypeTrade</h1>
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={loginUser.email}
                                onChange={handleLoginChange}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={loginUser.password}
                                onChange={handleLoginChange}
                            />
                        </div>
                        <button type="submit" className="login-button">
                            Login
                        </button>
                    </form>

                    <div className="signup-section">
                        <p>Don't have an account?</p>
                        <button className="signup-button" onClick={() => setSignUp(true)}>
                            Sign Up
                        </button>
                    </div>

                    {signUp && (
                        <div className="hud-container" onClick={() => setSignUp(false)}>
                            <div
                                className="hud-box"
                                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                            >
                                <button className="cancel" onClick={() => setSignUp(false)}>
                                    x
                                </button>

                                <h1>Sign Up</h1>
                                <form onSubmit={handleSignup}>
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            required
                                            value={newUser.email}
                                            onChange={handleSignupChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            required
                                            value={newUser.username}
                                            onChange={handleSignupChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            required
                                            value={newUser.password}
                                            onChange={handleSignupChange}
                                        />
                                    </div>
                                    <button type="submit" className="submit-button">
                                        Create Account
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </AppTheme>
        </>
    );
};

export default LoginForm;
