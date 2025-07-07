"use client"

import { useState, useEffect, useRef } from "react"
import { Lock, X, Shield, Edit, Calendar } from "lucide-react"

const ProfileContent = () => {
  const [activeTab, setActiveTab] = useState("info")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedWard, setSelectedWard] = useState("")
  const [address, setAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  const [formData, setFormData] = useState({
    email: "manager.minhnph@gmail.com",
    phone: "352195824",
    gender: "Nam",
    username: "nguyenphamhoangminh",
    dob: "1990-01-01",
    fullName: "Nguyễn Phạm Hoàng Minh",
  })
  const [formErrors, setFormErrors] = useState({
    email: "",
    phone: "",
    gender: "",
    username: "",
    dob: "",
    fullName: "",
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [avatarError, setAvatarError] = useState("")
  const fileInputRef = useRef(null)

  // Fetch provinces on component mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((response) => response.json())
      .then((data) => setProvinces(data))
      .catch((error) => console.error("Error fetching provinces:", error))
  }, [])

  // Fetch districts when a province is selected
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.districts || []))
        .catch((error) => console.error("Error fetching districts:", error))
      setDistricts([])
      setWards([])
      setSelectedDistrict("")
      setSelectedWard("")
    }
  }, [selectedProvince])

  // Fetch wards when a district is selected
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((response) => response.json())
        .then((data) => setWards(data.wards || []))
        .catch((error) => console.error("Error fetching wards:", error))
      setWards([])
      setSelectedWard("")
    }
  }, [selectedDistrict])

  // Update address when province, district, or ward changes
  useEffect(() => {
    const provinceName = provinces.find((p) => p.code === selectedProvince)?.name || ""
    const districtName = districts.find((d) => d.code === selectedDistrict)?.name || ""
    const wardName = wards.find((w) => w.code === selectedWard)?.name || ""

    const formattedAddress = [wardName, districtName, provinceName].filter(Boolean).join(", ")
    setAddress(formattedAddress)
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards])

  // Clean up avatar preview URL
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"]
      if (!validTypes.includes(file.type)) {
        setAvatarError("Vui lòng chọn file hình ảnh (JPEG, PNG, GIF)")
        setAvatarFile(null)
        setAvatarPreview("")
        return
      }
      // Validate file size (e.g., max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setAvatarError("Hình ảnh không được lớn hơn 2MB")
        setAvatarFile(null)
        setAvatarPreview("")
        return
      }
      // Set file and preview
      setAvatarError("")
      setAvatarFile(file)
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Validate address on change
  const handleAddressChange = (e) => {
    const value = e.target.value
    setAddress(value)
    setAddressError(value.trim() ? "" : "Địa chỉ không được để trống")
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  // Validate individual field
  const validateField = (name, value) => {
    let error = ""
    switch (name) {
      case "email":
        if (!value) error = "Email không được để trống"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Email không hợp lệ"
        break
      case "phone":
        if (!value) error = "Số điện thoại không được để trống"
        else if (!/^\d{9,10}$/.test(value)) error = "Số điện thoại phải có 9-10 chữ số"
        break
      case "gender":
        if (!value) error = "Vui lòng chọn giới tính"
        break
      case "username":
        if (!value) error = "Tên tài khoản không được để trống"
        else if (value.length < 3) error = "Tên tài khoản phải có ít nhất 3 ký tự"
        break
      case "dob":
        if (!value) error = "Ngày sinh không được để trống"
        else if (new Date(value) > new Date()) error = "Ngày sinh không được ở tương lai"
        break
      case "fullName":
        if (!value) error = "Họ và tên không được để trống"
        else if (value.length < 2) error = "Họ và tên phải có ít nhất 2 ký tự"
        break
      default:
        break
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    let hasErrors = false

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key])
      if (formErrors[key] || !formData[key]) hasErrors = true
    })

    // Validate address
    if (!address.trim()) {
      setAddressError("Địa chỉ không được để trống")
      hasErrors = true
    }

    if (!hasErrors) {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        province: provinces.find((p) => p.code === selectedProvince)?.name || "",
        district: districts.find((d) => d.code === selectedDistrict)?.name || "",
        ward: wards.find((w) => w.code === selectedWard)?.name || "",
        address,
      }

      // Handle avatar upload
      if (avatarFile) {
        const formData = new FormData()
        formData.append("avatar", avatarFile)
        formData.append("userData", JSON.stringify(submissionData))
        console.log("Form submitted with avatar:", formData)
        // TODO: Send formData to backend API, e.g.:
        // fetch("/api/update-profile", {
        //   method: "POST",
        //   body: formData,
        // })
        // .then((response) => response.json())
        // .then((data) => alert("Cập nhật thành công!"))
        // .catch((error) => alert("Lỗi khi cập nhật!"));
      } else {
        console.log("Form submitted without avatar:", submissionData)
        // TODO: Send submissionData to backend API
      }
    }
  }
  return (
    <div className="profile-container">
      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}>
          Thông tin cá nhân
        </button>
        <button
          className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Hoạt động
        </button>
      </div>

      <div className="profile-content fixed-height">
        {activeTab === "info" && (
          <div className="profile-section" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="profile-info-layout" style={{
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-start',
              maxWidth: '1200px'
            }}>
              {/* Left Side - Avatar and Basic Info */}
              <div className="profile-left-panel">
                <div className="profile-avatar-section">
                  <div className="large-avatar">
                    <div className="avatar-circle" onClick={triggerFileInput} style={{ cursor: 'pointer' }}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="avatar-image" />
                      ) : (
                        <span className="avatar-letter">M</span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleAvatarChange}
                    />
                    {avatarError && <p className="error-message">{avatarError}</p>}
                  </div>
                  <div className="profile-basic-info">
                    <h3 className="profile-display-name">Nguyễn Phạm Hoàng Minh</h3>
                    <p className="profile-display-email">minhnphde180174@fpt.edu.vn</p>
                    <span className="profile-role-badge">QUẢN LÝ</span>
                  </div>
                  <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}>
                    <Lock size={16} />
                    Thay đổi mật khẩu ở đây!
                  </button>
                </div>
              </div>

              {/* Right Side - Form Fields */}
              <div className="profile-right-panel">
                <form onSubmit={handleSubmit} className="profile-form-grid">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label required" htmlFor="email-input">Email*</label>
                      <input
                        id="email-input"
                        type="email"
                        name="email"
                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email..."
                      />
                      {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label required" htmlFor="phone-input">Số điện
                        thoại*</label>
                      <div className="phone-input-group">
                        <span className="country-code-display">+84</span>
                        <input
                          id="phone-input"
                          type="tel"
                          name="phone"
                          className={`form-input phone-number ${formErrors.phone ? 'error' : ''}`}
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại..."
                        />
                      </div>
                      {formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label required" htmlFor="gender-input">Giới
                        tính*</label>
                      <select
                        id="gender-input"
                        name="gender"
                        className={`form-select ${formErrors.gender ? 'error' : ''}`}
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                      {formErrors.gender && <p className="error-message">{formErrors.gender}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label required" htmlFor="username-input">Tên tài
                        khoản*</label>
                      <input
                        id="username-input"
                        type="text"
                        name="username"
                        className={`form-input ${formErrors.username ? 'error' : ''}`}
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Nhập tên tài khoản..."
                      />
                      {formErrors.username &&
                        <p className="error-message">{formErrors.username}</p>}
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label required" htmlFor="dob-input">Ngày
                        sinh*</label>
                      <input
                        id="dob-input"
                        type="date"
                        name="dob"
                        className={`form-input ${formErrors.dob ? 'error' : ''}`}
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                      {formErrors.dob && <p className="error-message">{formErrors.dob}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label required" htmlFor="fullName-input">Họ và
                        tên*</label>
                      <input
                        id="fullName-input"
                        type="text"
                        name="fullName"
                        className={`form-input ${formErrors.fullName ? 'error' : ''}`}
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên..."
                      />
                      {formErrors.fullName &&
                        <p className="error-message">{formErrors.fullName}</p>}
                    </div>
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label className="form-label required" htmlFor="province-input">Tỉnh/Thành
                        phố</label>
                      <select
                        id="province-input"
                        className="form-select"
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label required"
                        htmlFor="district-input">Quận/Huyện</label>
                      <select
                        id="district-input"
                        className="form-select"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        disabled={!selectedProvince}
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label required"
                        htmlFor="ward-input">Phường/Xã</label>
                      <select
                        id="ward-input"
                        className="form-select"
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedDistrict}
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-1">
                    <div className="form-group">
                      <label className="form-label required" htmlFor="address-input">Địa
                        chỉ*</label>
                      <textarea
                        id="address-input"
                        className={`form-textarea ${addressError ? 'error' : ''}`}
                        rows="3"
                        value={address}
                        onChange={handleAddressChange}
                        placeholder="Nhập địa chỉ chi tiết (bao gồm số nhà, đường, v.v.)..."
                      />
                      {addressError && <p className="error-message">{addressError}</p>}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary update-btn">Cập nhật</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="profile-section" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="profile-info-layout" style={{
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-start',
              maxWidth: '1200px'
            }}>
              {/* Left Side - Activity Summary */}
              <div className="profile-left-panel">
                <div className="activity-summary-section">
                  <div className="activity-stats">
                    <div className="activity-stat-item">
                      <div className="activity-stat-icon login">
                        <Shield size={20} />
                      </div>
                      <div className="activity-stat-info">
                        <span className="activity-stat-number">15</span>
                        <span className="activity-stat-label">Lần đăng nhập</span>
                      </div>
                    </div>
                    <div className="activity-stat-item">
                      <div className="activity-stat-icon edit">
                        <Edit size={20} />
                      </div>
                      <div className="activity-stat-info">
                        <span className="activity-stat-number">8</span>
                        <span className="activity-stat-label">Cập nhật</span>
                      </div>
                    </div>
                    <div className="activity-stat-item">
                      <div className="activity-stat-icon appointment">
                        <Calendar size={20} />
                      </div>
                      <div className="activity-stat-info">
                        <span className="activity-stat-number">12</span>
                        <span className="activity-stat-label">Cuộc hẹn</span>
                      </div>
                    </div>
                  </div>
                  <div className="activity-filter">
                    <h4>Bộ lọc</h4>
                    <select className="form-select">
                      <option value="all">Tất cả hoạt động</option>
                      <option value="login">Đăng nhập</option>
                      <option value="edit">Cập nhật</option>
                      <option value="appointment">Cuộc hẹn</option>
                    </select>
                    <select className="form-select">
                      <option value="7">7 ngày qua</option>
                      <option value="30">30 ngày qua</option>
                      <option value="90">3 tháng qua</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Side - Activity Timeline */}
              <div className="profile-right-panel">
                <div className="activity-timeline-container">
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
                        <h4>Cập nhật thông tin cá nhân</h4>
                        <p>Thay đổi số điện thoại liên hệ</p>
                        <span className="timeline-time">Hôm qua, 15:30 PM</span>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-icon appointment">
                        <Calendar size={16} />
                      </div>
                      <div className="timeline-content">
                        <h4>Tạo cuộc hẹn mới</h4>
                        <p>Cuộc hẹn với khách hàng Nguyễn Văn A</p>
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
                    <div className="timeline-item">
                      <div className="timeline-icon edit">
                        <Edit size={16} />
                      </div>
                      <div className="timeline-content">
                        <h4>Cập nhật mật khẩu</h4>
                        <p>Thay đổi mật khẩu đăng nhập</p>
                        <span className="timeline-time">13/01/2024, 11:20 AM</span>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-icon appointment">
                        <Calendar size={16} />
                      </div>
                      <div className="timeline-content">
                        <h4>Hoàn thành cuộc hẹn</h4>
                        <p>Cuộc hẹn với khách hàng Trần Thị B</p>
                        <span className="timeline-time">12/01/2024, 14:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="activity-footer">
                    <button className="btn btn-secondary">Xem thêm hoạt động</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="stm-modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="stm-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="stm-modal-header">
                <h3>Bảo mật tài khoản</h3>
                <button className="stm-modal-close" onClick={() => setShowPasswordModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="stm-modal-body">
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
                        Bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực khi đăng nhập
                        trên thiết bị mới.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stm-modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Hủy
                </button>
                <button className="btn btn-primary">Lưu thay đổi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileContent
