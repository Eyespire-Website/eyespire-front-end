"use client"

import React, {useState, useEffect} from "react"
import "./doctor.css"
import {useNavigate} from "react-router-dom";

export default function DoctorDashboard() {
    const [doctorData, setDoctorData] = useState({
        email: "doctor.vupa@gmail.com",
        fullname: "Phan Anh Vũ",
        phone: "0352195870",
        gender: "male",
        specialization: "Chăm sóc sức khỏe cá nhân",
        licenseNumber: "ABC-GSH-WH5",
        experience: "3",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        bio: "Xin chào! Tôi là bác sĩ thú y chuyên về chăm sóc và điều trị cá Koi, với hơn 10 năm kinh nghiệm trong lĩnh vực này. Tôi đã làm việc với rất nhiều hồ cá Koi từ quy mô gia đình đến thương mại, hiểu rõ các vấn đề sức khỏe thường gặp như nhiễm khuẩn, ký sinh trùng, hay các vấn đề môi trường như pH và nồng độ oxy trong hồ. Mỗi chú cá Koi đều là một kiệt tác thiên nhiên, và tôi cam kết mang đến dịch vụ tốt nhất để bảo vệ sức khỏe và vẻ đẹp của chúng. Hãy để tôi đồng hành cùng bạn trong việc xây dựng và duy trì môi trường lý tưởng cho đàn cá Koi yêu quý của bạn.",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
    })
    const navigate = useNavigate();
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [locationLoading, setLocationLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordError, setPasswordError] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState("")

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setDoctorData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            console.log("Saving doctor data:", doctorData)
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            alert("Cập nhật thông tin thành công!")
        } catch (error) {
            console.error("Error saving:", error)
            alert("Có lỗi xảy ra khi cập nhật thông tin!")
        } finally {
            setSaving(false)
        }
    }

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLocationLoading(true)
                const response = await fetch("https://provinces.open-api.vn/api/p/")
                const data = await response.json()
                setProvinces(data)
            } catch (error) {
                console.error("Error fetching provinces:", error)
            } finally {
                setLocationLoading(false)
            }
        }
        fetchProvinces()
    }, [])

    // Fetch districts when province changes
    const fetchDistricts = async (provinceCode) => {
        try {
            setLocationLoading(true)
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            const data = await response.json()
            setDistricts(data.districts)
        } catch (error) {
            console.error("Error fetching districts:", error)
        } finally {
            setLocationLoading(false)
        }
    }

    // Fetch wards when district changes
    const fetchWards = async (districtCode) => {
        try {
            setLocationLoading(true)
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            const data = await response.json()
            setWards(data.wards)
        } catch (error) {
            console.error("Error fetching wards:", error)
        } finally {
            setLocationLoading(false)
        }
    }

    // Handle province change
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value
        setDoctorData((prev) => ({
            ...prev,
            provinceCode,
            districtCode: "",
            wardCode: "",
        }))
        setDistricts([])
        setWards([])

        if (provinceCode) {
            fetchDistricts(provinceCode)
        }
    }

    // Handle district change
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value
        setDoctorData((prev) => ({
            ...prev,
            districtCode,
            wardCode: "",
        }))
        setWards([])

        if (districtCode) {
            fetchWards(districtCode)
        }
    }

    // Handle file change for avatar
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            const fileReader = new FileReader()
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result)
            }
            fileReader.readAsDataURL(file)
        }
    }

    // Handle avatar upload
    const handleAvatarUpload = async () => {
        if (!selectedFile) {
            alert("Vui lòng chọn ảnh trước khi tải lên")
            return
        }

        try {
            setSaving(true)
            // Simulate upload
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setSelectedFile(null)
            alert("Cập nhật ảnh đại diện thành công!")
        } catch (error) {
            console.error("Error uploading avatar:", error)
            alert("Có lỗi xảy ra khi cập nhật ảnh đại diện!")
        } finally {
            setSaving(false)
        }
    }

    // Handle password change
    const handlePasswordChange = (e) => {
        const {name, value} = e.target
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }))
        if (passwordError) setPasswordError("")
    }

    const handlePasswordSubmit = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Vui lòng điền đầy đủ thông tin")
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Mật khẩu mới không khớp")
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự")
            return
        }

        try {
            // Simulate password change
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setShowPasswordModal(false)
            alert("Đổi mật khẩu thành công!")
        } catch (error) {
            console.error("Error changing password:", error)
            setPasswordError("Có lỗi xảy ra, vui lòng thử lại sau")
        }
    }

    return (
        <div className="profile-content-wrapper">
            <header className="profile-header">
                <h1>Hồ sơ cá nhân</h1>
            </header>

            <div className="profile-content">
                {/* Left Section - Avatar */}
                <div className="profile-left">
                    <div className="profile-avatar-container">
                        <div className="profile-avatar-large">
                            {previewUrl ? (
                                <img src={previewUrl || "/placeholder.svg"} alt="Avatar" className="avatar-image"/>
                            ) : (
                                doctorData.fullname.charAt(0) || "P"
                            )}
                            <label htmlFor="avatar-upload" className="change-avatar-btn">
                                <span className="camera-icon">📷</span>
                            </label>
                            <input
                                type="file"
                                id="avatar-upload"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{display: "none"}}
                            />
                        </div>
                        {selectedFile && (
                            <button className="upload-avatar-btn" onClick={handleAvatarUpload} disabled={saving}>
                                {saving ? "Đang tải lên..." : "Lưu ảnh"}
                            </button>
                        )}
                    </div>

                    <div className="profile-info">
                        <h3>{doctorData.fullname}</h3>
                        <p className="user-email">{doctorData.email}</p>
                        <div className="user-badge">DOCTOR</div>
                    </div>

                    <button className="edit-profile-btn" onClick={() => setShowPasswordModal(true)}>
                        <span className="password-icon">🔒</span> Thay đổi mật khẩu ở đây!
                    </button>
                </div>

                {/* Center Section - Form Fields */}
                <div className="profile-center">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={doctorData.email}
                                onChange={handleInputChange}
                                className="form-control readonly"
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Chứng chỉ</label>
                            <input
                                type="text"
                                name="specialization"
                                value={doctorData.specialization}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Họ và tên <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullname"
                                value={doctorData.fullname}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mã số chứng chỉ</label>
                            <input
                                type="text"
                                name="licenseNumber"
                                value={doctorData.licenseNumber}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Số điện thoại <span className="required">*</span>
                            </label>
                            <div className="phone-input">
                                <div className="phone-prefix">+84</div>
                                <input
                                    type="text"
                                    name="phone"
                                    value={doctorData.phone}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                Giới tính <span className="required">*</span>
                            </label>
                            <select name="gender" value={doctorData.gender} onChange={handleInputChange}
                                    className="form-control">
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Năm kinh nghiệm</label>
                            <select
                                name="experience"
                                value={doctorData.experience}
                                onChange={handleInputChange}
                                className="form-control"
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="5">5</option>
                                <option value="10">10+</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tỉnh/Thành phố</label>
                            <select
                                name="provinceCode"
                                value={doctorData.provinceCode}
                                onChange={handleProvinceChange}
                                className="form-control"
                                disabled={locationLoading}
                            >
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {provinces.map((province) => (
                                    <option key={province.code} value={province.code}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quận/Huyện</label>
                            <select
                                name="districtCode"
                                value={doctorData.districtCode}
                                onChange={handleDistrictChange}
                                className="form-control"
                                disabled={!doctorData.provinceCode || locationLoading}
                            >
                                <option value="">-- Chọn Quận/Huyện --</option>
                                {districts.map((district) => (
                                    <option key={district.code} value={district.code}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Phường/Xã</label>
                            <select
                                name="wardCode"
                                value={doctorData.wardCode}
                                onChange={handleInputChange}
                                className="form-control"
                                disabled={!doctorData.districtCode || locationLoading}
                            >
                                <option value="">-- Chọn Phường/Xã --</option>
                                {wards.map((ward) => (
                                    <option key={ward.code} value={ward.code}>
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={doctorData.address}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section - Bio */}
                <div className="profile-right">
                    <div className="bio-section">
                        <label>
                            Giới thiệu <span className="optional">(Tùy chọn)</span>
                        </label>
                        <textarea
                            name="bio"
                            value={doctorData.bio}
                            onChange={handleInputChange}
                            className="bio-textarea"
                            placeholder="Mô tả về kinh nghiệm, chuyên môn và phương pháp điều trị của bạn..."
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button className="save-button" onClick={handleSave} disabled={saving}>
                    {saving ? "Đang lưu..." : "Cập nhật"}
                </button>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Thay đổi mật khẩu</h3>
                            <button className="close-modal" onClick={() => setShowPasswordModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {passwordError && <div className="error-message">{passwordError}</div>}
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowPasswordModal(false)}>
                                Hủy
                            </button>
                            <button className="save-button" onClick={handlePasswordSubmit}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
