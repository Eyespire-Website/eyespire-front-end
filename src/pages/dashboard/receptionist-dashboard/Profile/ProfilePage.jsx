import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import userService from "../../../../services/userService";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProfilePage.css'
import { User } from 'lucide-react';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        username: "",
        fullname: "",
        address: "",
        role: "",
        birthdate: "",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    // Kiểm tra xem người dùng đăng nhập bằng Google hay không
    const isGoogleAccount = () => {
        const currentUser = authService.getCurrentUser();
        return currentUser && (
            currentUser.isGoogleAccount === true ||
            currentUser.isGoogleAccount === "true"
        );
    };

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

    // Hàm lấy thông tin người dùng từ API
    const fetchUserData = async () => {
        try {
            // Kiểm tra xem có thông tin người dùng trong localStorage không
            const currentUserFromStorage = authService.getCurrentUser();
            if (!currentUserFromStorage) {
                // Nếu không có thông tin người dùng, chuyển hướng về trang đăng nhập
                navigate('/login');
                return;
            }

            setLoading(true);
            // Lấy thông tin người dùng hiện tại từ API
            const userData = await userService.getCurrentUserInfo();

            // Cập nhật state với dữ liệu mới
            setUser({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                gender: userData.gender || "MALE",
                username: userData.username || "",
                fullname: userData.name || "",
                address: userData.addressDetail || "",
                role: userData.role || "RECEPTIONIST",
                birthdate: userData.dateOfBirth || "",
                provinceCode: userData.province || "",
                districtCode: userData.district || "",
                wardCode: userData.ward || "",
            });

            // Cập nhật avatar nếu có
            if (userData.avatarUrl) {
                setPreviewUrl(userData.avatarUrl);
            }

            // Nếu có provinceCode, load districts
            if (userData.province) {
                fetchDistricts(userData.province);
            }

            // Nếu có districtCode, load wards
            if (userData.district) {
                fetchWards(userData.district);
            }

            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);

            // Nếu API lỗi, sử dụng dữ liệu từ localStorage
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser({
                    name: currentUser.name || "",
                    email: currentUser.email || "",
                    phone: currentUser.phone || "",
                    gender: currentUser.gender || "MALE",
                    username: currentUser.username || "",
                    fullname: currentUser.name || "",
                    address: currentUser.address || "",
                    role: currentUser.role || "RECEPTIONIST",
                    birthdate: currentUser.birthdate || "",
                    provinceCode: currentUser.provinceCode || "",
                    districtCode: currentUser.districtCode || "",
                    wardCode: currentUser.wardCode || "",
                });

                if (currentUser.avatarUrl) {
                    setPreviewUrl(currentUser.avatarUrl);
                }

                // Nếu có provinceCode, load districts
                if (currentUser.provinceCode) {
                    fetchDistricts(currentUser.provinceCode);
                }

                // Nếu có districtCode, load wards
                if (currentUser.districtCode) {
                    fetchWards(currentUser.districtCode);
                }
            } else {
                // Nếu không có thông tin người dùng, chuyển hướng về trang đăng nhập
                navigate('/login');
            }

            setLoading(false);
        }
    };

    // Fetch tất cả các tỉnh/thành phố khi component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://provinces.open-api.vn/api/p/');
                setProvinces(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu tỉnh/thành phố:", error);
                setLoading(false);
            }
        };

        fetchProvinces();
    }, []);

    // Lấy thông tin người dùng từ API
    useEffect(() => {
        fetchUserData();
    }, []);

    // Fetch quận/huyện khi chọn tỉnh/thành phố
    const fetchDistricts = async (provinceCode) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(response.data.districts);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu quận/huyện:", error);
            setLoading(false);
        }
    };

    // Fetch phường/xã khi chọn quận/huyện
    const fetchWards = async (districtCode) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(response.data.wards);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu phường/xã:", error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleBackHome = () => {
        navigate('/');
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Chuẩn bị dữ liệu để gửi đi
            const userData = {
                name: user.fullname,
                phone: user.phone,
                gender: user.gender, // Đã được lưu đúng định dạng enum
                username: user.username,
                birthdate: user.birthdate,
                provinceCode: user.provinceCode,
                districtCode: user.districtCode,
                wardCode: user.wardCode,
                address: user.address
            };

            // Gọi API cập nhật thông tin
            const response = await userService.updateProfile(userData);

            // Cập nhật state với dữ liệu mới
            setUser(prev => ({
                ...prev,
                ...response
            }));

            // Hiển thị thông báo thành công
            toast.success('Cập nhật thông tin thành công!');

        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin!');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý khi chọn tỉnh/thành phố
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        // Reset district và ward khi thay đổi province
        setUser(prev => ({
            ...prev,
            provinceCode,
            districtCode: "",
            wardCode: ""
        }));
        setDistricts([]);
        setWards([]);

        if (provinceCode) {
            fetchDistricts(provinceCode);
        }
    };

    // Xử lý khi chọn quận/huyện
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        // Reset ward khi thay đổi district
        setUser(prev => ({
            ...prev,
            districtCode,
            wardCode: ""
        }));
        setWards([]);

        if (districtCode) {
            fetchWards(districtCode);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        // Reset error when user types
        if (passwordError) setPasswordError("");
    };

    const handlePasswordSubmit = async () => {
        // Validate passwords
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Mật khẩu mới không khớp");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }

        try {
            // Gọi API đổi mật khẩu
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            // Reset form và đóng modal khi thành công
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setShowPasswordModal(false);

            // Hiển thị thông báo thành công
            toast.success('Đổi mật khẩu thành công!');
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            if (error.response && error.response.status === 400) {
                setPasswordError("Mật khẩu hiện tại không đúng");
            } else {
                setPasswordError("Có lỗi xảy ra, vui lòng thử lại sau");
            }
        }
    };

    // Xử lý chọn file ảnh đại diện
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Tạo URL preview cho ảnh đã chọn
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    // Xử lý upload ảnh đại diện
    const handleAvatarUpload = async () => {
        if (!selectedFile) {
            toast.warning('Vui lòng chọn ảnh trước khi tải lên');
            return;
        }

        try {
            setSaving(true);

            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            // Gọi API upload ảnh
            await userService.updateAvatar(formData);

            // Tải lại thông tin người dùng
            await fetchUserData();

            // Hiển thị thông báo thành công
            toast.success('Cập nhật ảnh đại diện thành công!');

            // Reset selectedFile và previewUrl sau khi upload thành công
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Lỗi khi cập nhật ảnh đại diện:', error);
            toast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện!');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="main-content" style={{ margin: 0, width: '100%', boxSizing: 'border-box' }}>
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Header */}
            <header className="content-header">
                <h1>Hồ sơ cá nhân</h1>
            </header>

            {/* Profile Content */}
            <div className="profile-content">
                <div className="profile-left">
                    <div className="profile-avatar-container">
                        <div className="profile-avatar-large">
                            {previewUrl ? (
                                <img src={getAvatarUrl(previewUrl)} alt="Avatar" className="avatar-image" />
                            ) : (
                                user.name.charAt(0) || "U"
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="change-avatar-btn">
                            <span className="camera-icon">📷</span>
                        </label>
                        <input
                            type="file"
                            id="avatar-upload"
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        {selectedFile && (
                            <button
                                className="upload-avatar-btn"
                                onClick={handleAvatarUpload}
                                disabled={saving}
                            >
                                {saving ? 'Đang tải lên...' : 'Lưu ảnh'}
                            </button>
                        )}
                    </div>

                    <div className="profile-info">
                        <h3>{user.name}</h3>
                        <p className="user-email">{user.email}</p>
                        <p className="user-role">Lễ tân</p>
                        {isGoogleAccount() ? (
                            <p className="google-account-text">Tài khoản Google</p>
                        ) : (
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
                                <label>Email <span className="required">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                    className="form-control"
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại <span className="required">*</span></label>
                                <div className="phone-input">
                                    <div className="phone-prefix">+84</div>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={user.phone}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Giới tính <span className="required">*</span></label>
                                <select
                                    name="gender"
                                    value={user.gender}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tên tài khoản <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="username"
                                    value={user.username}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ngày sinh <span className="required">*</span></label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={user.birthdate}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Họ và tên <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={user.fullname}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tỉnh/Thành phố</label>
                                <select
                                    name="provinceCode"
                                    value={user.provinceCode}
                                    onChange={handleProvinceChange}
                                    className="form-control"
                                    disabled={loading}
                                >
                                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                    {provinces.map(province => (
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
                                    value={user.districtCode}
                                    onChange={handleDistrictChange}
                                    className="form-control"
                                    disabled={!user.provinceCode || loading}
                                >
                                    <option value="">-- Chọn Quận/Huyện --</option>
                                    {districts.map(district => (
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
                                    value={user.wardCode}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled={!user.districtCode || loading}
                                >
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map(ward => (
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
                                    value={user.address}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Thay đổi mật khẩu</h3>
                            <button className="close-modal" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {passwordError && (
                                <div className="error-message">{passwordError}</div>
                            )}
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
                            <button className="cancel-button" onClick={() => setShowPasswordModal(false)}>Hủy</button>
                            <button className="save-button" onClick={handlePasswordSubmit}>Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
