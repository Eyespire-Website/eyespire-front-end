"use client"

import { useState } from "react"
import {
    Calendar,
    CalendarIcon,
    CheckCircle,
    DollarSign,
    Search,
    Stethoscope,
    Briefcase,
    UserCircle,
    Edit,
    Clock,
    X,
} from "lucide-react"

const AppointmentsContent = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState("all")
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [showAppointmentModal, setShowAppointmentModal] = useState(false)

    const appointments = [
        {
            id: 1,
            patient: {
                name: "Nguyễn Văn A",
                phone: "0901234567",
                email: "nguyenvana@gmail.com",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            doctor: "BS. Nguyễn Văn An",
            service: "Khám tổng quát cá Koi",
            date: "2024-01-15",
            time: "09:00",
            duration: 60,
            status: "confirmed",
            notes: "Khách hàng muốn kiểm tra sức khỏe tổng quát cho cá Koi",
            payment: {
                amount: 500000,
                status: "paid",
                method: "Tiền mặt",
            },
        },
        {
            id: 2,
            patient: {
                name: "Trần Thị B",
                phone: "0912345678",
                email: "tranthib@gmail.com",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            doctor: "BS. Nguyễn Văn An",
            service: "Điều trị bệnh cá",
            date: "2024-01-15",
            time: "10:30",
            duration: 90,
            status: "confirmed",
            notes: "Cá có dấu hiệu bệnh đốm trắng",
            payment: {
                amount: 800000,
                status: "paid",
                method: "Chuyển khoản",
            },
        },
        {
            id: 3,
            patient: {
                name: "Lê Văn C",
                phone: "0923456789",
                email: "levanc@gmail.com",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            doctor: "BS. Trần Thị Bình",
            service: "Tư vấn thiết kế hồ",
            date: "2024-01-15",
            time: "14:00",
            duration: 60,
            status: "pending",
            notes: "Khách hàng muốn tư vấn thiết kế hồ cá mới",
            payment: {
                amount: 1200000,
                status: "unpaid",
                method: "Chưa xác định",
            },
        },
        {
            id: 4,
            patient: {
                name: "Phạm Thị D",
                phone: "0934567890",
                email: "phamthid@gmail.com",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            doctor: "BS. Lê Văn Cường",
            service: "Phẫu thuật cá",
            date: "2024-01-16",
            time: "08:00",
            duration: 120,
            status: "confirmed",
            notes: "Phẫu thuật loại bỏ khối u ở cá Koi",
            payment: {
                amount: 2000000,
                status: "paid",
                method: "Chuyển khoản",
            },
        },
        {
            id: 5,
            patient: {
                name: "Hoàng Văn E",
                phone: "0945678901",
                email: "hoangvane@gmail.com",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            doctor: "BS. Trần Thị Bình",
            service: "Khám định kỳ",
            date: "2024-01-16",
            time: "15:30",
            duration: 60,
            status: "completed",
            notes: "Khám định kỳ hàng tháng",
            payment: {
                amount: 300000,
                status: "paid",
                method: "Tiền mặt",
            },
        },
    ]

    const filteredAppointments = appointments.filter((appointment) => {
        const matchesSearch =
            appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patient.phone.includes(searchTerm)

        const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

        const matchesDate = dateFilter === "all" || appointment.date === dateFilter

        return matchesSearch && matchesStatus && matchesDate
    })

    const getStatusText = (status) => {
        switch (status) {
            case "confirmed":
                return "Đã xác nhận"
            case "pending":
                return "Chờ xác nhận"
            case "completed":
                return "Hoàn thành"
            case "cancelled":
                return "Đã hủy"
            default:
                return status
        }
    }

    const getPaymentStatusText = (status) => {
        switch (status) {
            case "paid":
                return "Đã thanh toán"
            case "pending":
                return "Chờ thanh toán"
            case "unpaid":
                return "Chưa thanh toán"
            default:
                return status
        }
    }

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Tổng cuộc hẹn</span>
                        <Calendar size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">156</div>
                    <div className="stat-change positive">+12 từ tuần trước</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Hôm nay</span>
                        <CalendarIcon size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">8</div>
                    <div className="stat-change positive">+2 từ hôm qua</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Đã hoàn thành</span>
                        <CheckCircle size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">142</div>
                    <div className="stat-change positive">91% tỷ lệ hoàn thành</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Doanh thu</span>
                        <DollarSign size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">₫15.2M</div>
                    <div className="stat-change positive">+8% từ tháng trước</div>
                </div>
            </div>

            <div className="card">
                <div className="card-hdr">
                    <div className="card-hdr-content">
                        <h3 className="card-title">Quản lý cuộc hẹn</h3>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={16} className="search-icon" />
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="filter-bar">
                        <div className="filter-group">
                            <label>Trạng thái:</label>
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">Tất cả</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Ngày:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={dateFilter === "all" ? "" : dateFilter}
                                onChange={(e) => setDateFilter(e.target.value || "all")}
                            />
                        </div>
                    </div>

                    <div className="appointments-grid">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appointment) => (
                                <div key={appointment.id} className="appointment-card">
                                    <div className="appointment-header">
                                        <div className="patient-info">
                                            <img
                                                src={appointment.patient.avatar || "/placeholder.svg"}
                                                alt="Avatar"
                                                className="patient-avatar"
                                            />
                                            <div>
                                                <h4 className="patient-name">{appointment.patient.name}</h4>
                                                <p className="patient-contact">{appointment.patient.phone}</p>
                                            </div>
                                        </div>
                                        <span className={`appointment-status ${appointment.status}`}>
                      {getStatusText(appointment.status)}
                    </span>
                                    </div>

                                    <div className="appointment-details">
                                        <div className="detail-row">
                                            <Stethoscope size={16} className="detail-icon" />
                                            <span className="detail-text">{appointment.doctor}</span>
                                        </div>
                                        <div className="detail-row">
                                            <Briefcase size={16} className="detail-icon" />
                                            <span className="detail-text">{appointment.service}</span>
                                        </div>
                                        <div className="detail-row">
                                            <Calendar size={16} className="detail-icon" />
                                            <span className="detail-text">
                        {appointment.date} - {appointment.time} ({appointment.duration} phút)
                      </span>
                                        </div>
                                        <div className="detail-row">
                                            <DollarSign size={16} className="detail-icon" />
                                            <span className="detail-text">
                        ₫{appointment.payment.amount.toLocaleString()} -{" "}
                                                <span className={`payment-status ${appointment.payment.status}`}>
                          {getPaymentStatusText(appointment.payment.status)}
                        </span>
                      </span>
                                        </div>
                                    </div>

                                    {appointment.notes && (
                                        <div className="appointment-notes">
                                            <p>
                                                <strong>Ghi chú:</strong> {appointment.notes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="appointment-actions">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setSelectedAppointment(appointment)
                                                setShowAppointmentModal(true)
                                            }}
                                        >
                                            Chi tiết
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">Không tìm thấy cuộc hẹn nào phù hợp</div>
                        )}
                    </div>

                    <div className="pagination">
                        <button className="btn btn-secondary">Trước</button>
                        <div className="page-numbers">
                            <button className="btn btn-primary">1</button>
                            <button className="btn btn-secondary">2</button>
                            <button className="btn btn-secondary">3</button>
                            <span>...</span>
                            <button className="btn btn-secondary">5</button>
                        </div>
                        <button className="btn btn-secondary">Sau</button>
                    </div>
                </div>
            </div>

            {/* Appointment Details Modal */}
            {showAppointmentModal && selectedAppointment && (
                <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
                    <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết cuộc hẹn #{selectedAppointment.id}</h3>
                            <button className="modal-close" onClick={() => setShowAppointmentModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="appointment-detail-layout">
                                {/* Patient Information */}
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <UserCircle size={18} />
                                        Thông tin khách hàng
                                    </h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Họ tên:</span>
                                            <span className="detail-value">{selectedAppointment.patient.name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Số điện thoại:</span>
                                            <span className="detail-value">{selectedAppointment.patient.phone}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{selectedAppointment.patient.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Information */}
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <Calendar size={18} />
                                        Thông tin cuộc hẹn
                                    </h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Bác sĩ:</span>
                                            <span className="detail-value">{selectedAppointment.doctor}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Dịch vụ:</span>
                                            <span className="detail-value">{selectedAppointment.service}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Ngày hẹn:</span>
                                            <span className="detail-value">{selectedAppointment.date}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Giờ hẹn:</span>
                                            <span className="detail-value">{selectedAppointment.time}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Thời gian:</span>
                                            <span className="detail-value">{selectedAppointment.duration} phút</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Trạng thái:</span>
                                            <span className={`status ${selectedAppointment.status}`}>
                        {getStatusText(selectedAppointment.status)}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <DollarSign size={18} />
                                        Thông tin thanh toán
                                    </h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Số tiền:</span>
                                            <span className="detail-value">₫{selectedAppointment.payment.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Phương thức:</span>
                                            <span className="detail-value">{selectedAppointment.payment.method}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Trạng thái thanh toán:</span>
                                            <span className={`payment-status ${selectedAppointment.payment.status}`}>
                        {getPaymentStatusText(selectedAppointment.payment.status)}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedAppointment.notes && (
                                    <div className="detail-section">
                                        <h4 className="detail-section-title">
                                            <Edit size={18} />
                                            Ghi chú
                                        </h4>
                                        <div className="notes-content">
                                            <p>{selectedAppointment.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Action History */}
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <Clock size={18} />
                                        Lịch sử thao tác
                                    </h4>
                                    <div className="action-history">
                                        <div className="history-item">
                                            <div className="history-time">15/01/2024 - 08:30</div>
                                            <div className="history-action">Cuộc hẹn được tạo</div>
                                            <div className="history-user">Bởi: Lễ tân</div>
                                        </div>
                                        <div className="history-item">
                                            <div className="history-time">15/01/2024 - 08:45</div>
                                            <div className="history-action">Xác nhận cuộc hẹn</div>
                                            <div className="history-user">Bởi: {selectedAppointment.doctor}</div>
                                        </div>
                                        {selectedAppointment.payment.status === "paid" && (
                                            <div className="history-item">
                                                <div className="history-time">15/01/2024 - 09:00</div>
                                                <div className="history-action">Thanh toán hoàn tất</div>
                                                <div className="history-user">Phương thức: {selectedAppointment.payment.method}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAppointmentModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppointmentsContent
