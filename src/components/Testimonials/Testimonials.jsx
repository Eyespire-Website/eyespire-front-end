import React from "react";
import "./Testimonials.css";

const Testimonials = () => {
  const testimonialData = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Bệnh Nhân Thường Xuyên",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial1.jpg",
      content: "Tôi đã đến Eyespire để chăm sóc mắt trong hơn 5 năm. Nhân viên luôn chuyên nghiệp và các bác sĩ rất am hiểu. Thị lực của tôi chưa bao giờ tốt đến thế!"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Khách Hàng Mới",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial2.jpg",
      content: "Là người lo lắng về việc khám mắt, tôi đã rất ngạc nhiên về sự thoải mái trong toàn bộ quá trình. Bác sĩ giải thích mọi thứ rất rõ ràng và giúp tôi chọn được gọng kính hoàn hảo."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Người Dùng Kính Áp Tròng",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial3.jpg",
      content: "Quá trình lắp kính áp tròng rất kỹ lưỡng và chính xác. Tôi đánh giá cao việc nhân viên dành thời gian dạy tôi các kỹ thuật chăm sóc đúng cách. Mắt tôi cảm thấy rất tuyệt với những kính áp tròng mới này!"
    }
  ];

  return (
    <div className="testimonials-container">
      <div className="testimonials-header">
        <h2 className="testimonials-title">Bệnh Nhân Nói Gì Về Chúng Tôi</h2>
        <p className="testimonials-subtitle">Đọc những lời chứng thực từ các bệnh nhân hài lòng của chúng tôi</p>
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
              />
              <div className="testimonial-info">
                <h4 className="testimonial-name">{testimonial.name}</h4>
                <p className="testimonial-role">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
