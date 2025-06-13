import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Thêm dòng này
import "../Appointments/CustomerAppointments.css";

const customers = [
    { id: 1, name: "Đỗ Văn Dũng", gender: "Nam", phone: "0352195878", email: "dungdqse184451@fpt.edu.vn" },
    { id: 2, name: "Đỗ Quang Dũng", gender: "Nam", phone: "0352195876", email: "doquangdung1782004@gmail.com" },
    { id: 3, name: "Nguyễn Thị Lan", gender: "Nữ", phone: "0987654321", email: "nguyenlan@gmail.com" },
    { id: 4, name: "Trần Văn Minh", gender: "Nam", phone: "0123456789", email: "tranminh@yahoo.com" },
];

export default function CustomerAppointments() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const pageFromState = location.state?.fromPage;
        if (pageFromState) {
            setCurrentPage(pageFromState);
        } else {
            setCurrentPage(1); // Nếu không có trạng thái page từ trước, mặc định là trang 1
        }
    }, [location.state?.fromPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery)
    );

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const maxPagesToShow = 5;
    const pageNumbers = Array.from({ length: Math.min(totalPages, maxPagesToShow) }, (_, index) => index + 1);

    const handleViewDetails = (customerId) => {
        navigate(`/dashboard/receptionist/appointments/customer/${customerId}`, {
            state: { fromPage: currentPage } // Lưu trạng thái trang hiện tại khi điều hướng
        });
    };

    const handleBack = () => {
        const fromPage = location.state?.fromPage || 1;  // Nếu không có fromPage thì mặc định là trang 1
        navigate("/dashboard/receptionist/appointments", { state: { page: fromPage } });  // Lưu trạng thái trang hiện tại vào state
    };

    return (
        <div className="customer-appointments">
            <div className="customer-appointments__header">
                <h1 className="customer-appointments__title">Danh sách khách hàng</h1>
                <div className="customer-appointments__search-container">
                    <div className="customer-appointments__search-wrapper">
                        <Search className="customer-appointments__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm khách hàng (Tên, email, số...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="customer-appointments__search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="customer-appointments__table-container">
                <div className="customer-appointments__table-header">
                    <div className="customer-appointments__table-header-content">
                        <Users className="customer-appointments__table-header-icon" />
                        <span className="customer-appointments__table-header-text">Cuộc hẹn khách hàng</span>
                    </div>
                </div>

                <div className="customer-appointments__table-wrapper">
                    <table className="customer-appointments__table">
                        <thead>
                        <tr>
                            <th className="customer-appointments__table-head customer-appointments__table-head--number">#</th>
                            <th className="customer-appointments__table-head">Tên khách hàng</th>
                            <th className="customer-appointments__table-head">Giới tính</th>
                            <th className="customer-appointments__table-head">Số điện thoại</th>
                            <th className="customer-appointments__table-head">Email</th>
                            <th className="customer-appointments__table-head">Chi tiết</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-results-message">Không có khách hàng nào tìm thấy</td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((customer) => (
                                <tr key={customer.id} className="customer-appointments__table-row">
                                    <td className="customer-appointments__table-cell">{customer.id}</td>
                                    <td className="customer-appointments__table-cell">{customer.name}</td>
                                    <td className="customer-appointments__table-cell">
                                        <span className="customer-appointments__gender-badge">{customer.gender}</span>
                                    </td>
                                    <td className="customer-appointments__table-cell">{customer.phone}</td>
                                    <td className="customer-appointments__table-cell">{customer.email}</td>
                                    <td className="customer-appointments__table-cell">
                                        <button
                                            className="customer-appointments__detail-button"
                                            onClick={() => handleViewDetails(customer.id)}
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

                <div className="customer-appointments__pagination">
                    <div className="customer-appointments__pagination-info">
                        {filteredCustomers.length} / {filteredCustomers.length} khách hàng
                    </div>
                    <div className="customer-appointments__pagination-controls">
                        {pageNumbers.map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`customer-appointments__pagination-button ${
                                    currentPage === pageNum ? "customer-appointments__pagination-button--active" : ""
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} // dang_ok
