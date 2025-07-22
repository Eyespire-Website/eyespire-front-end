"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import authService from "../../../services/authService"
import "../login/login.css"
import logo from "../../../assets/logo.png";
import signup_image from "../../../assets/login-image.jpg";

export default function VerifyOtpPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const email = location.state?.email || ""  // Lấy email từ state

    const [otp, setOtp] = useState("")
    const [message, setMessage] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!email) {
            // Nếu không có email được truyền sang thì chuyển hướng lại về signup
            navigate("/signup")
        }
    }, [email, navigate])

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await authService.verifyOtp(email, otp);
            setSuccess(true);
            setMessage("OTP verified successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            const resMessage =
                (error.response && error.response.data) ||
                error.message ||
                error.toString();
            setMessage(resMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-container">
            <div className="login-panel">
                <div className="login-content">
                    <div className="header">
                        <div className="logo" onClick={() => navigate("/")}>
                            <img
                                src={logo}
                                className="logo-image"
                                alt="Eyespire Logo"
                            />
                            <span className="logo-text">Eyespire</span>
                        </div>
                    </div>

                    <div className="welcome-section">
                        <h1>Verify your email</h1>
                        <p>We’ve sent a 6-digit code to <strong>{email}</strong></p>
                    </div>

                    <form onSubmit={handleVerify} className="login-form">
                        <div className="form-group">
                            <label htmlFor="otp">OTP Code</label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter the 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className={success ? "success-message" : "error-message"}>
                                {message}
                            </div>
                        )}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </form>
                </div>

                <div className="footer">
                    <p>Eyespire 2025 All Right Reserved</p>
                </div>
            </div>

            <div className="image-panel">
                <img
                    src={signup_image}
                    alt="OTP illustration"
                    className="hero-image"
                />
                <div className="overlay-content">
                    <div className="greeting">One last step</div>
                    <div className="time">Eyespire</div>
                    <div className="quote">"Enter the code to activate your vision."</div>
                </div>
            </div>
        </div>
    )
}
