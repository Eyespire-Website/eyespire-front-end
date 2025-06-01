import { FiPlay } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import '../css/optione-clinic.css';
import { useState } from "react";

export default function OptioneClinic() {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoID = "MQ68Ft3S2d0";

    const handleVideoClick = () => {
        setIsVideoPlaying(true);
    };

    const generatePixelClass = () => {
        const random = Math.random();
        if (random > 0.7) return "pixel77 pixel77-red-300";
        if (random > 0.5) return "pixel77 pixel77-red-200";
        if (random > 0.3) return "pixel77 pixel77-pink-200";
        return "pixel77 pixel77-pink-100";
    };

    const StatCircle = ({ percentage, label1, label2 }) => (
        <div className="stat-item77">
            <div className="stat-circle77">
                <svg className="stat-svg77" viewBox="0 0 36 36">
                    <path
                        className="stat-background-path77"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="stat-progress-path77"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        strokeDasharray={`${percentage}, 100`}
                    />
                </svg>
                <div className="stat-percentage77">
                    <span>{percentage}%</span>
                </div>
            </div>
            <div className="stat-text77">
                <p className="stat-label77">{label1}</p>
                <p className="stat-label77">{label2}</p>
            </div>
        </div>
    );

    const TestimonialCard = ({ quote, name, source, avatar77Url }) => (
        <div className="testimonial-card77">
            <div className="stars-container77">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star-icon77" />
                ))}
            </div>
            <blockquote className="testimonial-quote77">{quote}</blockquote>
            <div className="testimonial-attribution77">
                <div className="avatar77" style={{ backgroundImage: `url(${avatar77Url})` }} />
                <div>
                    <p className="attribution-name77">{name}</p>
                    <p className="attribution-source77">{source}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="clinic-container77">
            {/* Background Grid */}
            <div className="pixelated-background77">
                <div className="pixel-grid77">
                    {Array.from({ length: 400 }).map((_, i) => (
                        <div key={i} className={generatePixelClass()} />
                    ))}
                </div>
            </div>

            <div className="main-content77">
                {/* Heading */}
                <div className="heading-section77">
                    <h1 className="main-heading77">
                        Ready for a Simpler, Clear Life
                        <br />
                        with <span className="heading-highlight77">Eyespire Clinic</span>?
                    </h1>
                </div>

                {/* Content Container */}
                <div className="large-container77">
                    <div className="container-content77">

                        {/* Video Section */}
                        <div className="video-frame77">
                            {!isVideoPlaying ? (
                                <div className="video-container77" style={{ position: 'relative' }}>
                                    <img
                                        src={`https://img.youtube.com/vi/${videoID}/0.jpg`}
                                        alt="Video Thumbnail"
                                        className="video-thumbnail77"
                                        onClick={handleVideoClick}
                                    />
                                    <div className="play-button-container77">
                                        <button className="play-button77" onClick={handleVideoClick}>
                                            <FiPlay className="play-icon77" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="video-container77">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoID}?autoplay=1`}
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                        title="Clinic Video"
                                        frameBorder="0"
                                    ></iframe>
                                </div>
                            )}

                            <h3 className="video-title77">Watch Our Story</h3>
                            <p className="video-description77">
                                Discover how Eyespire Clinic transforms lives through exceptional eye care.
                            </p>
                        </div>

                        {/* Statistics & Testimonials */}
                        <div className="review-frame77">
                            <div className="review-content77">

                                {/* Statistics */}
                                <div className="statistics-grid77">
                                    <StatCircle percentage={95} label1="You'll Get" label2="Better Vision" />
                                    <StatCircle percentage={97} label1="Providing the" label2="Best Service" />
                                    <StatCircle percentage={92} label1="Patient" label2="Satisfaction" />
                                    <StatCircle percentage={89} label1="Recommend" label2="to Friends" />
                                </div>

                                {/* Testimonials */}
                                <div className="testimonials-grid77">
                                    <TestimonialCard
                                        quote='"Dr. Wright is personable and thorough. She spends time educating her patients with warmth and genuine concern. Staff is always friendly, helpful and quick!"'
                                        name="Aaron Almaraz"
                                        source="Google Review"
                                        avatar77Url="https://i.pinimg.com/736x/eb/76/a4/eb76a46ab920d056b02d203ca95e9a22.jpg"
                                    />
                                    <TestimonialCard
                                        quote='"Outstanding service and expertise! The team at OptiOne made my vision correction journey smooth and comfortable. Highly professional and caring staff."'
                                        name="Sarah Johnson"
                                        source="Yelp Review"
                                        avatar77Url="https://i.pinimg.com/736x/c4/5d/52/c45d528f75138d04b06aefb50f59d34d.jpg"
                                    />
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
