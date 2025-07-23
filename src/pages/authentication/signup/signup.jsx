"use client"

import {useState} from "react"
import "../login/login.css"
import {useNavigate} from "react-router-dom"
import {FcGoogle} from 'react-icons/fc'
import signup_image from "../../../assets/login-image.jpg"
import logo from "../../../assets/logo.png"
import authService from "../../../services/authService"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


export default function SignupPage() {
    const [username, setUsername] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const toggleShowPassword = () => {
        setShowPassword(prev => !prev);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(prev => !prev);
    };


    const handleSignup = async (e) => {
        e.preventDefault()
        setMessage("")

        if (!validateForm()) return;

        setLoading(true)


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


    const validateUsername = () => {
        if (!username.trim()) {
            setErrors(prev => ({ ...prev, username: "Username is required" }));
        } else {
            setErrors(prev => ({ ...prev, username: "" }));
        }
    };

    const validateName = () => {
        if (!name.trim()) {
            setErrors(prev => ({ ...prev, name: "Full name is required" }));
        } else {
            setErrors(prev => ({ ...prev, name: "" }));
        }
    };

    const validateEmail = () => {
        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: "Email is required" }));
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors(prev => ({ ...prev, email: "Invalid email format" }));
        } else {
            setErrors(prev => ({ ...prev, email: "" }));
        }
    };

    const validatePassword = () => {
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;

        if (!password) {
            setErrors(prev => ({ ...prev, password: "Password is required" }));
        } else if (password.length < 6) {
            setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }));
        } else if (!uppercaseRegex.test(password)) {
            setErrors(prev => ({ ...prev, password: "Password must contain at least 1 uppercase letter" }));
        } else if (!lowercaseRegex.test(password)) {
            setErrors(prev => ({ ...prev, password: "Password must contain at least 1 lowercase letter" }));
        } else if (!specialCharRegex.test(password)) {
            setErrors(prev => ({ ...prev, password: "Password must contain at least 1 special character" }));
        } else {
            setErrors(prev => ({ ...prev, password: "" }));
        }
    };

    const validateConfirmPassword = () => {
        if (!confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: "Please confirm your password" }));
        } else if (confirmPassword !== password) {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
        } else {
            setErrors(prev => ({ ...prev, confirmPassword: "" }));
        }
    };


    const validateForm = () => {
        validateUsername();
        validateName();
        validateEmail();
        validatePassword();
        validateConfirmPassword();

        // Trả về true nếu không có lỗi nào
        return (
            username.trim() &&
            name.trim() &&
            /\S+@\S+\.\S+/.test(email) &&
            password &&
            password.length >= 6 &&
            confirmPassword === password
        );
    };


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
                                src={logo}
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
                                onBlur={validateUsername}
                            />
                            {errors.username && <div className="error-message-valid">{errors.username}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={validateName}
                            />
                            {errors.name && <div className="error-message-valid">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validateEmail}
                            />
                            {errors.email && <div className="error-message-valid">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={validatePassword}
                                    required
                                />
                                <span className="password-toggle" onClick={toggleShowPassword}>
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </span>
                            </div>
                            {errors.password && <div className="error-message-valid">{errors.password}</div>}
                        </div>


                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={validateConfirmPassword}
                                    required
                                />
                                <span className="password-toggle" onClick={toggleShowConfirmPassword}>
            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
        </span>
                            </div>
                            {errors.confirmPassword && <div className="error-message-valid">{errors.confirmPassword}</div>}
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
