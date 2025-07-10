import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUser,
  faSignOutAlt,
  faChevronDown,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import cartService from "../../services/cartService";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [cartItemCount, setCartItemCount] = useState(0);

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

    // Lấy số lượng sản phẩm trong giỏ hàng
    const updateCartCount = () => {
      const count = cartService.getCartItemCount();
      setCartItemCount(count);
    };

    // Cập nhật số lượng ban đầu
    updateCartCount();

    // Lắng nghe sự kiện thay đổi giỏ hàng
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
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
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right - 10,
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
    // Chuyển hướng dựa trên vai trò của người dùng
    if (user && user.role) {
      const role = user.role.toLowerCase();
      switch (role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'doctor':
          navigate('/dashboard/doctor');
          break;
        case 'receptionist':
          navigate('/dashboard/receptionist');
          break;
        case 'store_manager':
          navigate('/dashboard/storeManagement');
          break;
        case 'patient':
        default:
          navigate('/dashboard/patient');
          break;
      }
    } else {
      navigate('/dashboard/profile');
    }
    setDropdownOpen(false);
  };

  const handleAboutClick = () => {
    navigate("/about"); // Điều hướng tới trang About khi người dùng click vào About
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Xử lý khi người dùng click vào nút đặt lịch hẹn
  const handleAppointmentClick = () => {
    // Kiểm tra người dùng đã đăng nhập chưa
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để đặt lịch hẹn");
      navigate("/login");
      return;
    }

    // Kiểm tra vai trò của người dùng
    if (currentUser.role && currentUser.role.toLowerCase() === 'patient') {
      // Kiểm tra xem đang ở trang chủ hay không
      if (window.location.pathname === '/') {
        // Nếu đang ở trang chủ, cuộn đến phần đặt lịch hẹn
        const appointmentElement = document.getElementById('appointment-section');
        if (appointmentElement) {
          appointmentElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Nếu không ở trang chủ, chuyển hướng về trang chủ với hash fragment
        navigate('/?scrollToAppointment=true');
      }
    } else {
      // Hiển thị thông báo cho tất cả các trang
      toast.info("Chỉ bệnh nhân mới có thể đặt lịch hẹn");
    }
  };

  // Xử lý chuyển đến trang giỏ hàng
  const handleCartClick = () => {
    navigate("/cart");
  };

  // Render dropdown portal
  const renderDropdownPortal = () => {
    if (!dropdownOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="dropdown-menu-absolute"
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
              zIndex: 999999,
              width: "240px",
              pointerEvents: "auto",
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
          <Link to="/">
            <img
                src={logo}
                className="image"
            />
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="text">{"Eyespire"}</span>
          </Link>
        </div>

        {/* Menu điều hướng ở giữa */}
        <div className="column2">
          <div className="row-view5">
            <Link to="/" className="row-view3" style={{ textDecoration: 'none' }}>
              <span className="text2">{"Home"}</span>
              <span className="text3">{""}</span>
            </Link>

            <Link to="/services" className="service-link">
              <span className="text4">{"Services"}</span>
            </Link>

            <div className="row-view3">
              <span className="text5">{"Doctors"}</span>
              <span className="text3">{""}</span>
            </div>
            <Link to="/shop" className="row-view3">
              <span className="text5">{"Shop"}</span>
              <span className="text3">{""}</span>
            </Link>

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
          <div className="crt-cart-icon" onClick={handleCartClick}>
            <FontAwesomeIcon icon={faShoppingCart} />
            {cartItemCount > 0 && <span className="crt-cart-count">{cartItemCount}</span>}
          </div>

          {/* Icon đặt lịch hẹn */}
          <div className="appointment-icon-container" onClick={handleAppointmentClick}>
            <FontAwesomeIcon icon={faCalendarAlt} className="header-icon" />
          </div>

          {user ? (
              <div className="user-profile">
                <div
                    className="avatar-container"
                    onClick={toggleDropdown}
                    ref={avatarRef}
                >
                  {user.avatarUrl ? (
                      <img
                          src={getAvatarUrl(user.avatarUrl)}
                          alt="User Avatar"
                          className="user-avatar"
                      />
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
              <button className="login-button" onClick={handleLoginClick}>
                {"Login"}
              </button>
          )}
        </div>
      </div>
  );
};

export default Header;