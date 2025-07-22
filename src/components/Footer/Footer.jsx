import React from "react";
import logo from "../../assets/logo.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <img
              src={logo}
              alt="Eyespire Logo"
              className="logo-image"
            />
            <span className="logo-text">Eyespire</span>
          </div>
          <p className="footer-description">
            Providing quality eye care services and products to help you see the world clearly.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Shop</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Services</h3>
          <ul className="footer-links">
            <li><a href="#">Eye Examination</a></li>
            <li><a href="#">Prescription Glasses</a></li>
            <li><a href="#">Contact Lenses</a></li>
            <li><a href="#">Eye Treatment</a></li>
            <li><a href="#">Children's Eye Care</a></li>
            <li><a href="#">Laser Surgery Consultation</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Contact Info</h3>
          <ul className="footer-contact">
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>123 Eye Care Street, Vision City, VC 12345</span>
            </li>
            <li>
              <i className="fas fa-phone-alt"></i>
              <span>+123 45 67 890</span>
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              <span>info@eyespire.com</span>
            </li>
            <li>
              <i className="fas fa-clock"></i>
              <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Eyespire. All Rights Reserved.</p>
        </div>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
