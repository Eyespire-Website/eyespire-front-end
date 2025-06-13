import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./Header-shop.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUser,
  faSignOutAlt,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../../services/authService";

import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  // Hàm xử lý URL avatar
  const getAvatarUrl = (url) => {
    if (!url) return null;

    // Nếu là URL đầy đủ (bắt đầu bằng http hoặc https)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Nếu là đường dẫn tương đối, thêm base URL
    if (url.startsWith("/")) {
      return `http://localhost:8080${url}`;
    }

    // Trường hợp khác
    return url;
  };

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập chưa
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    // Xử lý click bên ngoài dropdown để đóng dropdown
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    // Cập nhật vị trí của dropdown khi mở
    if (dropdownOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY - 40,
        right: window.innerWidth - rect.right,
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, avatarRef, dropdownOpen]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Render dropdown portal
  const renderDropdownPortal = () => {
    if (!dropdownOpen) return null;

    return ReactDOM.createPortal(
      <div
        className="st-dropdown-menu-absolute"
        ref={dropdownRef}
        style={{
          position: "absolute",
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
          zIndex: 99999,
        }}
      >
        <div className="st-dropdown-menu">
          <div className="st-dropdown-header">
            <p className="st-user-name">{user.name || user.username}</p>
            <p className="st-user-email">{user.email}</p>
          </div>
          <div className="st-dropdown-divider"></div>
          <div className="st-dropdown-item" onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} className="st-dropdown-icon" />
            <span>Tài khoản của tôi</span>
          </div>
          <div className="st-dropdown-item" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="st-dropdown-icon" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="st-header-wrapper">
      <div className="st-row-view">
        {/* Logo bên trái */}
        <div className="st-row-view2">
          <img
            src={
              "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
            }
            className="st-image"
            alt="Logo"
          />
          <span className="st-text">Eyespire</span>
        </div>

        {/* Menu toggle button */}
        <button
          className="st-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu điều hướng ở giữa */}
        <div className={`st-column2 ${isMenuOpen ? "menu-open" : ""}`}>
          <div className="st-row-view5">
            <div className="st-row-view3">
              <Link to="/" className="st-text4">
                Home
              </Link>
            </div>
            <Link to="/services" className="st-text4">
              Services
            </Link>
            <div className="st-row-view3">
              <Link to="/doctors" className="st-text4">
                Doctors
              </Link>
            </div>
            <div className="st-row-view3">
              <Link to="/shop" className="st-text4">
                Shop
              </Link>
            </div>
            <div className="st-row-view3">
              <Link to="/about" className="text4">
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Giỏ hàng và nút login bên phải */}
        <div className="st-row-view5">
          <div className="st-cart-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          {user ? (
            <div className="st-user-profile">
              <div
                className="st-avatar-container"
                onClick={toggleDropdown}
                ref={avatarRef}
              >
                {user.avatarUrl ? (
                  <img
                    src={getAvatarUrl(user.avatarUrl)}
                    alt="User Avatar"
                    className="st-user-avatar"
                  />
                ) : (
                  <div className="st-default-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="st-dropdown-icon"
                />
              </div>
              {renderDropdownPortal()}
            </div>
          ) : (
            <button className="st-login-button" onClick={handleLoginClick}>
              {"Login"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
