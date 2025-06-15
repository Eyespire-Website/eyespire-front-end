import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import authService from "../../../../services/authService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/medical-records-detail.css';
import { Calendar, Package, FileText, History, User, Camera, ArrowLeft } from 'lucide-react';

import PatientSidebar from '../PatientSidebar';

const MedicalRecordDetailPage = () => {
    const navigate = useNavigate();
    const { id: recordId } = useParams();
    const [user, setUser] = useState({
        name: "Đỗ Quang Dũng",
        email: "doquangdung1782004@gmail.com",
        role: "patient",
    });

    const [loading, setLoading] = useState(false);

    // Mock data với nhiều records để test
    const mockRecords = {
        "EYE2024001": {
            id: "EYE2024001",
            patient: "Đỗ Quang Dũng",
            examType: "Khám mắt tổng quát",
            date: "14/11/2024",
            doctor: "BS. Nguyễn Thị Mai",
            diagnosis: "Cận thị độ nhẹ (-1.25D mắt phải, -1.0D mắt trái)",
            treatment: "Kê đơn kính cận và thuốc nhỏ mắt. Hướng dẫn bài tập thư giãn mắt và chế độ sử dụng máy tính hợp lý.",
            prescription: [
                {
                    name: "Systane Ultra",
                    dosage: "1-2 giọt mỗi mắt",
                    frequency: "3-4 lần/ngày",
                    duration: "2 tuần",
                    note: "Sử dụng khi cảm thấy khô mắt",
                },
                {
                    name: "Kính cận",
                    dosage: "Mắt phải: -1.25D, Mắt trái: -1.0D",
                    frequency: "Đeo thường xuyên",
                    duration: "Tái khám sau 6 tháng",
                    note: "Đeo khi nhìn xa, học tập, lái xe",
                },
            ],
            images: [
                "/placeholder.svg?height=150&width=150",
                "/placeholder.svg?height=150&width=150"
            ],
        },
        "EYE2024002": {
            id: "EYE2024002",
            patient: "Đỗ Quang Dũng",
            examType: "Đo độ cận thị",
            date: "13/11/2024",
            doctor: "BS. Trần Văn Nam",
            diagnosis: "Cận thị tăng (-2.0D mắt phải, -1.75D mắt trái)",
            treatment: "Điều chỉnh độ kính và theo dõi định kỳ",
            prescription: [
                {
                    name: "Kính cận mới",
                    dosage: "Mắt phải: -2.0D, Mắt trái: -1.75D",
                    frequency: "Đeo thường xuyên",
                    duration: "Tái khám sau 3 tháng",
                    note: "Thay thế kính cũ",
                },
            ],
            images: [],
        },
        "EYE2024003": {
            id: "EYE2024003",
            patient: "Đỗ Quang Dũng",
            examType: "Điều trị khô mắt",
            date: "10/11/2024",
            doctor: "BS. Lê Thị Hoa",
            diagnosis: "Hội chứng khô mắt mức độ trung bình",
            treatment: "Điều trị bằng thuốc nhỏ mắt và thay đổi thói quen sử dụng máy tính",
            prescription: [
                {
                    name: "Tears Natural",
                    dosage: "2-3 giọt mỗi mắt",
                    frequency: "4-5 lần/ngày",
                    duration: "1 tháng",
                    note: "Sử dụng thường xuyên",
                },
            ],
            images: [],
        },
        "EYE2024004": {
            id: "EYE2024004",
            patient: "Đỗ Quang Dũng",
            examType: "Kiểm tra đáy mắt",
            date: "08/11/2024",
            doctor: "BS. Phạm Minh Tuấn",
            diagnosis: "Đáy mắt bình thường, không có bất thường",
            treatment: "Theo dõi định kỳ hàng năm",
            prescription: [],
            images: [
                "/placeholder.svg?height=150&width=150"
            ],
        },
        "EYE2024005": {
            id: "EYE2024005",
            patient: "Đỗ Quang Dũng",
            examType: "Phẫu thuật cận thị LASIK",
            date: "05/11/2024",
            doctor: "BS. Hoàng Văn Đức",
            diagnosis: "Phẫu thuật LASIK thành công",
            treatment: "Chăm sóc sau phẫu thuật và theo dõi hồi phục",
            prescription: [
                {
                    name: "Thuốc kháng sinh",
                    dosage: "1 viên",
                    frequency: "2 lần/ngày",
                    duration: "1 tuần",
                    note: "Uống sau ăn",
                },
                {
                    name: "Thuốc giảm viêm",
                    dosage: "1-2 giọt",
                    frequency: "3 lần/ngày",
                    duration: "2 tuần",
                    note: "Nhỏ mắt đúng giờ",
                },
            ],
            images: [],
        },
    };

    const [recordDetail, setRecordDetail] = useState(null);

    // Lấy thông tin người dùng và record detail khi component mount
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setUser({
            name: currentUser.name || "Đỗ Quang Dũng",
            email: currentUser.email || "doquangdung1782004@gmail.com",
            role: currentUser.role || "patient",
            avatar: currentUser.avatarUrl || null
        });

        // FIX: Load record detail dựa trên recordId từ URL
        console.log('Loading record detail for ID:', recordId);
        const record = mockRecords[recordId];
        if (record) {
            setRecordDetail(record);
        } else {
            console.error('Record not found:', recordId);
            toast.error('Không tìm thấy hồ sơ này');
            navigate('/medical-records');
        }
    }, [navigate, recordId]);

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

        return url;
    };

    const handleBackToList = () => {
        console.log('Going back to medical records list');
        navigate('/patient/medical-records');
    };

    const handleMenuClick = (route) => {
        navigate(route);
    };

    const handleImageClick = (image, index) => {
        // Handle image preview/modal
        console.log('Open image:', image, index);
    };

    // Hiển thị loading hoặc error nếu chưa có data
    if (!recordDetail) {
        return (
            <div className="dashboard-container">
                <ToastContainer position="top-right" autoClose={3000} />
                <PatientSidebar activeItem="medical" />
                <div className="main-content">
                    <div className="loading-container">
                        <div className="loading-text">Đang tải...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />

            <PatientSidebar activeItem="medical" />

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="content-header">
                    <div className="header-left">
                        <button
                            className="back-button"
                            onClick={handleBackToList}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1>Chi tiết hồ sơ</h1>
                    </div>

                    <div className="header-right">
                        <div className="user-avatar">
                            {user.avatar ? (
                                <img src={getAvatarUrl(user.avatar)} alt={user.name} className="avatar-image" />
                            ) : (
                                <div className="avatar-fallback">
                                    {user.name?.charAt(0) || "U"}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="breadcrumb-container">
                    <nav className="breadcrumb">
                        <div className="breadcrumb-item">
                            <FileText size={16} />
                            <span>Hồ sơ điều trị</span>
                        </div>
                        <span className="breadcrumb-separator">/</span>
                        <div className="breadcrumb-item">
                            <span onClick={handleBackToList} className="breadcrumb-link">
                                Danh sách hồ sơ bệnh án
                            </span>
                        </div>
                        <span className="breadcrumb-separator">/</span>
                        <div className="breadcrumb-item active">
                            <span>Chi tiết hồ sơ</span>
                        </div>
                    </nav>
                </div>

                {/* Medical Record Detail Content */}
                <div className="medical-record-detail-content">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-text">Đang tải...</div>
                        </div>
                    ) : (
                        <div className="detail-grid">
                            {/* Thông tin chung */}
                            <div className="detail-card">
                                <h2 className="card-title">Thông tin chung</h2>
                                <div className="card-content">
                                    <div className="info-row">
                                        <span className="info-label">Mã hồ sơ:</span>
                                        <p className="info-value">{recordDetail.id}</p>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Tên khách:</span>
                                        <p className="info-value">{recordDetail.patient}</p>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Loại khám:</span>
                                        <p className="info-value">{recordDetail.examType}</p>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Ngày khám:</span>
                                        <p className="info-value">{recordDetail.date}</p>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Bác sĩ:</span>
                                        <p className="info-value">{recordDetail.doctor}</p>
                                    </div>
                                    {recordDetail.images && recordDetail.images.length > 0 && (
                                        <div className="info-row">
                                            <span className="info-label">Hình ảnh:</span>
                                            <div className="images-grid">
                                                {recordDetail.images.map((image, index) => (
                                                    <div
                                                        key={index}
                                                        className="image-item"
                                                        onClick={() => handleImageClick(image, index)}
                                                    >
                                                        <img
                                                            src={image || "/placeholder.svg"}
                                                            alt={`Hình ảnh khám mắt ${index + 1}`}
                                                            className="medical-image"
                                                        />
                                                        <div className="image-overlay">
                                                            <Camera size={16} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chẩn đoán và điều trị */}
                            <div className="detail-card">
                                <h2 className="card-title">Chẩn đoán và điều trị</h2>
                                <div className="card-content">
                                    <div className="info-row">
                                        <span className="info-label">Chẩn đoán:</span>
                                        <p className="info-value">{recordDetail.diagnosis}</p>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Phác đồ điều trị:</span>
                                        <p className="info-value">{recordDetail.treatment}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Đơn thuốc */}
                            {recordDetail.prescription && recordDetail.prescription.length > 0 && (
                                <div className="detail-card">
                                    <h2 className="card-title">Đơn thuốc</h2>
                                    <div className="card-content">
                                        <div className="prescription-list">
                                            {recordDetail.prescription.map((item, index) => (
                                                <div key={index} className="prescription-item">
                                                    <div className="prescription-header">
                                                        <h4 className="prescription-name">{item.name}</h4>
                                                        <span className="prescription-duration">{item.duration}</span>
                                                    </div>
                                                    <div className="prescription-details">
                                                        <p className="prescription-detail">
                                                            <span className="detail-label">Liều dùng:</span> {item.dosage}
                                                        </p>
                                                        <p className="prescription-detail">
                                                            <span className="detail-label">Tần suất:</span> {item.frequency}
                                                        </p>
                                                        {item.note && (
                                                            <p className="prescription-detail">
                                                                <span className="detail-label">Ghi chú:</span> {item.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="content-footer">
                    <div className="footer-content">
                        <div className="footer-left">
                            © 2025 EyeSpire. All rights reserved.
                        </div>
                        <div className="footer-right">
                            <a href="#" className="footer-link">Privacy Policy</a>
                            <a href="#" className="footer-link">Terms of Service</a>
                            <a href="#" className="footer-link">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MedicalRecordDetailPage;