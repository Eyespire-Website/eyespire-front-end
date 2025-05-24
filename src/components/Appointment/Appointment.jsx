import React from "react";
import "./Appointment.css";

const Appointment = () => {
  return (
    <div className="appointment-container">
      <div className="appointment-content">
        <div className="appointment-left">
          <h2 className="appointment-title">Make an Appointment</h2>
          <p className="appointment-description">
            Book your eye examination with our experienced optometrists. We provide comprehensive eye care services to ensure your vision health.
          </p>
          <div className="appointment-contact">
            <div className="contact-item">
              <img 
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/phone-icon.png" 
                alt="Phone" 
                className="contact-icon" 
              />
              <span>+123 45 67 890</span>
            </div>
            <div className="contact-item">
              <img 
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/email-icon.png" 
                alt="Email" 
                className="contact-icon" 
              />
              <span>info@eyespire.com</span>
            </div>
          </div>
        </div>
        <div className="appointment-right">
          <form className="appointment-form">
            <div className="form-row">
              <input type="text" placeholder="Full Name" className="form-input" />
              <input type="email" placeholder="Email Address" className="form-input" />
            </div>
            <div className="form-row">
              <input type="tel" placeholder="Phone Number" className="form-input" />
              <select className="form-input">
                <option value="">Select Service</option>
                <option value="eye-exam">Eye Examination</option>
                <option value="glasses">Prescription Glasses</option>
                <option value="contacts">Contact Lenses</option>
                <option value="treatment">Eye Treatment</option>
              </select>
            </div>
            <div className="form-row">
              <input type="date" className="form-input" />
              <select className="form-input">
                <option value="">Select Time</option>
                <option value="9:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>
            <textarea placeholder="Additional Information" className="form-textarea"></textarea>
            <button type="submit" className="appointment-button">Book Appointment</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
