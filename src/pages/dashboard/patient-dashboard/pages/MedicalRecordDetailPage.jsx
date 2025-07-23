import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import authService from "../../../../services/authService";
import medicalRecordService from "../../../../services/medicalRecordService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/medical-records-detail.css';
import { Calendar, FileText, Camera, ArrowLeft } from 'lucide-react';

const MedicalRecordDetailPage = () => {
    const navigate = useNavigate();
    const { id: recordId } = useParams();
    const [user, setUser] = useState(null);
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
            name: currentUser.name || "Người dùng",
            email: currentUser.email || "",
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

            let doctorName = "Bác sĩ";
            if (data.doctor) {
                doctorName = "BS. " + (data.doctor.user?.fullName || data.doctor.fullName || data.doctor.name || "Bác sĩ");
            }

            let patientName = user?.name || "Bệnh nhân";
            if (data.patient) {
                patientName = data.patient.fullName || data.patient.name || patientName;
            }

            let serviceName = "Khám mắt";
            if (data.appointment?.service) {
                serviceName = data.appointment.service.name || serviceName;
            }

            let prescriptions = [];
            if (data.recommendedProducts?.length > 0) {
                prescriptions = data.recommendedProducts.map(item => ({
                    name: item.product?.name || "Thuốc",
                    dosage: item.dosage || "Theo chỉ định",
                    frequency: item.frequency || "Theo chỉ định",
                    duration: item.quantity ? `${item.quantity} viên` : "Theo chỉ định",
                    note: item.note || ""
                }));
            }

            let images = [];
            let otherFiles = [];
            if (data.recordFileUrl) {
                const url = getImageUrl(data.recordFileUrl);
                if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                    images.push(url);
                } else {
                    otherFiles.push(url);
                }
            }
            if (data.recordFiles?.length > 0) {
                data.recordFiles.forEach(file => {
                    const url = getImageUrl(file.url || file);
                    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                        images.push(url);
                    } else {
                        otherFiles.push(url);
                    }
                });
            }

            const createdDate = data.createdAt
                ? new Date(data.createdAt).toLocaleDateString('vi-VN')
                : "Không xác định";

            const formattedRecord = {
                id: data.id,
                recordId: data.id,
                patient: patientName,
                patientId: data.patientId,
                serviceName: serviceName,
                date: createdDate,
                doctor: doctorName,
                doctorId: data.doctorId,
                diagnosis: data.diagnosis || "Không có chẩn đoán",
                treatment: data.notes || "Không có phác đồ điều trị",
                prescription: prescriptions,
                images: images,
                otherFiles: otherFiles,
                appointmentId: data.appointmentId,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                visualAcuity: data.visualAcuity || "Không có thông tin",
                intraocularPressure: data.intraocularPressure || "Không có thông tin",
                refraction: data.refraction || "Không có thông tin"
            };

            setRecordDetail(formattedRecord);
        } catch (err) {
            console.error("Error fetching medical record detail:", err);
            setError("Không thể tải thông tin chi tiết hồ sơ điều trị. Vui lòng thử lại sau.");
            toast.error("Không thể tải thông tin chi tiết hồ sơ điều trị");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const handleBackToList = () => {
        navigate('/dashboard/patient/medical-records');
    };

    const handleImageClick = (image, index) => {
        console.log('Open image:', image, index);
    };

    if (!recordDetail && !loading) {
        return (
            <div className="mrd-container">
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="mrd-content">
                    <div className="mrd-loading-container">
                        <div className="mrd-loading-spinner">Không có dữ liệu</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mrd-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <header className="mrd-header">
                <div className="mrd-header-left">
                    <button className="mrd-back-button" onClick={handleBackToList}>
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="mrd-title">Chi tiết hồ sơ</h1>
                </div>
                <div className="mrd-header-right">
                    <div className="mrd-user-avatar">
                        {user?.avatar ? (
                            <img src={getAvatarUrl(user.avatar)} alt={user.name} className="mrd-avatar-image" />
                        ) : (
                            user?.name?.charAt(0) || "U"
                        )}
                    </div>
                </div>
            </header>

            <div className="mrd-breadcrumb-container">
                <nav className="mrd-breadcrumb">
                    <div className="mrd-breadcrumb-item">
                        <FileText size={16} />
                        <span>Hồ sơ điều trị</span>
                    </div>
                    <span className="mrd-breadcrumb-separator">/</span>
                    <div className="mrd-breadcrumb-item">
                        <span onClick={handleBackToList} className="mrd-breadcrumb-link">
                            Danh sách hồ sơ bệnh án
                        </span>
                    </div>
                    <span className="mrd-breadcrumb-separator">/</span>
                    <div className="mrd-breadcrumb-item active">
                        <span>Chi tiết hồ sơ</span>
                    </div>
                </nav>
            </div>

            <div className="mrd-content">
                {loading ? (
                    <div className="mrd-loading-container">
                        <div className="mrd-loading-spinner">Đang tải...</div>
                    </div>
                ) : (
                    <div className="mrd-detail-grid">
                        <div className="mrd-detail-card">
                            <h2 className="mrd-card-title">Thông tin chung</h2>
                            <div className="mrd-card-content">
                                <div className="mrd-info-row">
                                    <span className="mrd-info-label">Mã hồ sơ:</span>
                                    <p className="mrd-info-value">{recordDetail.id}</p>
                                </div>
                                <div className="mrd-info-row">
                                    <span className="mrd-info-label">Tên khách:</span>
                                    <p className="mrd-info-value">{recordDetail.patient}</p>
                                </div>
                                <div className="mrd-info-row">
                                    <span className="mrd-info-label">Dịch vụ:</span>
                                    <p className="mrd-info-value">{recordDetail.serviceName}</p>
                                </div>
                                <div className="mrd-info-row">
                                    <span className="mrd-info-label">Ngày khám:</span>
                                    <p className="mrd-info-value">{recordDetail.date}</p>
                                </div>
                                <div className="mrd-info-row">
                                    <span className="mrd-info-label">Bác sĩ:</span>
                                    <p className="mrd-info-value">{recordDetail.doctor}</p>
                                </div>
                                {recordDetail.images?.length > 0 && (
                                    <div className="mrd-info-row">
                                        <span className="mrd-info-label">Hình ảnh:</span>
                                        <div className="mrd-images-grid">
                                            {recordDetail.images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className="mrd-image-item"
                                                    onClick={() => handleImageClick(image, index)}
                                                >
                                                    <img
                                                        src={image || "/placeholder.svg"}
                                                        alt={`Hình ảnh khám mắt ${index + 1}`}
                                                        className="mrd-medical-image"
                                                    />
                                                    <div className="mrd-image-overlay">
                                                        <Camera size={16} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mrd-detail-card">
                            <h2 className="mrd-card-title">Chẩn đoán và điều trị</h2>
                            <div className="mrd-card-content">
                                <div className="mrd-info-row">
                                    <span className="mrd-info-label">Chẩn đoán:</span>
                                    <p className="mrd-info-value">{recordDetail.diagnosis}</p>
                                </div>
                                <div className="mrd-info-row">
                                    <span className="mrd-info-label">Phác đồ điều trị:</span>
                                    <p className="mrd-info-value">{recordDetail.treatment}</p>
                                </div>
                            </div>
                        </div>

                        {recordDetail.prescription?.length > 0 && (
                            <div className="mrd-detail-card">
                                <h2 className="mrd-card-title">Đơn thuốc</h2>
                                <div className="mrd-card-content">
                                    <div className="mrd-prescription-list">
                                        {recordDetail.prescription.map((item, index) => (
                                            <div key={index} className="mrd-prescription-item">
                                                <div className="mrd-prescription-header">
                                                    <h4 className="mrd-prescription-name">{item.name}</h4>
                                                    <span className="mrd-prescription-duration">{item.duration}</span>
                                                </div>
                                                <div className="mrd-prescription-details">
                                                    <p className="mrd-prescription-detail">
                                                        <span className="mrd-detail-label">Liều dùng:</span> {item.dosage}
                                                    </p>
                                                    <p className="mrd-prescription-detail">
                                                        <span className="mrd-detail-label">Tần suất:</span> {item.frequency}
                                                    </p>
                                                    {item.note && (
                                                        <p className="mrd-prescription-detail">
                                                            <span className="mrd-detail-label">Ghi chú:</span> {item.note}
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

        </div>
    );
};

export default MedicalRecordDetailPage;