import { FaEye, FaFileAlt } from 'react-icons/fa'; // Thay thế bằng React Icons
import '../css/MedicalLanding.css';



export default function MedicalLanding() {
    return (
        <div className="medical-landing66">
            <div className="container66">
                <div className="grid66">
                    {/* Left content section */}
                    <div className="content-section66">
                        <h1 className="main-title66">
                            <span className="title-dark66">Eyes </span>
                            <span className="title-blue66">Our Priority</span>
                        </h1>

                        <p className="description66">
                            Amet volutpat consequat mauris congue. Vitae elementum curabitur vitae nunc sed velit dignissim sodales
                        </p>

                        {/* Feature buttons */}
                        <div className="features66">
                            <div className="feature-item66">
                                <div className="feature-icon66">
                                    <FaFileAlt className="icon66" />
                                </div>
                                <span className="feature-text66">Medical Experience</span>
                            </div>

                            <div className="feature-item66">
                                <div className="feature-icon66">
                                    <FaEye className="icon66" />
                                </div>
                                <span className="feature-text66">Saving Your Vision</span>
                            </div>
                        </div>

                        {/* Left Image */}
                        <div className="image-placeholder66 left-image66">
                            <img src="https://i.pinimg.com/1200x/74/06/28/74062858fd59f90c6f8e44162b179707.jpg" alt="Left Image" className="image66" />
                        </div>
                    </div>

                    {/* Right content section */}
                    <div className="right-section66">
                        {/* Main Image */}
                        <div className="image-placeholder66 main-image66">
                            <img src="https://i.pinimg.com/736x/73/b4/71/73b471e709e82ffe2d6c103329737d24.jpg" alt="Left Image" className="image66" />

                        </div>

                        {/* Stats */}
                        <div className="stats-grid66">
                            <div className="stat-item66">
                                <h2 className="stat-number66">20+</h2>
                                <p className="stat-description66">Năm kinh nghiệm trong lĩnh vực chăm sóc mắt chuyên nghiệp</p>
                            </div>

                            <div className="stat-item66">
                                <h2 className="stat-number66">300+</h2>
                                <p className="stat-description66">Bệnh nhân đã được điều trị thành công với kết quả tốt nhất</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="cta-container66">
                            <button className="cta-button66">Đặt Lịch Hẹn</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}