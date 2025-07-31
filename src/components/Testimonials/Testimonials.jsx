import React, { useState, useEffect } from "react";
import "./Testimonials.css";
import serviceFeedbackService from "../../services/serviceFeedbackService";

const Testimonials = () => {
  const [testimonialData, setTestimonialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback data in case API fails
  const fallbackTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Bệnh Nhân Thường Xuyên",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial1.jpg",
      content: "Tôi đã đến Eyespire để chăm sóc mắt trong hơn 5 năm. Nhân viên luôn chuyên nghiệp và các bác sĩ rất am hiểu. Thị lực của tôi chưa bao giờ tốt đến thế!",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Khách Hàng Mới",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial2.jpg",
      content: "Là người lo lắng về việc khám mắt, tôi đã rất ngạc nhiên về sự thoải mái trong toàn bộ quá trình. Bác sĩ giải thích mọi thứ rất rõ ràng và giúp tôi chọn được gọng kính hoàn hảo.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Người Dùng Kính Áp Tròng",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial3.jpg",
      content: "Quá trình lắp kính áp tròng rất kỹ lưỡng và chính xác. Tôi đánh giá cao việc nhân viên dành thời gian dạy tôi các kỹ thuật chăm sóc đúng cách. Mắt tôi cảm thấy rất tuyệt với những kính áp tròng mới này!",
      rating: 5
    }
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all feedbacks from the service
      const allFeedbacks = await serviceFeedbackService.getAllFeedbacks();
      
      if (allFeedbacks && allFeedbacks.length > 0) {
        // Filter feedbacks with rating > 4 stars
        const highRatedFeedbacks = allFeedbacks.filter(feedback => feedback.rating > 4);
        
        // Sort by rating (highest first) and then by creation date (newest first)
        const sortedFeedbacks = highRatedFeedbacks.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Take only the top 3 feedbacks
        const topFeedbacks = sortedFeedbacks.slice(0, 3);
        
        // Transform the data to match the testimonial format
        const transformedFeedbacks = topFeedbacks.map((feedback, index) => ({
          id: feedback.id || index + 1,
          name: feedback.Patient?.name || feedback.patientName || `Bệnh nhân ${index + 1}`,
          role: `Đánh giá ${feedback.rating} sao`,
          image: feedback.Patient?.avatar || `https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial${(index % 3) + 1}.jpg`,
          content: feedback.comment || feedback.content,
          rating: feedback.rating,
          createdAt: feedback.createdAt
        }));
        
        if (transformedFeedbacks.length > 0) {
          setTestimonialData(transformedFeedbacks);
        } else {
          // If no high-rated feedbacks found, use fallback data
          setTestimonialData(fallbackTestimonials);
        }
      } else {
        // If no feedbacks found, use fallback data
        setTestimonialData(fallbackTestimonials);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Không thể tải đánh giá từ khách hàng');
      // Use fallback data when API fails
      setTestimonialData(fallbackTestimonials);
    } finally {
      setLoading(false);
    }
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">Bệnh Nhân Nói Gì Về Chúng Tôi</h2>
          <p className="testimonials-subtitle">Đọc những lời chứng thực từ các bệnh nhân hài lòng của chúng tôi</p>
        </div>
        <div className="testimonials-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải đánh giá từ khách hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="testimonials-container">
      <div className="testimonials-header">
        <h2 className="testimonials-title">Bệnh Nhân Nói Gì Về Chúng Tôi</h2>
        <p className="testimonials-subtitle">
          {error ? 'Đọc những lời chứng thực từ các bệnh nhân hài lòng của chúng tôi' : 
           `Đánh giá từ ${testimonialData.length} bệnh nhân hài lòng với dịch vụ của chúng tôi`}
        </p>
        {error && (
          <div className="testimonials-error">
            <p className="error-message">{error}</p>
            <button onClick={fetchFeedbacks} className="retry-button">
              Thử lại
            </button>
          </div>
        )}
      </div>
      <div className="testimonials-grid">
        {testimonialData.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <div className="testimonial-content">
              <p>"{testimonial.content}"</p>
            </div>
            <div className="testimonial-author">
              <img 
                src={testimonial.image} 
                alt={testimonial.name} 
                className="testimonial-image" 
                onError={(e) => {
                  e.target.src = `https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial${(testimonial.id % 3) + 1}.jpg`;
                }}
              />
              <div className="testimonial-info">
                <h4 className="testimonial-name">{testimonial.name}</h4>
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="testimonial-role">{testimonial.role}</p>
                {testimonial.createdAt && (
                  <p className="testimonial-date">
                    {serviceFeedbackService.formatFeedbackDate(testimonial.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
