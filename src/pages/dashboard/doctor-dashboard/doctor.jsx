import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../../services/userService";
import authService from "../../../services/authService";
import addressService from "../../../services/addressService";
import specialtyService from "../../../services/specialtyService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./doctor.css";

export default function DoctorDashboard() {
    const [doctorData, setDoctorData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "MALE",
        username: "",
        fullname: "",
        address: "",
        birthdate: "",
        provinceCode: "",
        wardCode: "",
        specialization: "",
        licenseNumber: "",
        experience: "",
        bio: "",
        specialtyId: "",
    });
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const navigate = useNavigate();

    const isGoogleAccount = () => {
        const currentUser = authService.getCurrentUser();
        return currentUser && (
            currentUser.isGoogleAccount === true ||
            currentUser.isGoogleAccount === "true"
        );
    };

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        if (url.startsWith("/")) {
            return `http://localhost:8080${url}`;
        }
        return url;
    };

    const fetchDoctorData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }

            setLoading(true);
            const userData = await userService.getCurrentUserInfo();
            const doctorInfo = await userService.getDoctorInfo();
            console.log("=== FETCH DOCTOR DATA DEBUG ===");
            console.log("userData from backend:", userData);
            console.log("doctorInfo from backend:", doctorInfo);
            console.log("=== DROPDOWN DEBUG ===");
            console.log("provinces:", provinces);
            console.log("wards:", wards);
            console.log("specialties:", specialties);

            setDoctorData({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                gender: userData.gender || "MALE",
                username: userData.username || "",
                fullname: userData.name || "",
                address: userData.addressDetail || "",
                birthdate: userData.dateOfBirth || "",
                provinceCode: userData.province || userData.provinceCode || "",
                wardCode: userData.ward || userData.wardCode || "",
                specialization: doctorInfo?.specialization || "",
                licenseNumber: doctorInfo?.qualification || "",
                experience: doctorInfo?.experience || "",
                bio: doctorInfo?.description || "",
                specialtyId: doctorInfo?.specialtyId || "",
                // Map specialization text to specialtyId for dropdown
                _specialization: doctorInfo?.specialization || "",
            });
            
            console.log("=== FINAL DOCTOR DATA ===");
            console.log("provinceCode:", userData.province || userData.provinceCode || "");
            console.log("wardCode:", userData.ward || userData.wardCode || "");
            console.log("specialization:", doctorInfo?.specialization || "");

            if (userData.avatarUrl) {
                setPreviewUrl(userData.avatarUrl);
            }

            if (userData.provinceCode) {
                fetchWards(userData.provinceCode);
            }

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin bác sĩ:", error);
            toast.error("Không thể tải thông tin bác sĩ");

            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setDoctorData({
                    name: currentUser.name || "",
                    email: currentUser.email || "",
                    phone: currentUser.phone || "",
                    gender: currentUser.gender || "MALE",
                    username: currentUser.username || "",
                    fullname: currentUser.name || "",
                    address: currentUser.address || "",
                    birthdate: currentUser.birthdate || "",
                    provinceCode: currentUser.province || currentUser.provinceCode || "",
                    wardCode: currentUser.ward || currentUser.wardCode || "",
                    specialization: currentUser.specialization || "",
                    licenseNumber: currentUser.licenseNumber || "",
                    experience: currentUser.experience || "",
                    bio: currentUser.bio || "",
                    specialtyId: currentUser.specialtyId || "",
                });

                if (currentUser.avatarUrl) {
                    setPreviewUrl(currentUser.avatarUrl);
                }

                if (currentUser.provinceCode) {
                    fetchWards(currentUser.provinceCode);
                }
            } else {
                navigate('/login');
            }

            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoading(true);
                const provincesData = await addressService.getProvinces();
                setProvinces(provincesData);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu tỉnh/thành phố:", error);
                toast.error("Không thể tải danh sách tỉnh/thành phố");
                setLoading(false);
            }
        };

        const fetchSpecialties = async () => {
            try {
                const specialtiesData = await specialtyService.getAllSpecialties();
                setSpecialties(specialtiesData);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu chuyên khoa:", error);
                toast.error("Không thể tải danh sách chuyên khoa");
            }
        };

        fetchProvinces();
        fetchSpecialties();
    }, []);

    useEffect(() => {
        fetchDoctorData();
    }, []);

    // Re-apply dropdown values after dropdown data is loaded
    const [dropdownDataLoaded, setDropdownDataLoaded] = useState(false);
    
    useEffect(() => {
        if (provinces.length > 0 && specialties.length > 0 && !dropdownDataLoaded) {
            console.log("=== DROPDOWN DATA LOADED, RE-APPLYING VALUES ===");
            setDropdownDataLoaded(true);
            
            // Map specialization text to specialtyId
            if (doctorData._specialization && !doctorData.specialtyId) {
                const matchedSpecialty = specialties.find(s => s.name === doctorData._specialization);
                if (matchedSpecialty) {
                    console.log("Mapping specialization:", doctorData._specialization, "-> ID:", matchedSpecialty.id);
                    setDoctorData(prev => ({
                        ...prev,
                        specialtyId: matchedSpecialty.id
                    }));
                }
            }
            
            // Load wards for selected province
            if (doctorData.provinceCode) {
                fetchWards(doctorData.provinceCode);
            }
        }
    }, [provinces.length, specialties.length, dropdownDataLoaded, doctorData.provinceCode, doctorData._specialization, doctorData.specialtyId]);

    const fetchWards = async (provinceId) => {
        try {
            setLoading(true);
            const wardsData = await addressService.getWardsByProvince(provinceId);
            setWards(wardsData);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu phường/xã:", error);
            toast.error("Không thể tải danh sách phường/xã");
            setLoading(false);
        }
    };

    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        setDoctorData(prev => ({
            ...prev,
            provinceCode: provinceId,
            wardCode: ""
        }));
        
        if (provinceId) {
            fetchWards(provinceId);
        } else {
            setWards([]);
        }
    };

    const handleWardChange = (e) => {
        setDoctorData(prev => ({
            ...prev,
            wardCode: e.target.value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Debug log for experience field
        if (name === 'experience') {
            console.log("=== EXPERIENCE CHANGE DEBUG ===");
            console.log("Input value:", value);
            console.log("Input type:", typeof value);
        }
        
        setDoctorData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) {
            toast.warning("Vui lòng chọn ảnh trước khi tải lên");
            return;
        }
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append("avatar", selectedFile);
            await userService.updateAvatar(formData);
            const updatedUser = await userService.getCurrentUserInfo();
            setPreviewUrl(updatedUser.avatarUrl);
            setSelectedFile(null);
            toast.success("Cập nhật ảnh đại diện thành công!");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error(error.response?.data || "Có lỗi xảy ra khi cập nhật ảnh đại diện!");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (passwordError) setPasswordError("");
    };

    const handlePasswordSubmit = async () => {
        try {
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setShowPasswordModal(false);
            toast.success("Đổi mật khẩu thành công!");
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError(error.response?.data || "Có lỗi xảy ra, vui lòng thử lại sau");
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log("=== FRONTEND SENDING DATA ===");
            console.log("doctorData:", doctorData);
            
            const response = await userService.updateDoctorProfile(doctorData);
            console.log("=== BACKEND RESPONSE ===");
            console.log("response:", response);
            
            // Đơn giản hóa: chỉ cập nhật với response data
            if (response) {
                // Không reload data để tránh override user input
                // Chỉ cập nhật các field cần thiết từ response
                console.log("Profile updated successfully, keeping current form state");
            }
            
            toast.success("Cập nhật thông tin bác sĩ thành công!");
        } catch (error) {
            console.error("Error saving:", error);
            const errorMessage = error.message === "Bác sĩ đã tồn tại với User ID này"
                ? "Hồ sơ bác sĩ đã tồn tại với ID người dùng này. Vui lòng liên hệ hỗ trợ để sửa lỗi."
                : error.message === "Bác sĩ không tồn tại"
                    ? "Không tìm thấy hồ sơ bác sĩ. Vui lòng thử lại hoặc liên hệ hỗ trợ."
                    : error.message || "Có lỗi xảy ra khi cập nhật thông tin!";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="main-content" style={{ margin: 0, width: "100%", boxSizing: "border-box" }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <header className="content-header">
                <h1>Hồ sơ bác sĩ</h1>
            </header>
            <div className="profile-content">
                <div className="profile-left">
                    <div className="profile-avatar-container">
                        <div className="profile-avatar-large">
                            {previewUrl ? (
                                <img src={getAvatarUrl(previewUrl)} alt="Avatar" className="avatar-image" />
                            ) : (
                                doctorData.name.charAt(0) || "D"
                            )}
                            <label htmlFor="avatar-upload" className="change-avatar-btn">
                                <span className="camera-icon">📷</span>
                            </label>
                            <input
                                type="file"
                                id="avatar-upload"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: "none" }}
                            />
                        </div>
                        {selectedFile && (
                            <button className="upload-avatar-btn" onClick={handleAvatarUpload} disabled={saving}>
                                {saving ? "Đang tải lên..." : "Lưu ảnh"}
                            </button>
                        )}
                    </div>
                    <div className="profile-info">
                        <h3>{doctorData.name}</h3>
                        <p className="user-email">{doctorData.email}</p>
                        <p className="user-role">DOCTOR</p>
                        {!isGoogleAccount() && (
                            <button className="edit-profile-btn" onClick={() => setShowPasswordModal(true)}>
                                <span className="password-icon">🔒</span> Thay đổi mật khẩu ở đây!
                            </button>
                        )}
                    </div>
                </div>
                <div className="profile-right">
                    <div className="profile-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={doctorData.email}
                                    onChange={handleChange}
                                    className="form-control"
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <div className="phone-input">
                                    <div className="phone-prefix">+84</div>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={doctorData.phone}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Giới tính</label>
                                <select
                                    name="gender"
                                    value={doctorData.gender}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tên tài khoản</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={doctorData.username}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={doctorData.birthdate}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={doctorData.fullname}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Chuyên khoa</label>
                                <select
                                    name="specialtyId"
                                    value={doctorData.specialtyId}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="">-- Chọn Chuyên khoa --</option>
                                    {specialties.map((specialty) => (
                                        <option key={specialty.id} value={specialty.id}>
                                            {specialty.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mã số chứng chỉ</label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={doctorData.licenseNumber}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label>Năm kinh nghiệm</label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={doctorData.experience}
                                    onChange={handleChange}
                                    className="form-control"
                                    min="0"
                                    max="50"
                                    placeholder="Nhập số năm kinh nghiệm"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tỉnh/Thành phố</label>
                                <select
                                    name="provinceCode"
                                    value={doctorData.provinceCode}
                                    onChange={handleProvinceChange}
                                    className="form-control"
                                    disabled={loading}
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
                                <label>Phường/Xã</label>
                                <select
                                    name="wardCode"
                                    value={doctorData.wardCode}
                                    onChange={handleWardChange}
                                    className="form-control"
                                    disabled={!doctorData.provinceCode || loading}
                                >
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map((ward) => (
                                        <option key={ward.id} value={ward.id}>
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
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Giới thiệu (Tùy chọn)</label>
                                <textarea
                                    name="bio"
                                    value={doctorData.bio}
                                    onChange={handleChange}
                                    className="form-control bio-textarea"
                                    placeholder="Mô tả về kinh nghiệm, chuyên môn và phương pháp điều trị của bạn..."
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="save-button" onClick={handleSave} disabled={saving}>
                                {saving ? "Đang lưu..." : "Cập nhật"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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
    );
}