import React from "react";
import "./Testimonials.css";

const Testimonials = () => {
  const testimonialData = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Regular Patient",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial1.jpg",
      content: "I've been coming to Eyespire for my eye care needs for over 5 years. The staff is always professional and the doctors are knowledgeable. My vision has never been better!"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "New Customer",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial2.jpg",
      content: "As someone who was nervous about eye exams, I was pleasantly surprised by how comfortable the entire process was. The doctor explained everything clearly and helped me choose the perfect frames."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Contact Lens User",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/testimonial3.jpg",
      content: "The contact lens fitting process was thorough and precise. I appreciate how the staff took the time to teach me proper care techniques. My eyes feel great with these new contacts!"
    }
  ];

  return (
    <div className="testimonials-container">
      <div className="testimonials-header">
        <h2 className="testimonials-title">What Our Patients Say</h2>
        <p className="testimonials-subtitle">Read testimonials from our satisfied patients</p>
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
