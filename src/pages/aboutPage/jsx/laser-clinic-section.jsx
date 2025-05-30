import { FaRegClock, FaArrowRight } from 'react-icons/fa';  // Dùng icon từ react-icons
import '../css/laser-clinic-section.css';

export default function LaserClinicSection() {
    return (
        <div className="laser-clinic-container">
            {/* Left decorative section */}
            <div className="decorative-section-custom">
                <div className="pattern-overlay-custom">
                    <svg width="100%" height="100%" viewBox="0 0 400 600" className="pattern-svg-custom">
                        <defs>
                            <pattern
                                id="diagonalStripes"
                                patternUnits="userSpaceOnUse"
                                width="20"
                                height="20"
                                patternTransform="rotate(45)"
                            >
                                <rect width="10" height="20" fill="#ff9999" opacity="0.6" />
                                <rect x="10" width="10" height="20" fill="transparent" />
                            </pattern>
                        </defs>

                    </svg>
                </div>
            </div>

            {/* Right content section */}
            <div className="content-section-custom">
                <div className="content-wrapper-custom">
                    <h1 className="main-title-custom">
                        <span className="title-dark-custom">Advanced Laser Technologies </span>
                        <span className="title-blue-custom">for</span>
                        <br />
                        <span className="title-blue-custom"> Eye Health</span>
                    </h1>

                    <p className="description-custom">
                        At Eyespire Clinic, we provide state-of-the-art eye care services with advanced laser technology to improve your vision and quality of life. Backed by a team of experienced doctors and advanced technology.
                    </p>

                    <div className="hours-container-custom">
                        <div className="clock-icon-custom">
                            <FaRegClock className="clock-svg-custom" /> {/* Dùng icon từ react-icons */}
                        </div>
                        <div className="hours-text-custom">
                            <div className="hours-line-custom">Mon - Sat: 09 AM - 09 PM</div>
                            <div className="hours-line-custom">Sunday: 10 AM - 04 PM</div>
                        </div>
                    </div>

                    <button className="appointment-button-custom">
                        Make an Appointment
                        <FaArrowRight className="arrow-icon-custom" /> {/* Dùng icon từ react-icons */}
                    </button>
                </div>
            </div>
        </div>
    )
}
