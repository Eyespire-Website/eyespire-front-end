import React, { useState } from "react";
import "./Header.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="header-wrapper">
      <div className="row-view">
        {/* Logo bên trái */}
        <div className="row-view2">
          <img
            src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"}
            className="image"
            alt="Logo"
          />
          <span className="text">Eyespire</span>
        </div>

        {/* Menu toggle button */}
        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu điều hướng ở giữa */}
        <div className={`column2 ${isMenuOpen ? 'menu-open' : ''}`}>
          <div className="row-view5">
            <div className="row-view3">
              <Link to="/" className="text2">Home</Link>
            </div>
            <Link to="/services" className="text4">Services</Link>
            <div className="row-view3">
              <Link to="/doctors" className="text5">Doctors</Link>
            </div>
            <div className="row-view3">
              <Link to="/shop" className="text5">Shop</Link>
            </div>
            <div className="row-view3">
              <Link to="/about" className="text5">About</Link>
            </div>
          </div>
        </div>

        {/* Giỏ hàng và nút login bên phải */}
        <div className="row-view5">
          <div className="cart-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <button className="login-button" onClick={handleLoginClick}>Login</button>
        </div>
      </div>
    </div>
  );

};

export default Header;
