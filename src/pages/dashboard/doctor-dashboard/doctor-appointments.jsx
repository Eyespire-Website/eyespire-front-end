"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./doctor-appointments.css"
import {
    Search,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    AlertTriangle,
    Calendar,
    Clock,
    User,
    Phone,
    FileText,
    MapPin,
} from "lucide-react"

export default function DoctorAppointments() {
    const [activeTab, setActiveTab] = useState("appointments")
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [appointments, setAppointments] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc",
    })
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmingAppointment, setConfirmingAppointment] = useState(null)

    // Fetch appointments on component mount
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true)
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Sample data
                const sampleAppointments = [
                    {
                        id: 1,
                        customerName: "Đỗ Văn Dũng",
                        phone: "0352195878",
                        gender: "Nam",
                        serviceName: "Xét nghiệm ký sinh trùng",
                        date: "23/11/2024",
                        time: "8:00",
                        type: "Tại phòng khám",
                        reason: "Cá bị mọt, cần kiểm tra ký sinh trùng",
                        status: "confirmed",
                        isCompleted: false,
                    },
                    {
                        id: 2,
                        customerName: "Nguyễn Thị Hoa",
                        phone: "0987654321",
                        gender: "Nữ",
                        serviceName: "Khám tổng quát",
                        date: "24/11/2024",
                        time: "9:30",
                        type: "Tại nhà",
                        reason: "Cá Koi có dấu hiệu bệnh, cần khám tổng quát",
                        status: "pending",
                        isCompleted: false,
                    },
                    {
                        id: 3,
                        customerName: "Trần Văn Minh",
                        phone: "0123456789",
                        gender: "Nam",
                        serviceName: "Điều trị bệnh da",
                        date: "25/11/2024",
                        time: "14:00",
                        type: "Tại phòng khám",
                        reason: "Cá có vết loét trên da, cần điều trị",
                        status: "confirmed",
                        isCompleted: false,
                    },
                    {
                        id: 4,
                        customerName: "Lê Thị Lan",
                        phone: "0369852147",
                        gender: "Nữ",
                        serviceName: "Tư vấn dinh dưỡng",
                        date: "26/11/2024",
                        time: "10:15",
                        type: "Online",
                        reason: "Tư vấn chế độ dinh dưỡng cho cá Koi",
                        status: "pending",
                        isCompleted: false,
                    },
                    {
                        id: 5,
                        customerName: "Phạm Văn Tuấn",
                        phone: "0741852963",
                        gender: "Nam",
                        serviceName: "Điều trị bệnh mang",
                        date: "27/11/2024",
                        time: "16:30",
                        type: "Tại nhà",
                        reason: "Cá khó thở, nghi ngờ bệnh mang",
                        status: "confirmed",
                        isCompleted: false,
                    },
                    {
                        id: 6,
                        customerName: "Hoàng Thị Mai",
                        phone: "0258147369",
                        gender: "Nữ",
                        serviceName: "Tư vấn môi trường nước",
                        date: "28/11/2024",
                        time: "11:00",
                        type: "Tại phòng khám",
                        reason: "Nước hồ có vấn đề, cần tư vấn cải thiện",
                        status: "pending",
                        isCompleted: false,
                    },
                ]

                setAppointments(sampleAppointments)
            } catch (error) {
                console.error("Error fetching appointments:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    const handleBackHome = () => {
        navigate("/")
    }

    const handleMenuClick = (itemId) => {
        setActiveTab(itemId)
        navigate(`/dashboard/doctor/${itemId}`)
    }

    // Search and filter function
    const getFilteredAndSortedAppointments = () => {
        let filteredAppointments = [...appointments]

        // Apply search
        if (searchTerm) {
            filteredAppointments = filteredAppointments.filter(
                (appointment) =>
                    appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    appointment.phone.includes(searchTerm) ||
                    appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Apply filter by status
        if (filterStatus) {
            filteredAppointments = filteredAppointments.filter((appointment) => appointment.status === filterStatus)
        }

        // Apply sort
        if (sortConfig.key) {
            filteredAppointments.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1
                }
                return 0
            })
        }

        return filteredAppointments
    }

    // Sort function
    const requestSort = (key) => {
        let direction = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }
        setSortConfig({ key, direction })
    }

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentAppointments = getFilteredAndSortedAppointments().slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(getFilteredAndSortedAppointments().length / itemsPerPage)

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    // Handle view details
    const handleViewDetails = (appointment) => {
        setSelectedAppointment(appointment)
        setShowDetailModal(true)
    }

    // Handle confirm completion
    const handleConfirmCompletion = (appointment) => {
        setConfirmingAppointment(appointment)
        setShowConfirmModal(true)
    }

    // Confirm appointment completion
    const confirmCompletion = () => {
        if (confirmingAppointment) {
            setAppointments((prev) =>
                prev.map((apt) =>
                    apt.id === confirmingAppointment.id ? { ...apt, isCompleted: true, status: "completed" } : apt,
                ),
            )
            setShowConfirmModal(false)
            setConfirmingAppointment(null)
        }
    }

    // Toggle appointment confirmation
    const toggleConfirmation = (appointmentId) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === appointmentId
                    ? {
                        ...apt,
                        status: apt.status === "confirmed" ? "pending" : "confirmed",
                    }
                    : apt,
            ),
        )
    }

    const menuItems = [
        { id: "schedule", label: "Lịch làm việc", icon: "📅" },
        { id: "appointments", label: "Xem cuộc hẹn", icon: "🕐" },
        { id: "customers", label: "Hồ sơ bệnh nhân", icon: "👥" },
        { id: "records", label: "Tạo hồ sơ bệnh án", icon: "📋" },
        { id: "feedback", label: "Phản hồi khách hàng", icon: "💬" },
        { id: "profile", label: "Hồ sơ cá nhân", icon: "👤" },
    ]

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "confirmed":
                return <span className="status-badge confirmed">Đã xác nhận</span>
            case "pending":
                return <span className="status-badge pending">Chờ xác nhận</span>
            case "completed":
                return <span className="status-badge completed">Hoàn thành</span>
            default:
                return <span className="status-badge pending">Chờ xác nhận</span>
        }
    }

    // Get type badge
    const getTypeBadge = (type) => {
        const typeClasses = {
            "Tại phòng khám": "type-clinic",
            "Tại nhà": "type-home",
            Online: "type-online",
        }

        return <span className={`type-badge ${typeClasses[type] || ""}`}>{type}</span>
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="logo" onClick={handleBackHome}>
                        <img
                            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
                            className="logo-image"
                            alt="EyeSpire Logo"
                        />
                        <span className="logo-text">EyeSpire</span>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id} className={`menu-item ${activeTab === item.id ? "active" : ""}`}>
                                <button onClick={() => handleMenuClick(item.id)} className="menu-button">
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-text">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <button className="logout-button">
                        <span className="logout-icon">←</span>
                        <span>Đăng xuất</span>
                    </button>
                    <div className="copyright">© 2025 EyeSpire</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header className="content-header">
                    <h1>Danh sách cuộc hẹn</h1>
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm cuộc hẹn (Tên khách hàng, SĐT, dịch vụ...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </header>

                <div className="appointments-container">
                    {/* Filters */}
                    <div className="appointments-filters">
                        <div className="filter-group">
                            <label>Trạng thái:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                                <option value="">Tất cả</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="completed">Hoàn thành</option>
                            </select>
                        </div>
                    </div>
                    <div className="appointments-table-container">
                        <table className="appointments-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Tên dịch vụ</th>
                                <th
                                    className={`sortable ${sortConfig.key === "date" ? "sorted" : ""}`}
                                    onClick={() => requestSort("date")}
                                >
                                    Ngày hẹn
                                    {sortConfig.key === "date" && (
                                        <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                                    )}
                                </th>
                                <th>Giờ khám</th>
                                <th>Trạng thái</th>
                                <th>Xem chi tiết</th>
                                <th>Xác nhận</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="loading-cell">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : currentAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="empty-cell">
                                        Không có cuộc hẹn nào
                                    </td>
                                </tr>
                            ) : (
                                currentAppointments.map((appointment, index) => (
                                    <tr key={appointment.id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{appointment.customerName}</td>
                                        <td>{appointment.phone}</td>
                                        <td>{appointment.serviceName}</td>
                                        <td>{appointment.date}</td>
                                        <td>{appointment.time}</td>
                                        <td>{getStatusBadge(appointment.status)}</td>
                                        <td>
                                            <button className="detail-btn" onClick={() => handleViewDetails(appointment)}>
                                                <Eye size={16} />
                                                Xem chi tiết
                                            </button>
                                        </td>
                                        <td>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={appointment.isCompleted}
                                                    onChange={() => handleConfirmCompletion(appointment)}
                                                    disabled={appointment.status !== "confirmed"}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="appointments-pagination">
                        <button className="pagination-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                            <ChevronLeft size={16} />
                        </button>

                        <div className="pagination-pages">
                            <button className={`pagination-number ${currentPage === 1 ? "active" : ""}`} onClick={() => paginate(1)}>
                                1
                            </button>

                            {currentPage > 3 && <span className="pagination-ellipsis">...</span>}

                            {Array.from({ length: 3 }, (_, i) => {
                                const pageNum = currentPage - 1 + i
                                if (pageNum > 1 && pageNum < totalPages) {
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-number ${pageNum === currentPage ? "active" : ""}`}
                                            onClick={() => paginate(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                }
                                return null
                            })}

                            {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}

                            {totalPages > 1 && (
                                <button
                                    className={`pagination-number ${currentPage === totalPages ? "active" : ""}`}
                                    onClick={() => paginate(totalPages)}
                                >
                                    {totalPages}
                                </button>
                            )}
                        </div>

                        <button
                            className="pagination-btn"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={16} />
                        </button>

                        <div className="items-per-page">
                            <span>{itemsPerPage} / page</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-container detail-modal">
                        <div className="modal-header">
                            <h3>Chi tiết cuộc hẹn</h3>
                            <button className="close-modal" onClick={() => setShowDetailModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <User size={16} />
                                    <div>
                                        <label>Tên khách hàng:</label>
                                        <span>{selectedAppointment.customerName}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <User size={16} />
                                    <div>
                                        <label>Giới tính:</label>
                                        <span className="gender-badge">{selectedAppointment.gender}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <Phone size={16} />
                                    <div>
                                        <label>Số điện thoại:</label>
                                        <span>{selectedAppointment.phone}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FileText size={16} />
                                    <div>
                                        <label>Tên dịch vụ:</label>
                                        <span>{selectedAppointment.serviceName}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <MapPin size={16} />
                                    <div>
                                        <label>Hình thức khám:</label>
                                        {getTypeBadge(selectedAppointment.type)}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <Calendar size={16} />
                                    <div>
                                        <label>Ngày hẹn:</label>
                                        <span>{selectedAppointment.date}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <Clock size={16} />
                                    <div>
                                        <label>Giờ hẹn:</label>
                                        <span>{selectedAppointment.time}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <Calendar size={16} />
                                    <div>
                                        <label>Trạng thái:</label>
                                        {getStatusBadge(selectedAppointment.status)}
                                    </div>
                                </div>
                            </div>

                            <div className="reason-section">
                                <label>Lý do khám:</label>
                                <div className="reason-content">{selectedAppointment.reason}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Completion Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-container confirm-modal">
                        <div className="modal-header">
                            <AlertTriangle size={24} className="warning-icon" />
                            <h3>Xác nhận hoàn thành dịch vụ</h3>
                        </div>
                        <div className="modal-body">
                            <p>Hãy đảm bảo khách hàng đã hoàn thành dịch vụ</p>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowConfirmModal(false)}>
                                Hủy
                            </button>
                            <button className="confirm-button" onClick={confirmCompletion}>
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
