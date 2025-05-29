import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../../services/authService";
import "../login/login.css";
import "../forgot-password/forgot-password.css";
import "./reset-password.css";
import login_image from "../../../assets/login-image.jpg";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Lấy email từ query parameters
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get("email");
        
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // Kiểm tra mật khẩu xác nhận
        if (newPassword !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp");
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (newPassword.length < 6) {
            setMessage("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        // Kiểm tra OTP
        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            setMessage("Mã OTP phải là 6 chữ số");
            return;
        }

        setLoading(true);

        try {
            const result = await authService.resetPassword(email, otp, newPassword);
            
            if (result.success) {
                setSuccess(true);
                setMessage("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            setMessage("Đã xảy ra lỗi khi đặt lại mật khẩu");
            console.error("Reset password error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            setMessage("Vui lòng nhập email");
            return;
        }

        setLoading(true);
        try {
            const result = await authService.forgotPassword(email);
            if (result.success) {
                setMessage("Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.");
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            setMessage("Đã xảy ra lỗi khi gửi lại mã OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Panel - Reset Password Form */}
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
                        <button className="signup-btn" onClick={() => navigate("/login")}>Đăng nhập</button>
                    </div>

                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1>Đặt lại mật khẩu</h1>
                        <p>Nhập mã OTP và mật khẩu mới của bạn</p>
                    </div>

                    {/* Reset Password Form */}
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

                            <div className="form-group">
                                <label htmlFor="otp">Mã OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    placeholder="Nhập mã OTP từ email"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="resend-otp-btn" 
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                >
                                    Gửi lại OTP
                                </button>
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {message && (
                                <div className={`message ${success ? "success-message" : "error-message"}`}>
                                    {message}
                                </div>
                            )}

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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
                            <button className="login-btn" onClick={() => navigate("/login")}>
                                Đăng nhập ngay
                            </button>
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
                    <div className="greeting">Chào mừng đến với</div>
                    <div className="time">Eyespire</div>
                    <div className="quote">"Chăm sóc thị lực của bạn với các chuyên gia hàng đầu."</div>
                </div>
            </div>
        </div>
    );
}
