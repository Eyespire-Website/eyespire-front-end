"use client"

import {useState} from "react"
import "./login.css"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEye, faEyeSlash, faShoppingCart} from '@fortawesome/free-solid-svg-icons'
import login_image from '../../../assets/login-image.jpg'
import authService from "../../../services/authService"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setMessage("")
        setLoading(true)

        try {
            const result = await authService.login(email, password)
            
            if (result.success) {
                console.log("Login successful:", result.data)
                
                // Lưu thông tin "Remember me" nếu được chọn
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email)
                } else {
                    localStorage.removeItem("rememberedEmail")
                }
                
                // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
                navigate("/")
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

    return (
        <div className="login-container">
            {/* Left Panel - Login Form */}
            <div className="login-panel">
                <div className="login-content">
                    {/* Header */}
                    <div className="header">
                        <div className="logo">
                            <img
                                src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"}
                                className="logo-image"
                                alt="Eyespire Logo"
                            />
                            <span className="logo-text">Eyespire</span>
                        </div>
                        <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
                    </div>

                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1>Welcome back!</h1>
                        <p>Please login to your account</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter Email or Username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
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
                                    required
                                />
                                <span className="password-toggle" onClick={toggleShowPassword}>
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
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
                            <a href="/forgot" className="forgot-password">
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
