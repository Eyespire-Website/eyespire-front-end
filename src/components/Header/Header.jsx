import React, { useState, useEffect, useRef } from "react";
import ReactDOM from 'react-dom';
import "./Header.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import authService from "../../services/authService";
import { Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Hàm xử lý URL avatar
  const getAvatarUrl = (url) => {
    if (!url) return null;
    
    // Nếu là URL đầy đủ (bắt đầu bằng http hoặc https)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Nếu là đường dẫn tương đối, thêm base URL
    if (url.startsWith('/')) {
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          avatarRef.current && !avatarRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Cập nhật vị trí của dropdown khi mở
    if (dropdownOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY - 40,
        right: window.innerWidth - rect.right
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, avatarRef, dropdownOpen]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleAboutClick = () => {
    navigate('/about'); // Điều hướng tới trang About khi người dùng click vào About
  };



  // Render dropdown portal
  const renderDropdownPortal = () => {
    if (!dropdownOpen) return null;
    
    return ReactDOM.createPortal(
      <div 
        className="dropdown-menu-absolute"
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
          zIndex: 99999
        }}
      >
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="user-name">{user.name || user.username}</p>
            <p className="user-email">{user.email}</p>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-item" onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
            <span>Tài khoản của tôi</span>
          </div>
          <div className="dropdown-item" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="row-view">
      {/* Logo bên trái */}
      <div className="row-view2">
        <img
          src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"}
          className="image"
        />
        <span className="text">{"Eyespire"}</span>
      </div>
      
      {/* Menu điều hướng ở giữa */}
      <div className="column2">
        <div className="row-view5">
          <div className="row-view3">
            <span className="text2">{"Home"}</span>
            <span className="text3">{""}</span>
          </div>

          <Link to="/services" className="service-link">
            <span className="text4">{"Services"}</span>
          </Link>

          <div className="row-view3">
            <span className="text5">{"Doctors"}</span>
            <span className="text3">{""}</span>
          </div>
          <div className="row-view3">
            <span className="text5">{"Shop"}</span>
            <span className="text3">{""}</span>
          </div>

          {/* Nút About, sử dụng button với onClick */}
          {/* Nút About với lớp btn-about */}
          <div className="row-view3">
            <button className="btn-about" onClick={handleAboutClick}>
              {"About"}
            </button>
            <span className="text3">{""}</span>
          </div>

        </div>
      </div>
      
      {/* Giỏ hàng và nút login/avatar bên phải */}
      <div className="row-view5">
        <div className="cart-icon">
          <FontAwesomeIcon icon={faShoppingCart} />
        </div>
        
        {user ? (
          <div className="user-profile">
            <div className="avatar-container" onClick={toggleDropdown} ref={avatarRef}>
              {user.avatarUrl ? (
                <img src={getAvatarUrl(user.avatarUrl)} alt="User Avatar" className="user-avatar" />
              ) : (
                <div className="default-avatar">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              )}
              <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
            </div>
            {renderDropdownPortal()}
          </div>
        ) : (
          <button className="login-button" onClick={handleLoginClick}>{"Login"}</button>
        )}
      </div>
    </div>
  );
};

export default Header;
