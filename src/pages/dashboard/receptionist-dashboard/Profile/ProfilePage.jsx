import React, { useState } from "react"
import ProfileAvatar from "../Profile/jsx/ProfileAvatar"
import ProfileForm from "../Profile/jsx/ProfileForm"
import PasswordModal from "../Profile/jsx/PasswordModal"
import "../Profile/ProfilePage.css"

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [receptionistData, setReceptionistData] = useState({
        email: "staff.giapcd@gmail.com",
        fullName: "Cao Đình Giáp",
        phone: "0352195867",
        gender: "Nam",
        shift: "Ca sáng",
    });

    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReceptionistData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) return alert("Vui lòng chọn ảnh");
        await new Promise((res) => setTimeout(res, 1000));
        alert("Ảnh đã được cập nhật!");
        setSelectedFile(null);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        if (passwordError) setPasswordError("");
    };

    const handlePasswordSubmit = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            return setPasswordError("Vui lòng điền đầy đủ thông tin");
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setPasswordError("Mật khẩu mới không khớp");
        }
        alert("Đổi mật khẩu thành công!");
        setShowPasswordModal(false);
    };

    // Hàm xử lý khi bấm nút cập nhật
    const handleUpdate = () => {
        alert("Thông tin đã được cập nhật!");
        // TODO: gọi API cập nhật dữ liệu backend nếu có
    };

    const menuItems = [
        { id: "schedule", label: "Lịch làm việc của bác sĩ", icon: "📅" },
        { id: "appointments", label: "Cuộc hẹn khách hàng", icon: "🗓️" },
        { id: "create", label: "Tạo cuộc hẹn", icon: "➕" },
        { id: "profile", label: "Hồ sơ cá nhân", icon: "👤" },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-content">
                <h1 className="profile-title">Hồ sơ cá nhân</h1>
                <div className="dashboard-card">
                    <div className="left-column">
                        <ProfileAvatar
                            fullName={receptionistData.fullName}
                            previewUrl={previewUrl}
                            handleFileChange={handleFileChange}
                            handleAvatarUpload={handleAvatarUpload}
                            selectedFile={selectedFile}
                        />
                        <button onClick={() => setShowPasswordModal(true)} className="password-btn">
                            🔒 Thay đổi mật khẩu ở đây!
                        </button>
                    </div>
                    <div className="right-column">
                        <ProfileForm
                            data={receptionistData}
                            handleChange={handleInputChange}
                            onUpdate={handleUpdate} // Truyền hàm cập nhật
                        />
                    </div>
                </div>
            </div>
            <PasswordModal
                visible={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handlePasswordSubmit}
                onChange={handlePasswordChange}
                data={passwordData}
                error={passwordError}
            />
        </div>
    );
}
