import '../css/health-tech-showcase.css';

export default function HealthTechShowcase() {
    return (
        <div className="medical-tech-container33">
            <div className="medical-tech-wrapper33">
                <div className="medical-tech-grid33">
                    {/* Left Content */}
                    <div className="medical-tech-content33">
                        {/* Heading */}
                        <div className="medical-tech-header33">
                            <h1 className="medical-tech-title33">
                                Công Nghệ Điều Trị Mắt Tiên Tiến
                                <br />
                                Cho Tầm Nhìn Tốt Hơn
                            </h1>
                            <p className="medical-tech-description33">
                                Khám phá công nghệ laser mới nhất và các phương pháp điều trị tiên tiến cho sức khỏe mắt tại Phòng khám Eyespire. Chúng tôi mang đến các giải pháp tiên tiến để cải thiện thị lực và đảm bảo sức khỏe của bạn với sự hỗ trợ của đội ngũ y tế giàu kinh nghiệm.
                            </p>
                        </div>

                        {/* Progress Bars */}
                        <div className="medical-tech-stats33">
                            {/* Retinal Screening */}
                            <div className="medical-tech-stat-item33">
                                <div className="medical-tech-stat-header33">
                                    <span className="medical-tech-stat-label33">Tầm Soát Võng Mạc</span>
                                    <span className="medical-tech-stat-value33">97%</span>
                                </div>
                                <div className="medical-tech-progress-bar33">
                                    <div className="medical-tech-progress-fill33" style={{ width: "97%" }}></div>
                                </div>
                            </div>

                            {/* Imaging and Lipiflow Treatments */}
                            <div className="medical-tech-stat-item33">
                                <div className="medical-tech-stat-header33">
                                    <span className="medical-tech-stat-label33">Chụp Ảnh và Điều Trị Lipiflow</span>
                                    <span className="medical-tech-stat-value33">99%</span>
                                </div>
                                <div className="medical-tech-progress-bar33">
                                    <div className="medical-tech-progress-fill33" style={{ width: "99%" }}></div>
                                </div>
                            </div>

                            {/* Optical Coherence Tomography */}
                            <div className="medical-tech-stat-item33">
                                <div className="medical-tech-stat-header33">
                                    <span className="medical-tech-stat-label33">Chụp Cắt Lớp Kết Hợp Quang Học (OCT)</span>
                                    <span className="medical-tech-stat-value33">95%</span>
                                </div>
                                <div className="medical-tech-progress-bar33">
                                    <div className="medical-tech-progress-fill33" style={{ width: "95%" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Circular Pattern */}
                    <div className="medical-tech-visual33">
                        <div className="medical-tech-circle33"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
