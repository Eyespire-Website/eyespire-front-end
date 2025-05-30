import { FaEye, FaFileAlt } from 'react-icons/fa'; // Thay thế bằng React Icons
import '../css/MedicalLanding.css';



export default function MedicalLanding() {
    return (
        <div className="medical-landing">
            <div className="container">
                <div className="grid">
                    {/* Left content section */}
                    <div className="content-section">
                        <h1 className="main-title">
                            <span className="title-dark">Eyes </span>
                            <span className="title-blue">Our Priority</span>
                        </h1>

                        <p className="description">
                            Amet volutpat consequat mauris congue. Vitae elementum curabitur vitae nunc sed velit dignissim sodales
                        </p>

                        {/* Feature buttons */}
                        <div className="features">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaFileAlt className="icon" />
                                </div>
                                <span className="feature-text">Medical Experience</span>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaEye className="icon" />
                                </div>
                                <span className="feature-text">Saving Your Vision</span>
                            </div>
                        </div>

                        {/* Left Image */}
                        <div className="image-placeholder left-image">
                            <img src="https://i.pinimg.com/1200x/74/06/28/74062858fd59f90c6f8e44162b179707.jpg" alt="Left Image" className="image" />
                        </div>
                    </div>

                    {/* Right content section */}
                    <div className="right-section">
                        {/* Main Image */}
                        <div className="image-placeholder main-image">
                            <img src="https://i.pinimg.com/736x/73/b4/71/73b471e709e82ffe2d6c103329737d24.jpg" alt="Left Image" className="image" />

                        </div>

                        {/* Stats */}
                        <div className="stats-grid">
                            <div className="stat-item">
                                <h2 className="stat-number">20+</h2>
                                <p className="stat-description">Quis risus sed vulputate odio ut. Vitae elementum curabitur</p>
                            </div>

                            <div className="stat-item">
                                <h2 className="stat-number">300+</h2>
                                <p className="stat-description">Orci ac auctor augue mauris augue neque gravida est magna</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="cta-container">
                            <button className="cta-button">Make an Appointment</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}