"use client"

import {useState, useEffect} from "react"
import "./login.css"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEye, faEyeSlash, faShoppingCart} from '@fortawesome/free-solid-svg-icons'
import login_image from '../../../assets/login-image.jpg'
import logo from '../../../assets/logo.png'
import authService from "../../../services/authService"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from 'react-icons/fc'



export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const [errors, setErrors] = useState({});

    // Load remembered username on component mount
    useEffect(() => {
        const rememberedUsername = localStorage.getItem("rememberedUsername");
        if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault()
        setMessage("")

        if (!validateForm()) return;

        setLoading(true)

        try {
            const result = await authService.login(username, password)
            
            if (result.success) {
                console.log("Login successful:", result.data)
                
                // Lưu thông tin "Remember me" nếu được chọn
                if (rememberMe) {
                    localStorage.setItem("rememberedUsername", username)
                } else {
                    localStorage.removeItem("rememberedUsername")
                }
                
                // Chuyển hướng dựa trên vai trò người dùng
                const redirectPath = authService.getRoleBasedRedirectPath(result.data.role)
                navigate(redirectPath)
            } else {
                // Hiển thị thông báo lỗi từ server
                setMessage(result.message)
                setLoading(false)
            }
        } catch (error) {
            // Xử lý lỗi không mong muốn (ví dụ: lỗi mạng)
            setMessage("Đã xảy ra lỗi khi kết nối đến server")
            setLoading(false)
            console.error("Login error:", error)
        }
    }

    const handleGoogleLogin = async () => {
        setMessage("")
        setLoading(true)
        
        try {
            const response = await authService.loginWithGoogle()
            console.log("Google login initiated:", response)
            // Google OAuth flow will redirect to Google's consent page
        } catch (error) {
            const resMessage = 
                (error.response && 
                 error.response.data && 
                 error.response.data.message) ||
                error.message ||
                error.toString()
            
            setMessage(resMessage)
            setLoading(false)
        }
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const getCurrentTime = () => {
        const now = new Date()
        return now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const validateForm = () => {
        validateUsername();
        validatePassword();

        return (
            username.trim().length > 0 &&
            password &&
            password.length >= 6
        );
    };


    // THÊM HAI HÀM validate riêng:
    const validateUsername = () => {
        if (!username.trim()) {
            setErrors((prev) => ({ ...prev, username: "Username or email is required" }));
        } else {
            setErrors((prev) => ({ ...prev, username: "" }));
        }
    };

    const validatePassword = () => {
        if (!password) {
            setErrors((prev) => ({ ...prev, password: "Password is required" }));
        } else if (password.length < 6) {
            setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
        } else {
            setErrors((prev) => ({ ...prev, password: "" }));
        }
    };

    return (
        <div className="login-container">
            {/* Left Panel - Login Form */}
            <div className="login-panel">
                <div className="login-content">
                    {/* Header */}
                    <div className="lgin-header">
                        <div className="lgin-logo" onClick={() => navigate("/")}>
                            <img
                                src={logo}
                                className="lgin-logo-image"
                                alt="Eyespire Logo"
                            />
                            <span className="lgin-logo-text">Eyespire</span>
                        </div>
                        <button className="lgin-signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
                    </div>

                    {/* Welcome Section */}
                    <div className="lgin-welcome-section">
                        <h1>Welcome back!</h1>
                        <p>Please login to your account</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username or Email</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter Username or Email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onBlur={validateUsername}
                            />

                            {errors.username && <div className="error-message-valid">{errors.username}</div>}


                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={validatePassword}
                                />
                                <span className="password-toggle" onClick={toggleShowPassword}>
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>

                            {errors.password && <div className="error-message-valid">{errors.password}</div>}

                        </div>

                        {message && (
                            <div className="error-message">
                                {message}
                            </div>
                        )}

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" checked={rememberMe}
                                       onChange={(e) => setRememberMe(e.target.checked)}/>
                                Remember me
                            </label>
                            <a href="/forgot-password" className="forgot-password">
                                Forgot your password?
                            </a>
                        </div>

                        <button 
                            type="submit" 
                            className="login-btn" 
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                        
                        <div className="social-login">
                            <div className="divider">
                                <span>Or continue with</span>
                            </div>
                            <button 
                                type="button" 
                                className="google-login-btn" 
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                <FcGoogle className="google-icon" />
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="footer">
                    <p>Eyespire 2025 All Right Reserved</p>
                </div>
            </div>

            {/* Right Panel - Image */}
            <div className="image-panel">
                <img
                    src={login_image}
                    alt="Eye care professional"
                    className="hero-image"
                />
                <div className="overlay-content">
                    <div className="greeting">Welcome to</div>
                    <div className="time">Eyespire</div>
                    <div className="quote">"The best eye doctors & technology for your vision care."</div>
                </div>
            </div>
        </div>
    )
}
