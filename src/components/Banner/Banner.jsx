import React, { useState } from "react";
import "./Banner.css";
import homepage_header_1 from "../../assets/homepage_header_1.jpg";
import homepage_header_2 from "../../assets/homepage_header_2.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { toast } from "react-toastify";

const Banner = () => {
  const navigate = useNavigate();

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
      // Cuộn xuống phần đặt lịch hẹn
      const appointmentElement = document.getElementById('appointment-section');
      if (appointmentElement) {
        appointmentElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Nếu không tìm thấy phần tử, chuyển hướng về trang chủ
        navigate('/#appointment-section');
      }
    } else {
      toast.info("Chỉ bệnh nhân mới có thể đặt lịch hẹn");
    }
  };

  return (
    <div className="row-view6">
      {/* Phần bên trái */}
      <div className="column3">
        <span className="text7">
          {"Bác Sĩ Nhãn Khoa & Công Nghệ Tốt Nhất"}
        </span>
        <div className="column4">
          <button className="banner-appointment-button" onClick={handleAppointmentClick}>
            <FontAwesomeIcon icon={faCalendarAlt} className="banner-appointment-icon" />
            <span>Đặt lịch khám ngay</span>
          </button>
        </div>
        
        {/* Phần thống kê */}
        <div className="stats-container">
          <div className="homepage_stat-item">
            <span className="stat-number">8+</span>
            <span className="stat-text">Bác Sĩ Chuyên Môn Cao</span>
          </div>
          <div className="homepage_stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-text">Phản Hồi Tích Cực</span>
          </div>
        </div>
        
        {/* Phần khuyến mãi */}
        <div className="promo-box">
          <h3 className="promo-title">100% Thiết Bị Mắt Hiện Đại</h3>
          <p className="promo-desc">Khám phá các công cụ khám mắt tiên tiến như máy đo khúc xạ tự động, máy OCT, và hệ thống phá nhũ tương từ Đức, Mỹ, Nhật Bản và Thụy Sĩ để chăm sóc chất lượng cao tại phòng khám của chúng tôi.</p>
          <img
            src={homepage_header_2}
          />
        </div>
      </div>
      
      {/* Phần hình ảnh bên phải */}
      <div className="column5">
        <div className="view">
          <img
            src={homepage_header_1}
            className="image4"
            alt="Eye doctor"
          />
        </div>
        
        {/* Phần thống kê 550+ */}
        <div className="success-stats">
          <span className="text9">
            {"550+"}
          </span>
          <span className="text10">
            {"Phẫu Thuật\nMắt Thành Công"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
