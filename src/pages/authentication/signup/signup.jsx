"use client"

import {useState} from "react"
import "../login/login.css"
import {useNavigate} from "react-router-dom"
import {FcGoogle} from 'react-icons/fc'
import signup_image from "../../../assets/login-image.jpg"
import authService from "../../../services/authService"

export default function SignupPage() {
    const [username, setUsername] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSignup = async (e) => {
        e.preventDefault()
        setMessage("")
        setLoading(true)

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.")
            setLoading(false)
            return
        }

        try {
            const response = await authService.signup(username, name, email, password)
            console.log("Signup successful:", response)

            navigate("/signup/verify-otp", {state: {email}})
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


    const handleGoogleSignup = async () => {
        setMessage("")
        setLoading(true)

        try {
            const response = await authService.loginWithGoogle()
            console.log("Google signup initiated:", response)
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

    return (
        <div className="login-container">
            {/* Left Panel - Signup Form */}
            <div className="login-panel">
                <div className="login-content">
                    {/* Header */}
                    <div className="header">
                        <div className="logo" onClick={() => navigate("/")}>
                            <img
                                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
                                className="logo-image"
                                alt="Eyespire Logo"
                            />
                            <span className="logo-text">Eyespire</span>
                        </div>
                        <button className="signup-btn" onClick={() => navigate("/login")}>Log In</button>
                    </div>

                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1>Create an account</h1>
                        <p>Join us and see clearly with Eyespire</p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className="error-message">{message}</div>
                        )}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>

                        <div className="social-login">
                            <div className="divider">
                                <span>Or continue with</span>
                            </div>
                            <button
                                type="button"
                                className="google-login-btn"
                                onClick={handleGoogleSignup}
                                disabled={loading}
                            >
                                <FcGoogle className="google-icon"/>
                                <span>Sign up with Google</span>
                            </button>
                        </div>
                    </form>
                </div>

                <div className="footer">
                    <p>Eyespire 2025 All Right Reserved</p>
                </div>
            </div>

            {/* Right Panel - Image */}
            <div className="image-panel">
                <img
                    src={signup_image}
                    alt="Eye care professional"
                    className="hero-image"
                />
                <div className="overlay-content">
                    <div className="greeting">Join us at</div>
                    <div className="time">Eyespire</div>
                    <div className="quote">"See a brighter future with expert vision care."</div>
                </div>
            </div>
        </div>
    )
}
