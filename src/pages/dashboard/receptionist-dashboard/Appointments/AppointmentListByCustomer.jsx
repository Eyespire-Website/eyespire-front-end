"use client";

// Cập nhật component để sử dụng CSS classes
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import "../Appointments/AppointmentListByCustomer.css"; // ✅ Import CSS file

// Đây là dữ liệu mẫu. Trong thực tế, bạn nên fetch từ API
const mockData = [
    {
        id: 1,
        customerId: 1,
        service: "Khám mắt tổng quát",
        doctor: "TS. Nguyễn Văn An",
        date: "12/06/2025",
        status: "confirmed",
        reason: "Cảm thấy mờ mắt khi nhìn gần.",
    },
    {
        id: 2,
        customerId: 2,
        service: "Tư vấn phẫu thuật LASIK",
        doctor: "TS. Trần Thị Lan",
        date: "10/06/2025",
        status: "completed",
        reason: "Muốn cải thiện thị lực không cần kính.",
    },
    {
        id: 3,
        customerId: 3,
        service: "Khám mắt định kỳ",
        doctor: "ThS. Lê Minh Hoàng",
        date: "11/06/2025",
        status: "confirmed",
        reason: "Kiểm tra mắt định kỳ.",
    },
];

const statusLabels = {
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
};

export default function AppointmentListByCustomer() {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const filtered = mockData.filter((item) => item.customerId === Number.parseInt(customerId));
        setAppointments(filtered);
    }, [customerId]);

    const handleBack = () => {
        const fromPage = location.state?.fromPage || 1;
        navigate("/dashboard/receptionist/appointments", { state: { page: fromPage } });
    };

    return (
        <div className="appointment-list-by-customer">
            <button onClick={handleBack} className="appointment-list-by-customer__back-button">
                <ArrowLeft className="appointment-list-by-customer__back-icon" />
                Quay lại
            </button>

            <h1 className="appointment-list-by-customer__title">Lịch hẹn của khách hàng #{customerId}</h1>

            {appointments.length === 0 ? (
                <p className="appointment-list-by-customer__no-data">Không có lịch hẹn nào.</p>
            ) : (
                <div className="appointment-list-by-customer__table-container">
                    <table className="appointment-list-by-customer__table">
                        <thead className="appointment-list-by-customer__table-head">
                        <tr>
                            <th>#</th>
                            <th>Dịch vụ</th>
                            <th>Bác sĩ</th>
                            <th>Ngày</th>
                            <th>Trạng thái</th>
                            <th>Lý do</th>
                        </tr>
                        </thead>
                        <tbody>
                        {appointments.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.service}</td>
                                <td>{item.doctor}</td>
                                <td>{item.date}</td>
                                <td>
                                    <span
                                        className={`appointment-list-by-customer__status-badge appointment-list-by-customer__status-badge--${item.status}`}
                                    >
                                        {statusLabels[item.status]}
                                    </span>
                                </td>
                                <td className="appointment-list-by-customer__reason-cell">{item.reason}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
