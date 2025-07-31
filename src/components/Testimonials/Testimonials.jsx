import React, { useState, useEffect } from "react";
import "./Testimonials.css";
import serviceFeedbackService from "../../services/serviceFeedbackService";

const Testimonials = () => {
  const [testimonialData, setTestimonialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasValidFeedbacks, setHasValidFeedbacks] = useState(false);

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
        
        if (highRatedFeedbacks.length > 0) {
          // Sort by rating (highest first) and then by creation date (newest first)
          const sortedFeedbacks = highRatedFeedbacks.sort((a, b) => {
            if (b.rating !== a.rating) {
              return b.rating - a.rating;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          // Take only the top 3 feedbacks
          const topFeedbacks = sortedFeedbacks.slice(0, 3);
          
          // Transform the data to match the testimonial format - always use patient info from feedback
          const transformedFeedbacks = topFeedbacks.map((feedback, index) => {
            // Get patient avatar URL with proper base URL
            let patientImage = '/images/default-avatar.jpg'; // Default fallback
            if (feedback.Patient?.avatar) {
              patientImage = feedback.Patient.avatar.startsWith('http') 
                ? feedback.Patient.avatar 
                : `https://eyespire-back-end.onrender.com${feedback.Patient.avatar}`;
            }
            
            return {
              id: feedback.id || index + 1,
              name: feedback.Patient?.name || feedback.patientName || `Bệnh nhân ${index + 1}`,
              role: `Đánh giá ${feedback.rating} sao`,
              image: patientImage,
              content: feedback.comment || feedback.content || 'Dịch vụ rất tốt!',
              rating: feedback.rating,
              createdAt: feedback.createdAt
            };
          });
          
          setTestimonialData(transformedFeedbacks);
          setHasValidFeedbacks(true);
        } else {
          // No high-rated feedbacks found - don't show testimonials section
          setTestimonialData([]);
          setHasValidFeedbacks(false);
        }
      } else {
        // No feedbacks found - don't show testimonials section
        setTestimonialData([]);
        setHasValidFeedbacks(false);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Không thể tải đánh giá từ khách hàng');
      // Don't show testimonials section when API fails
      setTestimonialData([]);
      setHasValidFeedbacks(false);
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

  // Don't render anything if loading and no valid feedbacks
  if (loading) {
    return (
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">Bệnh Nhân Nói Gì Về Chúng Tôi</h2>
          <p className="testimonials-subtitle">Đang tải đánh giá từ khách hàng...</p>
        </div>
        <div className="testimonials-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải đánh giá từ khách hàng...</p>
        </div>
      </div>
    );
  }

  // Don't render testimonials section if no valid feedbacks
  if (!hasValidFeedbacks || testimonialData.length === 0) {
    return null;
  }

  return (
    <div className="testimonials-container">
      <div className="testimonials-header">
        <h2 className="testimonials-title">Bệnh Nhân Nói Gì Về Chúng Tôi</h2>
        <p className="testimonials-subtitle">
          Đánh giá từ {testimonialData.length} bệnh nhân hài lòng với dịch vụ của chúng tôi
        </p>
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
                  e.target.src = '/images/default-avatar.jpg';
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