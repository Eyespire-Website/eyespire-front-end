import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import medicalRecordService from "../../../../services/medicalRecordService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/medical-records.css';
import { Calendar, Package, FileText, Search } from 'lucide-react';

export default function MedicalRecordsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(5);

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            const userData = await authService.getCurrentUserInfo();
            setUser(userData);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate('/login');
            }
        }
    };

    // Fetch medical records
    const fetchMedicalRecords = async () => {
        try {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            const data = await medicalRecordService.getPatientMedicalRecords(currentUser.id);
            const formattedRecords = data.map((record) => {
                let doctorName = "Bác sĩ";
                if (record.doctor) {
                    doctorName = record.doctor.user?.fullName || record.doctor.fullName || record.doctor.name || "Bác sĩ";
                    doctorName = "BS. " + doctorName;
                }
                const createdDate = record.createdAt
                    ? new Date(record.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })
                    : "Không xác định";
                const diagnosis = record.diagnosis || "Chưa có chẩn đoán";
                let serviceName = "Khám mắt";
                if (record.appointment?.services?.length > 0) {
                    serviceName = record.appointment.services.map(service => service.name).filter(name => name).join(", ");
                } else if (record.appointment?.service) {
                    serviceName = record.appointment.service.name || "Khám mắt";
                }
                const status = record.status || "completed";
                return {
                    id: record.id,
                    diagnosis,
                    serviceName,
                    doctor: doctorName,
                    date: createdDate,
                    status,
                    notes: record.notes || "Không có ghi chú",
                    appointmentId: record.appointmentId,
                    patientId: record.patientId,
                    doctorId: record.doctorId,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt
                };
            });
            setMedicalRecords(formattedRecords);
            setFilteredRecords(formattedRecords);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu hồ sơ điều trị:", err);
            toast.error("Không thể tải hồ sơ điều trị. Vui lòng thử lại sau.");
            setMedicalRecords([]);
            setFilteredRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchMedicalRecords();
    }, []);

    // Filter records based on search term
    useEffect(() => {
        const filtered = medicalRecords.filter(record =>
            (record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredRecords(filtered);
        setCurrentPage(1);
    }, [searchTerm, medicalRecords]);

    // Pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewDetails = (recordId) => {
        navigate(`/dashboard/patient/medical-records/${recordId}`);
    };

    const getAvatarUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
    };

    const renderServices = (serviceName) => {
        if (!serviceName) return <span className="ptod-service-tag">Khám mắt</span>;
        if (serviceName.includes(",")) {
            const services = serviceName.split(",").map(s => s.trim()).filter(s => s);
            if (services.length > 2) {
                return (
                    <div className="ptod-services-tooltip">
                        <div className="ptod-services-list">
                            <span className="ptod-service-tag">{services[0]}</span>
                            <span className="ptod-service-tag">{services[1]}</span>
                            <span className="ptod-services-count">+{services.length - 2}</span>
                        </div>
                        <div className="ptod-tooltip-content">
                            {services.join(", ")}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="ptod-services-list">
                        {services.map((service, index) => (
                            <span key={index} className="ptod-service-tag">{service}</span>
                        ))}
                    </div>
                );
            }
        }
        return <span className="ptod-service-tag">{serviceName}</span>;
    };

    return (
        <div className="ptod-container">
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Header */}
            <header className="ptod-header">
                <div className="ptod-header-left">
                    <h1 className="ptod-title">Hồ sơ điều trị</h1>
                    <div className="ptod-search-container">
                        <Search className="ptod-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo dịch vụ, chẩn đoán, bác sĩ..."
                            className="ptod-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="ptod-header-right">
                    <div className="ptod-user-avatar">
                        {user && user.avatarUrl ? (
                            <img src={getAvatarUrl(user.avatarUrl)} alt={user.name} className="ptod-avatar-image" />
                        ) : (
                            user && user.name ? user.name.charAt(0) : "U"
                        )}
                    </div>
                </div>
            </header>

            {/* Records Content */}
            <div className="ptod-orders-content">
                {loading ? (
                    <div className="ptod-loading-container">
                        <div className="ptod-loading-spinner">Đang tải...</div>
                    </div>
                ) : (
                    <>
                        <div className="ptod-orders-list">
                            {filteredRecords.length === 0 ? (
                                <div className="ptod-no-orders">
                                    <Package className="ptod-no-orders-icon" />
                                    <h3>Không có hồ sơ nào</h3>
                                    <p>Không có hồ sơ điều trị phù hợp với bộ lọc hiện tại.</p>
                                </div>
                            ) : (
                                currentRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className="ptod-order-card"
                                        onClick={() => handleViewDetails(record.id)}
                                    >
                                        <div className="ptod-order-content">
                                            <div className="ptod-order-main-info">
                                                <h3 className="ptod-order-id">
                                                    <FileText size={16} className="ptod-order-icon" />
                                                    Hồ sơ #{record.id}
                                                </h3>
                                                <p className="ptod-order-items">{renderServices(record.serviceName)}</p>
                                                <p className="ptod-order-unreviewed">{record.diagnosis}</p>
                                                <div className="ptod-order-meta">
                                                    <div className="ptod-order-date">
                                                        <Calendar size={14} />
                                                        <span>Ngày khám: {record.date}</span>
                                                    </div>
                                                    <p className="ptod-order-total">{record.doctor}</p>
                                                </div>
                                            </div>
                                            <div className="ptod-order-actions">
                                                <span className={`ptod-order-status ${record.status === 'completed' ? 'status-delivered' : 'status-default'}`}>
                                                    {record.status === "completed" ? "Hoàn thành" : record.status}
                                                </span>
                                                <button className="ptod-order-detail-btn">
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Pagination */}
                        {filteredRecords.length > 0 && (
                            <div className="ptod-pagination">
                                <button
                                    className="ptod-pagination-btn"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    «
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`ptod-pagination-btn ${currentPage === i + 1 ? 'ptod-active' : ''}`}
                                        onClick={() => paginate(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="ptod-pagination-btn"
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    »
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}