import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-content">
        <div className="contact-info">
          <h2 className="contact-title">Liên Hệ Với Chúng Tôi</h2>
          <p className="contact-description">
            Bạn có thắc mắc về dịch vụ của chúng tôi hoặc muốn đặt lịch hẹn? 
            Hãy liên hệ với chúng tôi qua bất kỳ phương thức nào dưới đây hoặc điền vào biểu mẫu liên hệ.
          </p>
          
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="contact-text">
                <h4>Địa Điểm</h4>
                <p>123 Đường Chăm Sóc Mắt, Thành Phố Thị Giác, VC 12345</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className="contact-text">
                <h4>Điện Thoại</h4>
                <p>+123 45 67 890</p>
                <p>+098 76 54 321</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="contact-text">
                <h4>Email</h4>
                <p>info@eyespire.com</p>
                <p>support@eyespire.com</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="contact-text">
                <h4>Giờ Làm Việc</h4>
                <p>Thứ Hai - Thứ Sáu: 9:00 SA - 6:00 CH</p>
                <p>Thứ Bảy: 10:00 SA - 4:00 CH</p>
                <p>Chủ Nhật: Đóng Cửa</p>
              </div>
            </div>
          </div>
          
          <div className="social-media">
            <h4>Theo Dõi Chúng Tôi</h4>
            <div className="social-icons">
              <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
        
        <div className="contact-form-container">
          <h3>Gửi Tin Nhắn Cho Chúng Tôi</h3>
          <form className="contact-form">
            <div className="form-group">
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Subject" required />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message" rows="6" required></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
      
      <div className="map-container">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6963246222566!2d105.84052431493254!3d21.004806986012065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac76ccab6dd7%3A0x55e92a5b07a97d03!2sHanoi%20University%20of%20Science%20and%20Technology!5e0!3m2!1sen!2s!4v1621930067979!5m2!1sen!2s" 
          width="100%" 
          height="450" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
          title="Eyespire Location"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
