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
                                Innovative Eye Treatment
                                <br />
                                Technologies for Better Vision
                            </h1>
                            <p className="medical-tech-description33">
                                Discover the latest in laser technology and cutting-edge treatments for eye health at Eyespire Clinic. We bring advanced solutions to improve your vision and ensure your well-being with the help of our highly experienced medical team.
                            </p>
                        </div>

                        {/* Progress Bars */}
                        <div className="medical-tech-stats33">
                            {/* Retinal Screening */}
                            <div className="medical-tech-stat-item33">
                                <div className="medical-tech-stat-header33">
                                    <span className="medical-tech-stat-label33">Retinal Screening</span>
                                    <span className="medical-tech-stat-value33">97%</span>
                                </div>
                                <div className="medical-tech-progress-bar33">
                                    <div className="medical-tech-progress-fill33" style={{ width: "97%" }}></div>
                                </div>
                            </div>

                            {/* Imaging and Lipiflow Treatments */}
                            <div className="medical-tech-stat-item33">
                                <div className="medical-tech-stat-header33">
                                    <span className="medical-tech-stat-label33">Imaging and Lipiflow Treatments</span>
                                    <span className="medical-tech-stat-value33">99%</span>
                                </div>
                                <div className="medical-tech-progress-bar33">
                                    <div className="medical-tech-progress-fill33" style={{ width: "99%" }}></div>
                                </div>
                            </div>

                            {/* Optical Coherence Tomography */}
                            <div className="medical-tech-stat-item33">
                                <div className="medical-tech-stat-header33">
                                    <span className="medical-tech-stat-label33">Optical Coherence Tomography (OCT)</span>
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
