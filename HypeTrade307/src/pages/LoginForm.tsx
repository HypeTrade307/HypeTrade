import { useState } from "react";
import axios from "axios";

interface User {
    email: string;
    username: string;
    password: string;
}

const LoginForm = () => {
    const [signUp, setSignUp] = useState<boolean>(false);
    const [loginUser, setLoginUser] = useState<Omit<User, 'username'>>({
        email: "",
        password: ""
    });

    const [newUser, setNewUser] = useState<User>({
        email: "",
        username: "",
        password: ""
    });

    const [errorMessage, setErrorMessage] = useState<string>("");

    // Handle login input changes
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginUser({...loginUser, [e.target.name]: e.target.value});
    };

    // Handle signup input changes
    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser({...newUser, [e.target.name]: e.target.value});
    };

    // Handles login submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/auth/login", loginUser);
            localStorage.setItem("token", response.data.access_token);
            setErrorMessage("");  // Clear errors if login is successful
            alert("Login successful!");
        } catch (error) {
            setErrorMessage("Invalid credentials");
        }
    };

    // Handle signup submission
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
    
        try {
            const response = await fetch("http://127.0.0.1:8000/auth/signup", {
                method: "POST",  // ✅ Ensure this is POST
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.detail || "Error signing up.");
            }
    
            alert("Account created successfully!");
            setSignUp(false);
        } catch (error) {
            alert("ERROR");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin}>
                <h2>Welcome to</h2>
                <h1>HypeTrade</h1>
                {errorMessage && <p className="error">{errorMessage}</p>}
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
                    <div className="hud-box" onClick={(e) => e.stopPropagation()}>
                        <button className="cancel" onClick={() => setSignUp(false)}>x</button>
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
    );
};

export default LoginForm;
