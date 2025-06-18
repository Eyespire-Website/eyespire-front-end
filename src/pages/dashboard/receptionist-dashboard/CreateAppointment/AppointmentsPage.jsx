"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import "./AppointmentsPage.css";
import { getAllAppointments } from "../../../../services/appointmentsService";

const statusConfig = {
    PENDING: { label: "Chờ xác nhận", className: "apt-list-apt-01-status-pending" },
    CONFIRMED: { label: "Đã xác nhận", className: "apt-list-apt-01-status-confirmed" },
    CANCELED: { label: "Đã hủy", className: "apt-list-apt-01-status-cancelled" },
    COMPLETED: { label: "Hoàn thành", className: "apt-list-apt-01-status-completed" },
    UNKNOWN: { label: "Không xác định", className: "apt-list-apt-01-status-unknown" }
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await getAllAppointments();
                setAppointments(data);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
                // TODO: Hiển thị thông báo lỗi cho người dùng (ví dụ: toast)
            }
        };
        fetchAppointments();
    }, []);

    const handleViewAppointment = (appointment) => {
        navigate("/dashboard/receptionist/create-appointment", {
            state: {
                appointmentData: appointment,
                mode: "edit",
            },
        });
    };

    // Phân trang
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const paginatedAppointments = appointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="apt-list-apt-01-container">
            <div className="apt-list-apt-01-wrapper">
                <div className="apt-list-apt-01-table-container">
                    <div className="apt-list-apt-01-table-header">
                        <h2 className="apt-list-apt-01-table-title">Danh sách tất cả cuộc hẹn</h2>
                    </div>
                    <div className="apt-list-apt-01-table-wrapper">
                        <table className="apt-list-apt-01-table">
                            <thead className="apt-list-apt-01-table-head">
                            <tr className="apt-list-apt-01-table-head-row">
                                <th className="apt-list-apt-01-table-head-cell number">#</th>
                                <th className="apt-list-apt-01-table-head-cell">Bệnh nhân</th>
                                <th className="apt-list-apt-01-table-head-cell">Ngày hẹn</th>
                                <th className="apt-list-apt-01-table-head-cell">Giờ hẹn</th>
                                <th className="apt-list-apt-01-table-head-cell">Trạng thái</th>
                                <th className="apt-list-apt-01-table-head-cell">Lý do khám</th>
                                <th className="apt-list-apt-01-table-head-cell center">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedAppointments.map((appointment) => {
                                const status = statusConfig[appointment.status] || statusConfig.UNKNOWN;
                                return (
                                    <tr key={appointment.id} className="apt-list-apt-01-table-body-row">
                                        <td className="apt-list-apt-01-table-body-cell number">{appointment.id}</td>
                                        <td className="apt-list-apt-01-table-body-cell">
                                            <div className="apt-list-apt-01-icon-text">
                                                <User className="h-4 w-4" />
                                                {appointment.patientName || 'Không xác định'}
                                            </div>
                                        </td>
                                        <td className="apt-list-apt-01-table-body-cell">
                                            <div className="apt-list-apt-01-icon-text">
                                                <Calendar className="h-4 w-4" />
                                                {appointment.appointmentDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="apt-list-apt-01-table-body-cell">
                                            <div className="apt-list-apt-01-icon-text">
                                                <Clock className="h-4 w-4" />
                                                {appointment.timeSlot || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="apt-list-apt-01-table-body-cell">
                                                <span className={`apt-list-apt-01-status-badge ${status.className}`}>
                                                    {status.label}
                                                </span>
                                        </td>
                                        <td className="apt-list-apt-01-table-body-cell">
                                            <p className="apt-list-apt-01-reason-text">{appointment.notes || 'Không có ghi chú'}</p>
                                        </td>
                                        <td className="apt-list-apt-01-table-body-cell center">
                                            <div className="apt-list-apt-01-action-buttons">
                                                <button
                                                    className="apt-list-apt-01-btn apt-list-apt-01-btn-outline apt-list-apt-01-btn-sm"
                                                    onClick={() => handleViewAppointment(appointment)}
                                                >
                                                    Xem
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className="apt-list-apt-01-pagination">
                        <div className="apt-list-apt-01-pagination-controls">
                            <button
                                className="apt-list-apt-01-pagination-button"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="apt-list-apt-01-pagination-current">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                className="apt-list-apt-01-pagination-button"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="apt-list-apt-01-pagination-info">
                            Hiển thị {paginatedAppointments.length} / {appointments.length} cuộc hẹn
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}