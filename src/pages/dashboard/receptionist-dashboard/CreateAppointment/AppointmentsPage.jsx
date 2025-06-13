"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, User, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import "../CreateAppointment/AppointmentsPage.css"

// Mock data cho appointments - trong thực tế sẽ lấy từ API
const appointments = [
    {
        id: 1,
        service: "Tư vấn & Điều trị",
        doctor: "BS. Nguyễn Thị Hương",
        date: "25/12/2024",
        status: "pending",
        reason: "Mắt bị mờ và khó nhìn xa, cần được bác sĩ kiểm tra",
    },
    {
        id: 2,
        service: "Khám tổng quát mắt",
        doctor: "BS. Trần Văn Minh",
        date: "24/12/2024",
        status: "pending",
        reason: "Khám định kỳ hàng năm",
    },
    {
        id: 3,
        service: "Điều trị cận thị",
        doctor: "BS. Lê Thị Mai",
        date: "23/12/2024",
        status: "confirmed",
        reason: "Cận thị tăng nhanh, cần tư vấn phương pháp điều trị",
    },
    {
        id: 4,
        service: "Phẫu thuật Lasik",
        doctor: "BS. Phạm Đức Anh",
        date: "22/12/2024",
        status: "pendingAttachment",
        reason: "Muốn phẫu thuật để không phải đeo kính",
    },
    {
        id: 5,
        service: "Khám võng mạc",
        doctor: "BS. Nguyễn Thị Hương",
        date: "21/12/2024",
        status: "cancelled",
        reason: "Có triệu chứng nhìn thấy đốm đen",
    },
    {
        id: 6,
        service: "Tư vấn & Điều trị",
        doctor: "BS. Hoàng Văn Tùng",
        date: "20/12/2024",
        status: "pendingAttachment",
        reason: "Mắt khô và hay chảy nước mắt",
    },
    {
        id: 7,
        service: "Khám glaucoma",
        doctor: "BS. Trần Văn Minh",
        date: "19/12/2024",
        status: "completed",
        reason: "Có tiền sử gia đình bị tăng nhãn áp",
    },
]

// Cấu hình hiển thị cho các trạng thái
const statusConfig = {
    pending: { label: "Pending", className: "apt-list-apt-01-status-pending" },
    confirmed: { label: "Confirmed", className: "apt-list-apt-01-status-confirmed" },
    cancelled: { label: "Cancelled", className: "apt-list-apt-01-status-cancelled" },
    completed: { label: "Completed", className: "apt-list-apt-01-status-completed" },
}

export default function AppointmentsPage() {
    // State management
    const [currentPage, setCurrentPage] = useState(1)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [appointmentToCancel, setAppointmentToCancel] = useState(null)

    const navigate = useNavigate()
    const itemsPerPage = 10

    // Lọc chỉ hiển thị các cuộc hẹn có trạng thái pendingAttachment
    const filteredAppointments = appointments.filter((appointment) => appointment.status === "pending")

    // Xử lý xem chi tiết cuộc hẹn - điều hướng đến trang chỉnh sửa
    const handleViewAppointment = (appointment) => {
        // Điều hướng đến trang CreateAppointment với mode edit
        // Truyền dữ liệu appointment qua state
        navigate("/dashboard/receptionist/create-appointment", {
            state: {
                appointmentData: appointment,
                mode: "edit",
            },
        })
    }

    // Xử lý hủy cuộc hẹn
    const handleCancelAppointment = (appointmentId) => {
        console.log("Cancelling appointment:", appointmentId)
        // TODO: Gọi API để hủy cuộc hẹn
        // Cập nhật state hoặc reload dữ liệu
        setShowCancelDialog(false)
        setAppointmentToCancel(null)
    }

    // Mở dialog xác nhận hủy
    const openCancelDialog = (appointment) => {
        setAppointmentToCancel(appointment)
        setShowCancelDialog(true)
    }

    // Đóng dialog hủy
    const closeCancelDialog = () => {
        setShowCancelDialog(false)
        setAppointmentToCancel(null)
    }

    return (
        <div className="apt-list-apt-01-container">
            <div className="apt-list-apt-01-wrapper">
                {/* Header Section - Tiêu đề trang */}

                {/* Appointments Table - Bảng danh sách cuộc hẹn */}
                <div className="apt-list-apt-01-table-container">
                    {/* Table Header - Tiêu đề bảng */}
                    <div className="apt-list-apt-01-table-header">
                        <h2 className="apt-list-apt-01-table-title">Danh sách cuộc hẹn chờ xác nhận</h2>
                    </div>

                    {/* Table Content - Nội dung bảng */}
                    <div className="apt-list-apt-01-table-wrapper">
                        <table className="apt-list-apt-01-table">
                            {/* Table Head - Tiêu đề cột */}
                            <thead className="apt-list-apt-01-table-head">
                            <tr className="apt-list-apt-01-table-head-row">
                                <th className="apt-list-apt-01-table-head-cell number">#</th>
                                <th className="apt-list-apt-01-table-head-cell">Dịch vụ</th>
                                <th className="apt-list-apt-01-table-head-cell">Bác sĩ</th>
                                <th className="apt-list-apt-01-table-head-cell">
                                    <div className="apt-list-apt-01-icon-text">
                                        <Calendar className="h-4 w-4" />
                                        Ngày hẹn
                                    </div>
                                </th>
                                <th className="apt-list-apt-01-table-head-cell">Trạng thái</th>
                                <th className="apt-list-apt-01-table-head-cell">Lý do khám</th>
                                <th className="apt-list-apt-01-table-head-cell center">Thao tác</th>
                            </tr>
                            </thead>

                            {/* Table Body - Dữ liệu bảng */}
                            <tbody>
                            {filteredAppointments.map((appointment) => (
                                <tr key={appointment.id} className="apt-list-apt-01-table-body-row">
                                    {/* ID cuộc hẹn */}
                                    <td className="apt-list-apt-01-table-body-cell number">{appointment.id}</td>

                                    {/* Tên dịch vụ */}
                                    <td className="apt-list-apt-01-table-body-cell">
                                        <span style={{ fontWeight: 500 }}>{appointment.service}</span>
                                    </td>

                                    {/* Tên bác sĩ */}
                                    <td className="apt-list-apt-01-table-body-cell">
                                        <div className="apt-list-apt-01-icon-text">
                                            <User className="h-4 w-4" />
                                            {appointment.doctor}
                                        </div>
                                    </td>

                                    {/* Ngày hẹn */}
                                    <td className="apt-list-apt-01-table-body-cell">
                                        <div className="apt-list-apt-01-icon-text">
                                            <Clock className="h-4 w-4" />
                                            {appointment.date}
                                        </div>
                                    </td>

                                    {/* Trạng thái */}
                                    <td className="apt-list-apt-01-table-body-cell">
                      <span className={`apt-list-apt-01-status-badge ${statusConfig[appointment.status].className}`}>
                        {statusConfig[appointment.status].label}
                      </span>
                                    </td>

                                    {/* Lý do khám */}
                                    <td className="apt-list-apt-01-table-body-cell">
                                        <p className="apt-list-apt-01-reason-text">{appointment.reason}</p>
                                    </td>

                                    {/* Các nút thao tác */}
                                    <td className="apt-list-apt-01-table-body-cell center">
                                        <div className="apt-list-apt-01-action-buttons">
                                            {/* Nút Xem - điều hướng đến trang chỉnh sửa */}
                                            <button
                                                className="apt-list-apt-01-btn apt-list-apt-01-btn-outline apt-list-apt-01-btn-sm"
                                                onClick={() => handleViewAppointment(appointment)}
                                            >
                                                Xem
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Phân trang */}
                    <div className="apt-list-apt-01-pagination">
                        <div className="apt-list-apt-01-pagination-controls">
                            {/* Nút Previous */}
                            <button
                                className="apt-list-apt-01-pagination-button"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Hiển thị trang hiện tại */}
                            <span className="apt-list-apt-01-pagination-current">{currentPage}</span>

                            {/* Nút Next */}
                            <button className="apt-list-apt-01-pagination-button" onClick={() => setCurrentPage(currentPage + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Thông tin số item per page */}
                        <div className="apt-list-apt-01-pagination-info">{itemsPerPage} / trang</div>
                    </div>
                </div>

                {/* Cancel Confirmation Dialog - Dialog xác nhận hủy */}
                {showCancelDialog && appointmentToCancel && (
                    <div className="apt-list-apt-01-dialog-overlay" onClick={closeCancelDialog}>
                        <div className="apt-list-apt-01-dialog-content" onClick={(e) => e.stopPropagation()}>
                            <div className="apt-list-apt-01-dialog-header">
                                <h3>Xác nhận hủy cuộc hẹn</h3>
                            </div>
                            <div className="apt-list-apt-01-dialog-body">
                                <p>
                                    Bạn có chắc chắn muốn hủy cuộc hẹn #{appointmentToCancel.id} vào ngày {appointmentToCancel.date}? Hành
                                    động này không thể hoàn tác.
                                </p>
                            </div>
                            <div className="apt-list-apt-01-dialog-footer">
                                <button className="apt-list-apt-01-btn apt-list-apt-01-btn-outline" onClick={closeCancelDialog}>
                                    Không
                                </button>
                                <button
                                    className="apt-list-apt-01-btn apt-list-apt-01-btn-destructive"
                                    onClick={() => handleCancelAppointment(appointmentToCancel.id)}
                                >
                                    Xác nhận hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
