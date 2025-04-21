//@ts-nocheck
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

    const [confirmationCode, setConfirmationCode] = useState<string>("");
    const [generatedCode, setGeneratedCode] = useState<number | null>(null);

    // Handles user trying to log in
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginUser({
            ...loginUser,
            [e.target.name]: e.target.value,
        });
    };

    // Handles user wanting to sign up
    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value,
        });
    };

    // Handles confirmation code input
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmationCode(e.target.value);
    };

    // Sends a confirmation code
    const sendConfirmationCode = async () => {
        if (!newUser.email) {
            toast.error("Please enter your email first.");
            return;
        }

        try {
            const response = await axios.post(
                "https://hypet-145797464141.us-central1.run.app/api/auth/send_confirmation_code",
                { email: newUser.email },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200) {
                setGeneratedCode(response.data.code);
                toast.success("Confirmation code sent!");
            } else {
                toast.error("Error sending confirmation code.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send confirmation code.");
        }
    };

    // Handle signup submission
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!generatedCode) {
            toast.error("Please request a confirmation code first.");
            return;
        }

        if (parseInt(confirmationCode) !== generatedCode) {
            toast.error("Invalid confirmation code.");
            return;
        }

        try {
            const response = await axios.post(
                "https://hypet-145797464141.us-central1.run.app/api/auth/signup",
                {
                    email: newUser.email,
                    username: newUser.username,
                    password: newUser.password,
                    confirmation_code: parseInt(confirmationCode), // ensure it's sent
                }
            );

            if (response.status === 201) {
                toast.success("Account created successfully!");
                setSignUp(false);
                navigate("/profile");
            } else {
                throw new Error(response.data.detail || "Signup failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error signing up. Maybe the email is taken.");
        }
    };

    // Handles login submission (FIXED: Added async)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "https://hypet-145797464141.us-central1.run.app/api/auth/login",
                loginUser
            );
            localStorage.setItem("token", response.data.access_token);
            toast.success("Login successful!");

            // Now fetch user details to check admin status
            const profileRes = await axios.get("http://localhost:8080/users/me", {
                headers: { Authorization: `Bearer ${response.data.access_token}` },
            });

            const isAdmin = profileRes.data?.is_admin;
            navigate(isAdmin ? "/admin" : "/profile");
        } catch (err) {
            console.error(err);
            toast.error("Invalid credentials");
        }
    };
    return (
        <>
            
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />
                <div className="login-container">
                    <form onSubmit={handleLogin}>
                    <div style={{ height: '15px' }} /> {/* adds white space */}                
                        <h2 style={{ fontSize: '35px'}}>Welcome to</h2>
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
                        <button type="submit" className="submit-button">
                            Login
                        </button>
                    </form>

                    <div className="signup-section">
                        <p>Don't have an account?</p>
                        <button className="submit-button" onClick={() => setSignUp(true)}>
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
                                    <button 
                                        type="button"
                                        className="submit-button"
                                        onClick={sendConfirmationCode}
                                    >
                                        Send Confirmation Code
                                    </button>
                                    <div style={{ height: '15px' }} /> {/* adds white space */}
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="confirmationCode"
                                            placeholder="Enter confirmation code"
                                            required
                                            value={confirmationCode}
                                            onChange={handleCodeChange}
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
