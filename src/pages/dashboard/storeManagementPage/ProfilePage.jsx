import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../services/authService";
import userService from "../../../services/userService";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Lock } from 'lucide-react';
import './STM-Style/storeProfile.css'

const ProfileContent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "MALE",
    username: "",
    fullname: "",
    address: "",
    role: "STORE_MANAGER",
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

  // Check if user is Google account
  const isGoogleAccount = () => {
    const currentUser = authService.getCurrentUser();
    return currentUser && (
        currentUser.isGoogleAccount === true ||
        currentUser.isGoogleAccount === "true"
    );
  };

  // Handle avatar URL
  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `http://localhost:8080${url}`;
    }
    return url;
  };

  // Update address based on province, district, and ward
  const updateAddress = () => {
    const selectedProvince = provinces.find(p => p.code === user.provinceCode);
    const selectedDistrict = districts.find(d => d.code === user.districtCode);
    const selectedWard = wards.find(w => w.code === user.wardCode);

    const addressParts = [];
    if (user.address && !user.provinceCode && !user.districtCode && !user.wardCode) {
      addressParts.push(user.address);
    }
    if (selectedWard) addressParts.push(selectedWard.name);
    if (selectedDistrict) addressParts.push(selectedDistrict.name);
    if (selectedProvince) addressParts.push(selectedProvince.name);

    const newAddress = addressParts.length > 0 ? addressParts.join(', ') : user.address;
    setUser(prev => ({ ...prev, address: newAddress }));
  };

  // Fetch user data and initialize provinces
  const fetchUserData = async () => {
    try {
      const currentUserFromStorage = authService.getCurrentUser();
      if (!currentUserFromStorage) {
        navigate('/login');
        return;
      }

      setLoading(true);
      const userData = await userService.getCurrentUserInfo();

      setUser({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        gender: userData.gender || "MALE",
        username: userData.username || "",
        fullname: userData.name || "",
        address: userData.addressDetail || userData.addressDetail || "",
        role: userData.role || "STORE_MANAGER",
        birthdate: userData.dateOfBirth || "",
        provinceCode: userData.province || "",
        districtCode: userData.district || "",
        wardCode: userData.ward || "",
      });

      if (userData.avatarUrl) {
        setPreviewUrl(userData.avatarUrl);
      }

      // Fetch provinces
      const provinceResponse = await axios.get("https://provinces.open-api.vn/api/p/");
      setProvinces(provinceResponse.data);

      // Fetch districts if province is selected
      if (userData.province) {
        const districtResponse = await axios.get(`https://provinces.open-api.vn/api/p/${userData.province}?depth=2`);
        setDistricts(districtResponse.data.districts || []);

        // Fetch wards if district is selected
        if (userData.district) {
          const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${userData.district}?depth=2`);
          setWards(wardResponse.data.wards || []);
        }
      }

      // Update address after fetching data
      setTimeout(() => updateAddress(), 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (user.provinceCode) {
      setLoading(true);
      fetch(`https://provinces.open-api.vn/api/p/${user.provinceCode}?depth=2`)
          .then(response => response.json())
          .then(data => {
            setDistricts(data.districts || []);
            setLoading(false);
            updateAddress();
          })
          .catch(error => {
            console.error("Error fetching districts:", error);
            setLoading(false);
          });
    } else {
      setDistricts([]);
      setWards([]);
      updateAddress();
    }
  }, [user.provinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    if (user.districtCode) {
      setLoading(true);
      fetch(`https://provinces.open-api.vn/api/d/${user.districtCode}?depth=2`)
          .then(response => response.json())
          .then(data => {
            setWards(data.wards || []);
            setLoading(false);
            updateAddress();
          })
          .catch(error => {
            console.error("Error fetching wards:", error);
            setLoading(false);
          });
    } else {
      setWards([]);
      updateAddress();
    }
  }, [user.districtCode]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle province change
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setUser(prev => ({
      ...prev,
      provinceCode,
      districtCode: "",
      wardCode: "",
    }));
    setDistricts([]);
    setWards([]);
    updateAddress();
  };

  // Handle district change
  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setUser(prev => ({
      ...prev,
      districtCode,
      wardCode: "",
    }));
    setWards([]);
    updateAddress();
  };

  // Handle ward change
  const handleWardChange = (e) => {
    setUser(prev => ({ ...prev, wardCode: e.target.value }));
    updateAddress();
  };

  // Handle profile save
  const handleSave = async () => {
    try {
      setSaving(true);
      const userData = {
        name: user.fullname,
        phone: user.phone,
        gender: user.gender.toUpperCase(),
        username: user.username,
        birthdate: user.birthdate,
        provinceCode: user.provinceCode,
        districtCode: user.districtCode,
        wardCode: user.wardCode,
        address: user.address
      };

      await userService.updateProfile(userData);
      await fetchUserData();
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setSaving(false);
    }
  };

  // Handle file change for avatar
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

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.warning('Vui lòng chọn ảnh trước khi tải lên');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      await userService.updateAvatar(formData);
      await fetchUserData();
      toast.success('Cập nhật ảnh đại diện thành công!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh đại diện:', error);
      toast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện!');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordError) setPasswordError("");
  };

  // Handle password submit
  const handlePasswordSubmit = async () => {
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
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword // Fixed typo here
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordModal(false);
      toast.success('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response && error.response.status === 400) {
        setPasswordError("Mật khẩu hiện tại không đúng");
      } else {
        setPasswordError("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    }
  };

  return (
      <div className="profile-container">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="profile-left-panel">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {previewUrl ? (
                  <img src={getAvatarUrl(previewUrl)} alt="Avatar" className="avatar-image" />
              ) : (
                  user.fullname.charAt(0) || "U"
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

          <div className="profile-basic-info">
            <h3>{user.fullname}</h3>
            <p className="profile-display-email">{user.email}</p>
            <span className="profile-role-badge">QUẢN LÝ CỬA HÀNG</span>
            {isGoogleAccount() ? (
                <p className="google-account-text">Tài khoản Google</p>
            ) : (
                <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}>
                  <Lock size={16} /> Thay đổi mật khẩu
                </button>
            )}
          </div>
        </div>

        <div className="profile-right-panel">
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
                    onChange={handleWardChange}
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
                    placeholder="Nhập địa chỉ chi tiết..."
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
};

export default ProfileContent;