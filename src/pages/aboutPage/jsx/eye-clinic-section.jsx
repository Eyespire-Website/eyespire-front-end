import { FaBriefcase, FaEye, FaUserMd, FaHeart } from 'react-icons/fa'; // Đảm bảo đã nhập FaUserMd
import '../css/eye-clinic-section.css';

export default function EyeClinicSection() {
    return (
        <div className="clinic-container">
            <div className="clinic-wrapper">
                <div className="clinic-grid">
                    {/* Left side - Decorative Image */}
                    <div className="decorative-section">
                        <div className="decorative-image">
                            <img
                                src="https://i.pinimg.com/736x/f5/71/b3/f571b375ef07a5533dec016ae1ca79e2.jpg"
                                alt="Decorative"
                                style={{
                                    width: "100%",
                                    height: "auto", /* Đảm bảo chiều cao tự động điều chỉnh để giữ tỷ lệ gốc */
                                    maxHeight: "700px", /* Giới hạn chiều cao tối đa */
                                    objectFit: "contain", /* Giữ nguyên tỷ lệ của hình ảnh mà không bị cắt */
                                    borderRadius: "0.5rem"
                                }}
                            />
                        </div>
                    </div>



                    {/* Right side - Content */}
                    <div className="content-section">
                        <div className="content-header">
                            <h2 className="main-heading">
                                Why <span className="brand-name">Eyespire</span>
                                <br />
                                Eye Clinic?
                            </h2>
                            <p className="description-text">
                                Eyespire Clinic is dedicated to providing advanced eye care solutions to help you improve your vision and enhance your quality of life,
                                with a team of experienced doctors and modern technology.
                            </p>
                        </div>


                        <div className="features-section">
                            {/* Medical Experience */}
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaBriefcase className="icon" />
                                </div>
                                <div className="feature-text">
                                    <h3 className="feature-title">Medical</h3>
                                    <h3 className="feature-title">Experience</h3>
                                </div>
                            </div>

                            {/* Saving Your Vision */}
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaEye className="icon" />
                                </div>
                                <div className="feature-text">
                                    <h3 className="feature-title">Saving Your</h3>
                                    <h3 className="feature-title">Vision</h3>
                                </div>
                            </div>

                            {/* Experienced Doctors */}
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaUserMd className="icon" />
                                </div>
                                <div className="feature-text">
                                    <h3 className="feature-title">Experienced</h3>
                                    <h3 className="feature-title">Doctors</h3>
                                </div>
                            </div>

                            {/* Advanced Technology */}
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaHeart className="icon" />
                                </div>
                                <div className="feature-text">
                                    <h3 className="feature-title">Advanced</h3>
                                    <h3 className="feature-title">Technology</h3>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Circle */}
                        <div className="stats-container">
                            <div className="stats-circle">
                                <div className="stats-number">550+</div>
                                <div className="stats-text">
                                    Successfully
                                    <br />
                                    Eye Surgery
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
