import React, { useState } from "react";
import "./Services.css";

const ServiceCard = ({ title, number, description, imageUrl, service }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fallback image URL
  const fallbackImage = "https://via.placeholder.com/150x150/f0f0f0/666666?text=Service";

  const handleImageError = () => {
    console.log('Image failed to load:', imageUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setImageLoaded(true);
  };

  const handleBookingClick = () => {
    const serviceId = service?.id || '';
    const serviceName = title || service?.name || '';
    const serviceDescription = description || service?.description || '';
    
    // Check if we're on the homepage or services page
    const isOnHomepage = window.location.pathname === '/';
    
    if (isOnHomepage) {
      // If on homepage, scroll to appointment section and trigger auto-fill
      console.log('Booking service from homepage:', { serviceId, serviceName });
      
      // Scroll to appointment section
      const appointmentSection = document.getElementById('appointment-section');
      if (appointmentSection) {
        appointmentSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Trigger service auto-fill by dispatching a custom event
      const serviceSelectEvent = new CustomEvent('selectService', {
        detail: {
          serviceId: serviceId,
          serviceName: serviceName,
          serviceDescription: serviceDescription
        }
      });
      
      // Dispatch the event after a short delay to ensure smooth scroll starts
      setTimeout(() => {
        window.dispatchEvent(serviceSelectEvent);
      }, 300);
      
    } else {
      // If on services page, forward to homepage with URL parameters
      console.log('Booking service from services page, forwarding to homepage:', { serviceId, serviceName });
      window.location.href = `/?serviceId=${serviceId}&serviceName=${encodeURIComponent(serviceName)}&serviceDescription=${encodeURIComponent(serviceDescription)}`;
    }
  };

  return (
    <div className="service-card">
      {/* Top 2/3: Image Section with Button */}
      <div className="service-card-image-section">
        <div 
          className="service-card-image"
          style={{
            backgroundImage: `url(${imageError ? fallbackImage : (imageUrl || fallbackImage)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Button overlay on image */}
          <div className="service-card-button-overlay">
            <button className="service-button" onClick={handleBookingClick}>
              <span className="service-button-text">Đặt Dịch Vụ</span>
              <span className="service-button-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom 1/3: Content Section */}
      <div className="service-card-content-section">
        <div className="service-card-header">
          <h3 className="service-title">{title}</h3>
        </div>
        
        <div className="service-card-body">
          <p 
            className={`service-description ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Click to collapse' : 'Click to read more'}
          >
            {description}
          </p>
          {description && description.length > 60 && (
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
        src={imageError ? fallbackImage : (imageUrl || fallbackImage)}
        className="hidden-image" 
        alt={title}
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

export default ServiceCard;
