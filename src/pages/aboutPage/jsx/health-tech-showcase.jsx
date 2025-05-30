import '../css/health-tech-showcase.css';

export default function HealthTechShowcase() {
    return (
        <div className="medical-tech-container">
            <div className="medical-tech-wrapper">
                <div className="medical-tech-grid">
                    {/* Left Content */}
                    <div className="medical-tech-content">
                        {/* Heading */}
                        <div className="medical-tech-header">
                            <h1 className="medical-tech-title">
                                Innovative Eye Treatment
                                <br />
                                Technologies for Better Vision
                            </h1>
                            <p className="medical-tech-description">
                                Discover the latest in laser technology and cutting-edge treatments for eye health at Eyespire Clinic. We bring advanced solutions to improve your vision and ensure your well-being with the help of our highly experienced medical team.
                            </p>
                        </div>

                        {/* Progress Bars */}
                        <div className="medical-tech-stats">
                            {/* Retinal Screening */}
                            <div className="medical-tech-stat-item">
                                <div className="medical-tech-stat-header">
                                    <span className="medical-tech-stat-label">Retinal Screening</span>
                                    <span className="medical-tech-stat-value">97%</span>
                                </div>
                                <div className="medical-tech-progress-bar">
                                    <div className="medical-tech-progress-fill" style={{ width: "97%" }}></div>
                                </div>
                            </div>

                            {/* Imaging and Lipiflow Treatments */}
                            <div className="medical-tech-stat-item">
                                <div className="medical-tech-stat-header">
                                    <span className="medical-tech-stat-label">Imaging and Lipiflow Treatments</span>
                                    <span className="medical-tech-stat-value">99%</span>
                                </div>
                                <div className="medical-tech-progress-bar">
                                    <div className="medical-tech-progress-fill" style={{ width: "99%" }}></div>
                                </div>
                            </div>

                            {/* Optical Coherence Tomography */}
                            <div className="medical-tech-stat-item">
                                <div className="medical-tech-stat-header">
                                    <span className="medical-tech-stat-label">Optical Coherence Tomography (OCT)</span>
                                    <span className="medical-tech-stat-value">95%</span>
                                </div>
                                <div className="medical-tech-progress-bar">
                                    <div className="medical-tech-progress-fill" style={{ width: "95%" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Circular Pattern */}
                    <div className="medical-tech-visual">
                        <div className="medical-tech-circle"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
