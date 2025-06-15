import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import authService from "../../../../services/authService";
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

    const [medicalRecords, setMedicalRecords] = useState([
        {
            id: 1,
            storageId: "EYE2024001",
            service: "Khám mắt tổng quát",
            doctor: "BS. Nguyễn Thị Mai",
            date: "14/11/2024",
            status: "completed",
        },
        {
            id: 2,
            storageId: "EYE2024002",
            service: "Đo độ cận thị",
            doctor: "BS. Trần Văn Nam",
            date: "13/11/2024",
            status: "completed",
        },
        {
            id: 3,
            storageId: "EYE2024003",
            service: "Điều trị khô mắt",
            doctor: "BS. Lê Thị Hoa",
            date: "10/11/2024",
            status: "completed",
        },
        {
            id: 4,
            storageId: "EYE2024004",
            service: "Kiểm tra đáy mắt",
            doctor: "BS. Phạm Minh Tuấn",
            date: "08/11/2024",
            status: "completed",
        },
        {
            id: 5,
            storageId: "EYE2024005",
            service: "Phẫu thuật cận thị LASIK",
            doctor: "BS. Hoàng Văn Đức",
            date: "05/11/2024",
            status: "completed",
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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
            avatar: currentUser.avatarUrl || null
        });
    }, [navigate]);

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
        record.storageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Phân trang
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    // FIX: Sử dụng storageId thay vì id để navigate
    const handleViewDetails = (recordId) => {
        console.log('Navigating to record:', recordId);
        navigate(`/patient/medical-records/${recordId}`);
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

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />

            <PatientSidebar activeItem="medical" />

            {/* Main Content */}
            <div className="main-content">
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
                                    placeholder="Tìm hồ sơ (Mã hồ sơ, dịch vụ, bác sĩ...)"
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
                                <th>Mã lưu trữ</th>
                                <th>Dịch vụ khám</th>
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
                                currentRecords.map((record) => (
                                    <tr key={record.id} className="table-row">
                                        <td className="text-center font-medium">{record.id}</td>
                                        <td className="storage-id">{record.storageId}</td>
                                        <td className="font-medium">{record.service}</td>
                                        <td>{record.doctor}</td>
                                        <td>{record.date}</td>
                                        <td>
                                            {/* FIX: Sử dụng storageId thay vì id */}
                                            <button
                                                className="view-details-btn"
                                                onClick={() => handleViewDetails(record.storageId)}
                                            >
                                                Xem chi tiết
                                            </button>
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
}