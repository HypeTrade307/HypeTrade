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

  const [loginUser, setLoginUser] = useState<Omit<User, "username">>({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const toggleRememberMe = () => {
    const newValue = !rememberMe;
    setRememberMe(newValue);
    localStorage.setItem("rememberMe", newValue.toString());
  };

  const [newUser, setNewUser] = useState<User>({
    email: "",
    username: "",
    password: "",
  });

  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<number | null>(null);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginUser({
      ...loginUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationCode(e.target.value);
  };

  const sendConfirmationCode = async () => {
    if (!newUser.email) {
      toast.error("Please enter your email first.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/send_confirmation_code",
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
        "http://localhost:8080/auth/signup",
        {
          email: newUser.email,
          username: newUser.username,
          password: newUser.password,
          confirmation_code: parseInt(confirmationCode),
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/auth/login", loginUser);
      localStorage.setItem("token", response.data.access_token);
      toast.success("Login successful!");

      // Save rememberMe flag only, not the email
      localStorage.setItem("rememberMe", rememberMe.toString());

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
          <div className="form-group remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={toggleRememberMe}
              />{" "}
              Remember me?
            </label>
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
                  className="send-code-button"
                  onClick={sendConfirmationCode}
                >
                  Send Confirmation Code
                </button>
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
  );
};

export default LoginForm;
