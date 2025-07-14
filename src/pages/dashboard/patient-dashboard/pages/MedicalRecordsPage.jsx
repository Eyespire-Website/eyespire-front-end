import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
import medicalRecordService from "../../../../services/medicalRecordService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/medical-records.css';
import { Calendar, Package, FileText, History, User, Search, ChevronDown } from 'lucide-react';

import PatientSidebar from '../PatientSidebar';

export default function MedicalRecordsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "Đỗ Quang Dũng",
        email: "doquangdung1782004@gmail.com",
        role: "patient",
    });

    const [medicalRecords, setMedicalRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);

    // Lấy thông tin người dùng khi component mount
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

        // Gọi API để lấy dữ liệu hồ sơ điều trị khi người dùng đã được xác định
        fetchMedicalRecords(currentUser.id);
    }, [navigate]);

    // Hàm gọi API để lấy dữ liệu hồ sơ điều trị
    const fetchMedicalRecords = async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await medicalRecordService.getPatientMedicalRecords(patientId);
            console.log("Dữ liệu hồ sơ điều trị từ API:", data);
            
            // Chuyển đổi dữ liệu từ API sang định dạng phù hợp với giao diện
            const formattedRecords = data.map((record) => {
                // Xử lý tên bác sĩ - kiểm tra cấu trúc dữ liệu thực tế
                let doctorName = "Bác sĩ";
                if (record.doctor) {
                    if (record.doctor.user && record.doctor.user.fullName) {
                        doctorName = "BS. " + record.doctor.user.fullName;
                    } else if (record.doctor.fullName) {
                        doctorName = "BS. " + record.doctor.fullName;
                    } else if (record.doctor.name) {
                        doctorName = "BS. " + record.doctor.name;
                    }
                }
                
                // Xử lý ngày tạo hồ sơ
                const createdDate = record.createdAt 
                    ? new Date(record.createdAt).toLocaleDateString('vi-VN')
                    : "Không xác định";
                
                // Xử lý chẩn đoán
                const diagnosis = record.diagnosis || "Chưa có chẩn đoán";
                
                // Xử lý dịch vụ y tế từ cuộc hẹn (hỗ trợ nhiều dịch vụ)
                let serviceName = "Khám mắt";
                if (record.appointment && record.appointment.services && record.appointment.services.length > 0) {
                    // Nếu có nhiều dịch vụ, hiển thị tất cả
                    const serviceNames = record.appointment.services.map(service => service.name).filter(name => name);
                    serviceName = serviceNames.length > 0 ? serviceNames.join(", ") : "Khám mắt";
                } else if (record.appointment && record.appointment.service) {
                    // Fallback cho trường hợp chỉ có một dịch vụ (backward compatibility)
                    serviceName = record.appointment.service.name || "Khám mắt";
                }
                
                // Xử lý trạng thái
                const status = record.status || "completed";
                
                return {
                    id: record.id, // ID thực trong database để sử dụng khi gọi API
                    diagnosis: diagnosis, // Chẩn đoán
                    serviceName: serviceName, // Tên dịch vụ y tế
                    doctor: doctorName,
                    date: createdDate,
                    status: status,
                    notes: record.notes || "Không có ghi chú",
                    // Thêm các trường hữu ích khác
                    appointmentId: record.appointmentId,
                    patientId: record.patientId,
                    doctorId: record.doctorId,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt
                };
            });
            
            setMedicalRecords(formattedRecords);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu hồ sơ điều trị:", err);
            setError("Không thể tải hồ sơ điều trị. Vui lòng thử lại sau.");
            toast.error("Không thể tải hồ sơ điều trị. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
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

        return url;
    };

    // Lọc dữ liệu theo từ khóa tìm kiếm
    const filteredRecords = medicalRecords.filter(record =>
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Phân trang
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    // Sửa: Sử dụng ID đúng để navigate
    const handleViewDetails = (record) => {
        console.log('Navigating to record:', record);
        // Đảm bảo sử dụng ID thực của hồ sơ để điều hướng
        navigate(`/dashboard/patient/medical-records/${record.id}`);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset về trang đầu khi search
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset về trang đầu
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleMenuClick = (route) => {
        navigate(route);
    };

    // Hàm render nhiều dịch vụ với UI đẹp
    const renderServices = (serviceName) => {
        if (!serviceName) return "Khám mắt";
        
        // Nếu có dấu phẩy, nghĩa là có nhiều dịch vụ
        if (serviceName.includes(",")) {
            const services = serviceName.split(",").map(s => s.trim()).filter(s => s);
            
            // Nếu có nhiều hơn 2 dịch vụ, hiển thị 2 dịch vụ đầu + tooltip
            if (services.length > 2) {
                return (
                    <div className="services-tooltip">
                        <div className="services-list">
                            <span className="service-tag">{services[0]}</span>
                            <span className="service-tag">{services[1]}</span>
                            <span className="services-count">+{services.length - 2}</span>
                        </div>
                        <div className="tooltip-content">
                            {services.join(", ")}
                        </div>
                    </div>
                );
            } else {
                // Hiển thị tất cả nếu <= 2 dịch vụ
                return (
                    <div className="services-list">
                        {services.map((service, index) => (
                            <span key={index} className="service-tag">{service}</span>
                        ))}
                    </div>
                );
            }
        }
        
        // Chỉ có 1 dịch vụ
        return <span className="service-tag">{serviceName}</span>;
    };

    return (
        <div className="main-content" style={{ margin: 0, width: '100%', boxSizing: 'border-box' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header with Search */}
            <header className="content-header">
                <div className="header-left">
                    <h1>Danh sách hồ sơ</h1>
                </div>

                <div className="header-right">
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm hồ sơ (Dịch vụ, chẩn đoán, bác sĩ...)"
                                className="search-input"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

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
                    <div className="breadcrumb-item active">
                        <span>Danh sách hồ sơ bệnh án</span>
                    </div>
                </nav>
            </div>

            {/* Medical Records Table */}
            <div className="medical-records-content">
                <div className="table-container">
                    <table className="medical-records-table">
                        <thead>
                        <tr>
                            <th className="text-center">#</th>
                            <th>Dịch vụ khám</th>
                            <th>Chẩn đoán</th>
                            <th>Bác sĩ khám</th>
                            <th className="sortable">
                                <div className="sort-header">
                                    <span>Ngày khám</span>
                                    <ChevronDown size={16} />
                                </div>
                            </th>
                            <th>Chi tiết</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center loading">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : currentRecords.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center no-data">
                                    Không tìm thấy hồ sơ nào
                                </td>
                            </tr>
                        ) : (
                            currentRecords.map((record, index) => (
                                <tr key={record.id} onClick={() => handleViewDetails(record)}>
                                    <td className="text-center font-medium">{startIndex + index + 1}</td>
                                    <td className="font-medium">{renderServices(record.serviceName)}</td>
                                    <td>{record.diagnosis}</td>
                                    <td>{record.doctor}</td>
                                    <td>{record.date}</td>
                                    <td>
                                        <span className={`status-badge ${record.status}`}>
                                            {record.status === "completed" ? "Hoàn thành" : record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination-container">
                    <div className="pagination-left">
                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pagination-right">
                        <div className="items-per-page">
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="items-select"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            <span className="items-label">/ page</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
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
    );
}