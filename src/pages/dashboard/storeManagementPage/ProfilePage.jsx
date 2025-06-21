"use client"

import { useState } from "react"
import { Camera, Mail, Phone, Shield, Edit, Calendar } from "lucide-react"

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-container">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-QdZwDw8lvOhpG5ewHibZkND0JqdeX3.png"
              alt="Profile"
              className="profile-avatar"
            />
            <button className="avatar-edit-btn">
              <Camera size={16} />
            </button>
          </div>
        </div>
        <div className="profile-info-header">
          <div className="profile-name-container">
            <h2 className="profile-name">Lê Huy Vũ</h2>
            <span className="profile-badge">Store Manager</span>
          </div>
          <div className="profile-contact">
            <div className="contact-item">
              <Mail size={16} className="contact-icon" />
              <span className="contact-text">manager.lehuy@gmail.com</span>
            </div>
            <div className="contact-item">
              <Phone size={16} className="contact-icon" />
              <span className="contact-text">0352195824</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
          Thông tin cá nhân
        </button>
        <button
          className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Bảo mật
        </button>
        <button
          className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Thông báo
        </button>
        <button
          className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Hoạt động
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "info" && (
          <div className="profile-section">
            <div className="section-header">
              <h3>Thông tin cá nhân</h3>
              <button className="btn btn-primary">Lưu thay đổi</button>
            </div>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Họ và tên</label>
                  <input type="text" className="form-input" defaultValue="Lê Huy Vũ" />
                </div>
                <div className="form-group">
                  <label className="form-label required">Email</label>
                  <input type="email" className="form-input" defaultValue="manager.lehuy@gmail.com" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Số điện thoại</label>
                  <div className="phone-input">
                    <select className="form-select country-select">
                      <option value="+84">🇻🇳 +84</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+86">🇨🇳 +86</option>
                    </select>
                    <input type="tel" className="form-input" defaultValue="0352195824" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label required">Giới tính</label>
                  <select className="form-select" defaultValue="Nam">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-input" defaultValue="1990-01-01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Vị trí</label>
                  <input type="text" className="form-input" defaultValue="Store Manager" disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Địa chỉ</label>
                  <input type="text" className="form-input" defaultValue="123 Đường Lê Lợi, Quận 1" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Thành phố</label>
                  <input type="text" className="form-input" defaultValue="TP. Hồ Chí Minh" />
                </div>
                <div className="form-group">
                  <label className="form-label">Quốc gia</label>
                  <select className="form-select" defaultValue="Vietnam">
                    <option value="Vietnam">Việt Nam</option>
                    <option value="USA">Hoa Kỳ</option>
                    <option value="China">Trung Quốc</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="profile-section">
            <div className="section-header">
              <h3>Bảo mật tài khoản</h3>
              <button className="btn btn-primary">Lưu thay đổi</button>
            </div>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label required">Mật khẩu hiện tại</label>
                  <input type="password" className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Mật khẩu mới</label>
                  <input type="password" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label required">Xác nhận mật khẩu mới</label>
                  <input type="password" className="form-input" />
                </div>
              </div>

              <div className="security-tips">
                <h4>Yêu cầu mật khẩu:</h4>
                <ul>
                  <li className="valid">Ít nhất 8 ký tự</li>
                  <li className="valid">Ít nhất 1 chữ hoa</li>
                  <li className="invalid">Ít nhất 1 ký tự đặc biệt</li>
                  <li className="invalid">Ít nhất 1 số</li>
                </ul>
              </div>

              <div className="form-divider"></div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Xác thực hai yếu tố</label>
                  <div className="toggle-container">
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="toggle-label">Bật xác thực hai yếu tố</span>
                  </div>
                  <p className="form-help">
                    Bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực khi đăng nhập trên thiết bị mới.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="profile-section">
            <div className="section-header">
              <h3>Cài đặt thông báo</h3>
              <button className="btn btn-primary">Lưu thay đổi</button>
            </div>
            <div className="notification-settings">
              <div className="notification-group">
                <h4>Thông báo Email</h4>
                <div className="notification-item">
                  <div>
                    <h5>Đơn hàng mới</h5>
                    <p>Nhận thông báo khi có đơn hàng mới</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div>
                    <h5>Cập nhật kho hàng</h5>
                    <p>Nhận thông báo khi có thay đổi trong kho</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div>
                    <h5>Feedback sản phẩm</h5>
                    <p>Nhận thông báo khi có đánh giá mới</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div>
                    <h5>Cập nhật hệ thống</h5>
                    <p>Nhận thông báo về các cập nhật và bảo trì hệ thống</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h4>Thông báo ứng dụng</h4>
                <div className="notification-item">
                  <div>
                    <h5>Thông báo trực tiếp</h5>
                    <p>Hiển thị thông báo trực tiếp trong ứng dụng</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div>
                    <h5>Âm thanh thông báo</h5>
                    <p>Phát âm thanh khi có thông báo mới</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="profile-section">
            <div className="section-header">
              <h3>Hoạt động gần đây</h3>
            </div>
            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-icon login">
                  <Shield size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Đăng nhập thành công</h4>
                  <p>Đăng nhập từ TP. Hồ Chí Minh, Việt Nam</p>
                  <span className="timeline-time">Hôm nay, 08:45 AM</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon edit">
                  <Edit size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Cập nhật thông tin sản phẩm</h4>
                  <p>Chỉnh sửa thông tin sản phẩm SP001</p>
                  <span className="timeline-time">Hôm qua, 15:30 PM</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon appointment">
                  <Calendar size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Xử lý đơn hàng</h4>
                  <p>Xác nhận đơn hàng ORD001</p>
                  <span className="timeline-time">15/01/2024, 10:15 AM</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon login">
                  <Shield size={16} />
                </div>
                <div className="timeline-content">
                  <h4>Đăng nhập thành công</h4>
                  <p>Đăng nhập từ TP. Hồ Chí Minh, Việt Nam</p>
                  <span className="timeline-time">14/01/2024, 09:00 AM</span>
                </div>
              </div>
            </div>
            <div className="activity-footer">
              <button className="btn btn-secondary">Xem thêm hoạt động</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
