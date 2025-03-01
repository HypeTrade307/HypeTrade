import { useState } from "react";

interface User {
    email: string;
    username: string;
    password: string;
}

const LoginForm = () => {
    const [signUp, setSignUp] = useState<boolean>(false);

    // State for login form
    const [loginUser, setLoginUser] = useState<Omit<User, 'username'>>({
        email: "",
        password: ""
    });

    // State for signup form
    const [newUser, setNewUser] = useState<User>({
        email: "",
        username: "",
        password: ""
    });

    // handles user trying to log in
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setLoginUser({
            ...loginUser, // creates copy of loginUser obj
            [name]: value
        });
    };

    // handles user wanting to sign up
    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewUser({
            ...newUser, // creates copy of newUser obj
            [name]: value
        });
    };

    // Handles login submission
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // handle a login here
    };

    // Handle signup submission
    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();

        // store signup info here

        setSignUp(false); // close signup window
    };

    return (
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
                <button
                    className="signup-button"
                    onClick={() => setSignUp(true)}
                >
                    Sign Up
                </button>
            </div>

            {signUp && (
                <div
                    className="hud-container"
                    onClick={() => setSignUp(false)}
                >
                    <div
                        className="hud-box"
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                    >
                        <button
                            className="cancel"
                            onClick={() => setSignUp(false)}
                        >
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
    );
}

export default LoginForm;