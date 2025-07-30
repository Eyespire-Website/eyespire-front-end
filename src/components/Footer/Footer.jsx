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
            Cung cấp dịch vụ và sản phẩm chăm sóc mắt chất lượng để giúp bạn nhìn thấy thế giới rõ ràng.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Liên Kết Nhanh</h3>
          <ul className="footer-links">
            <li><a href="#">Trang Chủ</a></li>
            <li><a href="#">Về Chúng Tôi</a></li>
            <li><a href="#">Dịch Vụ</a></li>
            <li><a href="#">Cửa Hàng</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Liên Hệ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Dịch Vụ</h3>
          <ul className="footer-links">
            <li><a href="#">Khám Mắt</a></li>
            <li><a href="#">Kính Cận Theo Đơn</a></li>
            <li><a href="#">Kính Áp Tròng</a></li>
            <li><a href="#">Điều Trị Mắt</a></li>
            <li><a href="#">Chăm Sóc Mắt Trẻ Em</a></li>
            <li><a href="#">Tư Vấn Phẫu Thuật Laser</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Thông Tin Liên Hệ</h3>
          <ul className="footer-contact">
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>123 Đường Chăm Sóc Mắt, Thành Phố Thị Giác, VC 12345</span>
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
              <span>Thứ 2 - Thứ 6: 9:00 SA - 6:00 CH</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Eyespire. Tất Cả Quyền Được Bảo Lưu.</p>
        </div>
        <div className="footer-bottom-links">
          <a href="#">Chính Sách Bảo Mật</a>
          <a href="#">Điều Khoản Dịch Vụ</a>
          <a href="#">Sơ Đồ Trang Web</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
