"use client"

import { useState, useEffect } from "react"
import { Search, Users } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import userService from "../../../../../services/userService"
import "./CustomerAppointments.css"

export default function CustomerAppointments() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8
    const navigate = useNavigate()
    const location = useLocation()

    // Fetch patients data
    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const patients = await userService.getAllPatients()
            setCustomers(patients || [])
        } catch (err) {
            setError("Không thể tải danh sách khách hàng")
            console.error("Error fetching patients:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    useEffect(() => {
        const pageFromState = location.state?.fromPage
        if (pageFromState) {
            setCurrentPage(pageFromState)
        } else {
            setCurrentPage(1)
        }
    }, [location.state?.fromPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const formatGender = (gender) => {
        if (!gender) return "Chưa cập nhật"
        switch (gender.toString().toUpperCase()) {
            case "MALE":
                return "Nam"
            case "FEMALE":
                return "Nữ"
            case "OTHER":
                return "Khác"
            default:
                return "Chưa cập nhật"
        }
    }

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone?.includes(searchQuery) ||
            customer.username?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Tính toán số trang hiển thị
    const getVisiblePageNumbers = () => {
        const maxPagesToShow = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        const pages = []
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }

    const handleViewDetails = (customerId) => {
        navigate(`/dashboard/admin/appointments/customer/${customerId}`, {
            state: { fromPage: currentPage },
        })
    }

    const handleBack = () => {
        const fromPage = location.state?.fromPage || 1
        navigate("/dashboard/admin/appointments", { state: { page: fromPage } })
    }

    if (loading) {
        return (
            <div className="customer-appointments">
                <div className="customer-appointments__loading">
                    <div className="customer-appointments__spinner"></div>
                    <p>Đang tải danh sách khách hàng...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="customer-appointments">
                <div className="customer-appointments__error">
                    <p>{error}</p>
                    <button onClick={fetchCustomers} className="customer-appointments__retry-button">
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="customer-appointments">
            <div className="customer-appointments__header">
                <h1 className="customer-appointments__title">Danh sách khách hàng</h1>
                <div className="customer-appointments__search-container">
                    <div className="customer-appointments__search-wrapper">
                        <Search className="customer-appointments__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm khách hàng (Tên, email, số điện thoại, username...)"
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
                        <span className="customer-appointments__table-header-text">
              Cuộc hẹn khách hàng ({filteredCustomers.length} khách hàng)
            </span>
                    </div>
                </div>

                <div className="customer-appointments__table-wrapper">
                    <table className="customer-appointments__table">
                        <thead>
                        <tr>
                            <th className="customer-appointments__table-head customer-appointments__table-head--number">#</th>
                            <th className="customer-appointments__table-head">Tên khách hàng</th>
                            <th className="customer-appointments__table-head">Username</th>
                            <th className="customer-appointments__table-head">Giới tính</th>
                            <th className="customer-appointments__table-head">Số điện thoại</th>
                            <th className="customer-appointments__table-head">Email</th>
                            <th className="customer-appointments__table-head">Chi tiết</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-results-message">
                                    {searchQuery ? "Không tìm thấy khách hàng nào phù hợp" : "Chưa có khách hàng nào"}
                                </td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((customer, index) => (
                                <tr key={customer.id} className="customer-appointments__table-row">
                                    <td className="customer-appointments__table-cell">
                                        {/* SỬA: Tính số thứ tự theo trang */}
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="customer-appointments__table-cell">{customer.name || "Chưa cập nhật"}</td>
                                    <td className="customer-appointments__table-cell">
                                        <span className="customer-appointments__username">@{customer.username || "Chưa cập nhật"}</span>
                                    </td>
                                    <td className="customer-appointments__table-cell">
                                        <span className="customer-appointments__gender-badge">{formatGender(customer.gender)}</span>
                                    </td>
                                    <td className="customer-appointments__table-cell">{customer.phone || "Chưa cập nhật"}</td>
                                    <td className="customer-appointments__table-cell">{customer.email || "Chưa cập nhật"}</td>
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

                {totalPages > 1 && (
                    <div className="customer-appointments__pagination">
                        <div className="customer-appointments__pagination-info">
                            Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCustomers.length)} -{" "}
                            {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} trong tổng số {filteredCustomers.length}{" "}
                            khách hàng
                        </div>
                        <div className="customer-appointments__pagination-controls">
                            {/* Nút Trước */}
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="customer-appointments__pagination-button"
                            >
                                Trước
                            </button>

                            {/* Các số trang */}
                            {getVisiblePageNumbers().map((pageNum) => (
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

                            {/* Nút Sau */}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="customer-appointments__pagination-button"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
