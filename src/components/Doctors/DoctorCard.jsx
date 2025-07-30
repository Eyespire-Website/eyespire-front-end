import React, { useState } from "react";
import "./DoctorCard.css";

const DoctorCard = ({ doctor }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fallbackImage = "/images/default-doctor.jpg";

  const handleImageError = () => {
    console.log('Doctor image failed to load:', doctor.user?.avatarUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Doctor image loaded successfully:', doctor.user?.avatarUrl);
    setImageLoaded(true);
  };

  const getImageUrl = () => {
    if (imageError) return fallbackImage;
    if (doctor.user?.avatarUrl) {
      return doctor.user.avatarUrl.startsWith('http') 
        ? doctor.user.avatarUrl 
        : `http://localhost:8080${doctor.user.avatarUrl}`;
    }
    return fallbackImage;
  };

  const getDoctorName = () => {
    return doctor.user?.name || doctor.fullName || doctor.name || 'Không có tên';
  };

  const getSpecialty = () => {
    if (doctor.specialty && typeof doctor.specialty === 'object') {
      return doctor.specialty.name || 'Chưa có chuyên khoa';
    }
    return doctor.specialty || doctor.specialization || 'Chưa có chuyên khoa';
  };

  const handleBookingClick = () => {
    window.location.href = `/?doctorId=${doctor.id}&doctorName=${encodeURIComponent(getDoctorName())}&specialty=${encodeURIComponent(getSpecialty())}`;
  };

  return (
    <div className="doctor-card">
      {/* Top 2/3: Image Section with Button */}
      <div className="doctor-card-image-section">
        <div 
          className="doctor-card-image"
          style={{
            backgroundImage: `url(${getImageUrl()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Button overlay on image */}
          <div className="doctor-card-button-overlay">
            <button className="doctor-button" onClick={handleBookingClick}>
              <span className="doctor-button-text">Đặt Lịch Hẹn</span>
              <span className="doctor-button-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom 1/3: Content Section */}
      <div className="doctor-card-content-section">
        <div className="doctor-card-header">
          <h3 className="doctor-name">{getDoctorName()}</h3>
          <p className="doctor-specialty">{getSpecialty()}</p>
        </div>
        
        <div className="doctor-card-body">
          <p 
            className={`doctor-description ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Click to collapse' : 'Click to read more'}
          >
            {doctor.description || 'Chưa có mô tả'}
          </p>
          {doctor.description && doctor.description.length > 80 && (
            <button 
              className="read-more-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'Thu gọn' : 'Đọc thêm'}
            </button>
          )}
        </div>
      </div>
      
      {/* Hidden image for loading/error handling */}
      <img 
        src={getImageUrl()}
        className="hidden-image" 
        alt={`Bác sĩ ${getDoctorName()}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: 'none' }}
      />
      
      {!imageLoaded && !imageError && (
        <div className="image-loading-overlay">Loading...</div>
      )}
    </div>
  );
};

export default DoctorCard;
