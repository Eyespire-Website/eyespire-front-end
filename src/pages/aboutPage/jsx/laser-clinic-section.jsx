import { FaRegClock, FaArrowRight } from 'react-icons/fa';  // Dùng icon từ react-icons
import '../css/laser-clinic-section.css';

export default function LaserClinicSection() {
    return (
        <div className="laser-clinic-container44">
            {/* Left decorative section */}
            <div className="decorative-section-custom44">
                <div className="pattern-overlay-custom44">
                    <svg width="100%" height="100%" viewBox="0 0 400 600" className="pattern-svg-custom44">
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
            <div className="content-section-custom44">
                <div className="content-wrapper-custom44">
                    <h1 className="main-title-custom44">
                        <span className="title-dark-custom44">Advanced Laser Technologies </span>
                        <span className="title-blue-custom44">for</span>
                        <br />
                        <span className="title-blue-custom44"> Eye Health</span>
                    </h1>

                    <p className="description-custom44">
                        At Eyespire Clinic, we provide state-of-the-art eye care services with advanced laser technology to improve your vision and quality of life. Backed by a team of experienced doctors and advanced technology.
                    </p>

                    <div className="hours-container-custom44">
                        <div className="clock-icon-custom44">
                            <FaRegClock className="clock-svg-custom44" /> {/* Dùng icon từ react-icons */}
                        </div>
                        <div className="hours-text-custom44">
                            <div className="hours-line-custom44">Mon - Sat: 09 AM - 09 PM</div>
                            <div className="hours-line-custom44">Sunday: 10 AM - 04 PM</div>
                        </div>
                    </div>

                    <button className="appointment-button-custom44">
                        Make an Appointment
                        <FaArrowRight className="arrow-icon-custom44" /> {/* Dùng icon từ react-icons */}
                    </button>
                </div>
            </div>
        </div>
    )
}
