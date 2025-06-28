import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import authService from "../../../../services/authService";
import medicalRecordService from "../../../../services/medicalRecordService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/medical-records-detail.css';
import { Calendar, Package, FileText, History, User, Camera, ArrowLeft } from 'lucide-react';

const MedicalRecordDetailPage = () => {
    const navigate = useNavigate();
    const { id: recordId } = useParams();
    const [user, setUser] = useState({
        name: "Đỗ Quang Dũng",
        email: "doquangdung1782004@gmail.com",
        role: "patient",
    });

    const [loading, setLoading] = useState(true);
    const [recordDetail, setRecordDetail] = useState(null);
    const [error, setError] = useState(null);

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
            avatar: currentUser.avatarUrl || null,
            id: currentUser.id
        });

        fetchMedicalRecordDetail(recordId);
    }, [navigate, recordId]);

    const fetchMedicalRecordDetail = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await medicalRecordService.getMedicalRecordById(id);
            console.log("Chi tiết hồ sơ điều trị từ API:", data);
            
            // Xử lý tên bác sĩ
            let doctorName = "Bác sĩ";
            if (data.doctor) {
                if (data.doctor.user && data.doctor.user.fullName) {
                    doctorName = "BS. " + data.doctor.user.fullName;
                } else if (data.doctor.fullName) {
                    doctorName = "BS. " + data.doctor.fullName;
                } else if (data.doctor.name) {
                    doctorName = "BS. " + data.doctor.name;
                }
            }
            
            // Xử lý tên bệnh nhân
            let patientName = user.name;
            if (data.patient) {
                if (data.patient.fullName) {
                    patientName = data.patient.fullName;
                } else if (data.patient.name) {
                    patientName = data.patient.name;
                }
            }
            
            // Xử lý toa thuốc
            let prescriptions = [];
            if (data.recommendedProducts && data.recommendedProducts.length > 0) {
                prescriptions = data.recommendedProducts.map(item => ({
                    name: item.product ? item.product.name : "Thuốc",
                    dosage: "Theo chỉ định",
                    frequency: "Theo chỉ định",
                    duration: `${item.quantity} viên`,
                    note: ""
                }));
            }
            
            const formattedRecord = {
                id: `EYE${data.id}`,
                patient: patientName,
                examType: data.diagnosis || "Khám mắt",
                date: new Date(data.createdAt).toLocaleDateString('vi-VN'),
                doctor: doctorName,
                diagnosis: data.diagnosis || "Không có chẩn đoán",
                treatment: data.notes || "Không có phác đồ điều trị",
                prescription: prescriptions,
                images: data.recordFileUrl ? [getImageUrl(data.recordFileUrl)] : []
            };
            
            console.log("Dữ liệu đã format:", formattedRecord);
            setRecordDetail(formattedRecord);
        } catch (err) {
            console.error("Error fetching medical record detail:", err);
            setError("Không thể tải chi tiết hồ sơ điều trị. Vui lòng thử lại sau.");
            toast.error("Không thể tải chi tiết hồ sơ điều trị. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        if (url.startsWith('/')) {
            return `http://localhost:8080${url}`;
        }

        return `http://localhost:8080/${url}`;
    };

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

    const handleBackToList = () => {
        console.log('Going back to medical records list');
        navigate('/dashboard/patient/medical-records');
    };

    const handleMenuClick = (route) => {
        navigate(route);
    };

    const handleImageClick = (image, index) => {
        console.log('Open image:', image, index);
    };

    if (!recordDetail) {
        return (
            <div className="dashboard-container">
                <ToastContainer position="top-right" autoClose={3000} />
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
            <div className="main-content" style={{ width: '100%', marginLeft: 0 }}>
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

                <div className="medical-record-detail-content">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-text">Đang tải...</div>
                        </div>
                    ) : (
                        <div className="detail-grid">
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

                <footer className="content-footer">
                    <div className="footer-content">
                        <div className="footer-left">
                            2025 EyeSpire. All rights reserved.
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