import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";
import "../login/login.css";
import "./forgot-password.css";
import logo from "../../../assets/logo.png";
import login_image from "../../../assets/login-image.jpg";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const result = await authService.forgotPassword(email);
            
            if (result.success) {
                setSuccess(true);
                setMessage("Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư để lấy mã xác thực.");
                // Chuyển hướng đến trang reset-password với email đã nhập
                setTimeout(() => {
                    navigate(`/reset-password?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            setMessage("Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu");
            console.error("Forgot password error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Panel - Forgot Password Form */}
            <div className="login-panel">
                <div className="login-content">
                    {/* Header */}
                    <div className="header">
                        <div className="logo" onClick={() => navigate("/")}>
                            <img
                                src={logo}
                                className="logo-image"
                                alt="Eyespire Logo"
                            />
                            <span className="logo-text">Eyespire</span>
                        </div>
                        <button className="signup-btn" onClick={() => navigate("/login")}>Đăng nhập</button>
                    </div>

                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1>Quên mật khẩu</h1>
                        <p>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</p>
                    </div>

                    {/* Forgot Password Form */}
                    {!success ? (
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {message && (
                                <div className={`message ${success ? "success-message" : "error-message"}`}>
                                    {message}
                                </div>
                            )}

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Gửi mã OTP"}
                            </button>

                            <div className="auth-links">
                                <p>
                                    <a href="/login">Quay lại đăng nhập</a>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="success-container">
                            <div className="success-icon">✓</div>
                            <div className="success-message">{message}</div>
                            <p className="redirect-message">Đang chuyển hướng đến trang đặt lại mật khẩu...</p>
                        </div>
                    )}
                </div>

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
    );
}
