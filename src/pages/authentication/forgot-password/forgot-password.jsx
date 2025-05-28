"use client"

import { useState } from "react"
import "../login/login.css"
import { useNavigate } from "react-router-dom"
import forgot_image from "../../../assets/login-image.jpg"
import authService from "../../../services/authService"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setMessage("")
        setLoading(true)

        try {
            const response = await authService.forgotPassword(email)
            setMessage("Password reset link has been sent to your email.")
        } catch (error) {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString()
            setMessage(resMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            {/* Left Panel - Forgot Password Form */}
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

                    {/* Forgot Password Section */}
                    <div className="welcome-section">
                        <h1>Forgot your password?</h1>
                        <p>No worries. Enter your email to reset it.</p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className="error-message">{message}</div>
                        )}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                </div>

                <div className="footer">
                    <p>Eyespire 2025 All Right Reserved</p>
                </div>
            </div>

            {/* Right Panel - Image */}
            <div className="image-panel">
                <img
                    src={forgot_image}
                    alt="Forgot password illustration"
                    className="hero-image"
                />
                <div className="overlay-content">
                    <div className="greeting">Reset your password</div>
                    <div className="time">with Eyespire</div>
                    <div className="quote">"We help you see — and access — again."</div>
                </div>
            </div>
        </div>
    )
}
