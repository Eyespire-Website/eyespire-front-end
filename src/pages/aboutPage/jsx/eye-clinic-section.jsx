import { FaBriefcase, FaEye, FaUserMd, FaHeart } from 'react-icons/fa'; // Đảm bảo đã nhập FaUserMd
import '../css/eye-clinic-section.css';

export default function EyeClinicSection() {
    return (
        <div className="clinic-container22">
            <div className="clinic-wrapper22">
                <div className="clinic-grid22">
                    {/* Left side - Decorative Image */}
                    <div className="decorative-section22">
                        <div className="decorative-image22">
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
                    <div className="content-section22">
                        <div className="content-header22">
                            <h2 className="main-heading22">
                                Why <span className="brand-name22">Eyespire</span>
                                <br />
                                Eye Clinic?
                            </h2>
                            <p className="description-text22">
                                Eyespire Clinic is dedicated to providing advanced eye care solutions to help you improve your vision and enhance your quality of life,
                                with a team of experienced doctors and modern technology.
                            </p>
                        </div>


                        <div className="features-section22">
                            {/* Medical Experience */}
                            <div className="feature-item22">
                                <div className="feature-icon22">
                                    <FaBriefcase className="icon22" />
                                </div>
                                <div className="feature-text22">
                                    <h3 className="feature-title22">Medical</h3>
                                    <h3 className="feature-title22">Experience</h3>
                                </div>
                            </div>

                            {/* Saving Your Vision */}
                            <div className="feature-item22">
                                <div className="feature-icon22">
                                    <FaEye className="icon22" />
                                </div>
                                <div className="feature-text22">
                                    <h3 className="feature-title22">Saving Your</h3>
                                    <h3 className="feature-title22">Vision</h3>
                                </div>
                            </div>

                            {/* Experienced Doctors */}
                            <div className="feature-item22">
                                <div className="feature-icon22">
                                    <FaUserMd className="icon22" />
                                </div>
                                <div className="feature-text22">
                                    <h3 className="feature-title22">Experienced</h3>
                                    <h3 className="feature-title22">Doctors</h3>
                                </div>
                            </div>

                            {/* Advanced Technology */}
                            <div className="feature-item22">
                                <div className="feature-icon22">
                                    <FaHeart className="icon22" />
                                </div>
                                <div className="feature-text22">
                                    <h3 className="feature-title22">Advanced</h3>
                                    <h3 className="feature-title22">Technology</h3>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Circle */}
                        <div className="stats-container22">
                            <div className="stats-circle22">
                                <div className="stats-number22">550+</div>
                                <div className="stats-text22">
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
