import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../../services/userService";
import authService from "../../../services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./doctor.css";

export default function DoctorDashboard() {
    const [doctorData, setDoctorData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "male",
        username: "",
        fullname: "",
        address: "",
        birthdate: "",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
        specialization: "",
        licenseNumber: "",
        experience: "",
        bio: "",
        specialtyId: "",
    });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
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

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                setLoading(true);
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    toast.error("Vui lòng đăng nhập!");
                    navigate("/login");
                    return;
                }
                const userData = await userService.getCurrentUserInfo();
                let doctorDataResponse = null;
                try {
                    doctorDataResponse = await userService.getDoctorByUserId();
                } catch (error) {
                    if (error.response?.status !== 404) {
                        throw error;
                    }
                }
                setDoctorData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    gender: userData.gender?.toLowerCase() || "male",
                    username: userData.username || "",
                    fullname: userData.name || "",
                    address: userData.addressDetail || "",
                    birthdate: userData.dateOfBirth || "",
                    provinceCode: userData.province || "",
                    districtCode: userData.district || "",
                    wardCode: userData.ward || "",
                    specialization: doctorDataResponse?.specialization || "",
                    licenseNumber: doctorDataResponse?.qualification || "",
                    experience: doctorDataResponse?.experience || "",
                    bio: doctorDataResponse?.description || "",
                    specialtyId: doctorDataResponse?.specialtyId || "",
                });
                if (userData.avatarUrl) {
                    setPreviewUrl(userData.avatarUrl);
                }
                if (userData.province) {
                    await fetchDistricts(userData.province);
                }
                if (userData.district) {
                    await fetchWards(userData.district);
                }
            } catch (error) {
                console.error("Error fetching doctor data:", error);
                toast.error(error.response?.data || "Lỗi khi lấy thông tin bác sĩ!");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorData();
    }, [navigate]);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const data = await userService.getSpecialties();
                setSpecialties(data);
            } catch (error) {
                console.error("Error fetching specialties:", error);
                toast.error("Lỗi khi lấy danh sách chuyên khoa!");
            }
        };
        fetchSpecialties();
    }, []);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoading(true);
                const response = await axios.get("https://provinces.open-api.vn/api/p/");
                setProvinces(response.data);
            } catch (error) {
                console.error("Error fetching provinces:", error);
                toast.error("Lỗi khi lấy danh sách tỉnh/thành phố!");
            } finally {
                setLoading(false);
            }
        };
        fetchProvinces();
    }, []);

    const fetchDistricts = async (provinceCode) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(response.data.districts);
        } catch (error) {
            console.error("Error fetching districts:", error);
            toast.error("Lỗi khi lấy danh sách quận/huyện!");
        } finally {
            setLoading(false);
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(response.data.wards);
        } catch (error) {
            console.error("Error fetching wards:", error);
            toast.error("Lỗi khi lấy danh sách phường/xã!");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctorData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        setDoctorData((prev) => ({
            ...prev,
            provinceCode,
            districtCode: "",
            wardCode: "",
        }));
        setDistricts([]);
        setWards([]);
        if (provinceCode) {
            fetchDistricts(provinceCode);
        }
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        setDoctorData((prev) => ({
            ...prev,
            districtCode,
            wardCode: "",
        }));
        setWards([]);
        if (districtCode) {
            fetchWards(districtCode);
        }
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
            const response = await userService.updateDoctorProfile(doctorData);
            setDoctorData((prev) => ({
                ...prev,
                ...response.user,
                specialization: response.doctor.specialization,
                licenseNumber: response.doctor.qualification,
                experience: response.doctor.experience,
                bio: response.doctor.description,
                specialtyId: response.doctor.specialtyId,
            }));
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
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
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
                                <select
                                    name="experience"
                                    value={doctorData.experience}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="">-- Chọn số năm --</option>
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
                                <label>Quận/Huyện</label>
                                <select
                                    name="districtCode"
                                    value={doctorData.districtCode}
                                    onChange={handleDistrictChange}
                                    className="form-control"
                                    disabled={!doctorData.provinceCode || loading}
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
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled={!doctorData.districtCode || loading}
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