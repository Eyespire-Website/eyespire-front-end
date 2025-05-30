import { FiPlay } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import '../css/optione-clinic.css';
import { useState } from "react"; // Thêm hook useState để điều khiển trạng thái hiển thị video

export default function OptioneClinic() {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false); // Trạng thái video có đang phát hay không
    const videoID = "MQ68Ft3S2d0"; // Video ID của YouTube

    const handleVideoClick = () => {
        setIsVideoPlaying(true); // Khi nhấn vào Play, video sẽ được phát
    }

    const generatePixelClass = () => {
        const random = Math.random()
        if (random > 0.7) return "pixel pixel-red-300"
        if (random > 0.5) return "pixel pixel-red-200"
        if (random > 0.3) return "pixel pixel-pink-200"
        return "pixel pixel-pink-100"
    }

    const StatCircle = ({ percentage, label1, label2 }) => (
        <div className="stat-item">
            <div className="stat-circle">
                <svg className="stat-svg" viewBox="0 0 36 36">
                    <path
                        className="stat-background-path"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="stat-progress-path"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        strokeDasharray={`${percentage}, 100`}
                    />
                </svg>
                <div className="stat-percentage">
                    <span>{percentage}%</span>
                </div>
            </div>
            <div className="stat-text">
                <p className="stat-label">{label1}</p>
                <p className="stat-label">{label2}</p>
            </div>
        </div>
    )

    const TestimonialCard = ({ quote, name, source, avatarUrl }) => (
        <div className="testimonial-card">
            <div className="stars-container">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                ))}
            </div>
            <blockquote className="testimonial-quote">{quote}</blockquote>
            <div className="testimonial-attribution">
                <div className="avatar">
                    <img src={avatarUrl} alt="Avatar" className="avatar-image" />
                </div>
                <div>
                    <p className="attribution-name">{name}</p>
                    <p className="attribution-source">{source}</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="clinic-container">
            {/* Pixelated Background Pattern */}
            <div className="pixelated-background">
                <div className="pixel-grid">
                    {Array.from({ length: 400 }).map((_, i) => (
                        <div key={i} className={generatePixelClass()} />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Main Heading */}
                <div className="heading-section">
                    <h1 className="main-heading">
                        Ready for a Simpler, Clear Life
                        <br />
                        with <span className="heading-highlight">Eyespire Clinic</span>?
                    </h1>
                </div>

                {/* Large Container wrapping both frames */}
                <div className="large-container">
                    <div className="container-content">
                        {/* Video Frame - Top */}
                        <div className="video-frame">
                            <div className="video-content">
                                {/* Play Button */}
                                {!isVideoPlaying ? (
                                    <div className="video-container">
                                        {/* Thumbnail */}
                                        <img
                                            src={`https://img.youtube.com/vi/${videoID}/0.jpg`}
                                            alt="Video Thumbnail"
                                            className="video-thumbnail"
                                            onClick={handleVideoClick} // Chuyển sang video khi nhấn vào thumbnail
                                        />
                                        {/* Play Button */}
                                        <div className="play-button-container">
                                            <button onClick={handleVideoClick} className="play-button">
                                                <FiPlay className="play-icon" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="video-container">
                                        <iframe
                                            width="100%"
                                            height="315"
                                            src={`https://www.youtube.com/embed/${videoID}?autoplay=1`}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen>
                                        </iframe>
                                    </div>
                                )}

                                {/* Video Title */}
                                <h3 className="video-title">Watch Our Story</h3>
                                <p className="video-description">
                                    Discover how Eyespire Clinic transforms lives through exceptional eye care
                                </p>
                            </div>
                        </div>

                        {/* Review Frame - Bottom */}
                        <div className="review-frame">
                            <div className="review-content">
                                {/* Statistics - 4 circles */}
                                <div className="statistics-grid">
                                    <StatCircle percentage={95} label1="You'll Get" label2="Better Vision" />
                                    <StatCircle percentage={97} label1="Providing the" label2="Best Service" />
                                    <StatCircle percentage={92} label1="Patient" label2="Satisfaction" />
                                    <StatCircle percentage={89} label1="Recommend" label2="to Friends" />
                                </div>

                                {/* Testimonial Cards */}
                                <div className="testimonials-grid">
                                    <TestimonialCard
                                        quote='" Dr. Wright is personable and thorough. She spends time educating her patients with warmth and genuine concern. Staff is always friendly, helpful and quick! "'
                                        name="Aaron Almaraz"
                                        source="Google Review"
                                        avatarUrl="https://i.pinimg.com/736x/eb/76/a4/eb76a46ab920d056b02d203ca95e9a22.jpg"
                                    />
                                    <TestimonialCard
                                        quote='" Outstanding service and expertise! The team at OptiOne made my vision correction journey smooth and comfortable. Highly professional and caring staff. "'
                                        name="Sarah Johnson"
                                        source="Yelp Review"
                                        avatarUrl="https://i.pinimg.com/736x/c4/5d/52/c45d528f75138d04b06aefb50f59d34d.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
