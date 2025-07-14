"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./doctor-feedback.css"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star } from "lucide-react"
import serviceFeedbackService from "../../../services/serviceFeedbackService"
import authService from "../../../services/authService"
import { toast } from "react-toastify"

export default function DoctorFeedback() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [feedbacks, setFeedbacks] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc",
    })
    const [filterRating, setFilterRating] = useState(null)

    // Fetch feedbacks on component mount
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setLoading(true)
                
                // Lấy thông tin user hiện tại
                const currentUser = authService.getCurrentUser();
                if (!currentUser || !currentUser.id) {
                    toast.error("Không tìm thấy thông tin người dùng");
                    return;
                }
                
                // Lấy thông tin bác sĩ từ user ID
                const doctorId = currentUser.id;
                console.log("Fetching feedbacks for doctor ID:", doctorId);
                
                // Gọi API lấy danh sách feedback cho bác sĩ
                const response = await serviceFeedbackService.getAllFeedbacks();
                console.log("Feedbacks response:", response);
                
                // Lọc và format dữ liệu feedback
                const formattedFeedbacks = response
                    .filter(feedback => {
                        // Kiểm tra nếu feedback.appointment và feedback.appointment.doctor tồn tại
                        if (feedback.appointment && feedback.appointment.doctor) {
                            // Lấy userId của bác sĩ từ appointment (doctor.userId)
                            const feedbackDoctorUserId = feedback.appointment.doctor.userId;
                            console.log("Feedback doctor userId:", feedbackDoctorUserId, "Current user ID:", doctorId);
                            return feedbackDoctorUserId == doctorId;
                        }
                        return false;
                    })
                    .map(feedback => {
                        // Lấy tên bệnh nhân từ patientName trong appointment (từ form đặt lịch) thay vì name từ user profile
                        const patientName = feedback.appointment?.patientName || 
                                          feedback.patient?.name || 
                                          "Khách hàng";
                        
                        // Lấy tên dịch vụ từ appointment.services nếu có
                        let serviceName = "Dịch vụ";
                        if (feedback.appointment && feedback.appointment.services && feedback.appointment.services.length > 0) {
                            serviceName = feedback.appointment.services.map(s => s.name).join(", ");
                        }
                        
                        return {
                            id: feedback.id,
                            customerName: patientName,
                            serviceName: serviceName,
                            date: serviceFeedbackService.formatFeedbackDate(feedback.createdAt),
                            rating: feedback.rating,
                            comment: feedback.comment || ""
                        };
                    });
                
                console.log("Formatted feedbacks:", formattedFeedbacks);
                console.log("Original response structure:", JSON.stringify(response[0], null, 2));
                setFeedbacks(formattedFeedbacks);
            } catch (error) {
                console.error("Error fetching feedbacks:", error);
                toast.error("Không thể tải dữ liệu phản hồi: " + error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [])

    const handleBackHome = () => {
        navigate("/")
    }

    // Sort function
    const requestSort = (key) => {
        let direction = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }
        setSortConfig({ key, direction })
    }

    // Filter by rating
    const handleFilterRating = (rating) => {
        // Nếu đã chọn rating này rồi, bỏ chọn
        if (filterRating === rating) {
            setFilterRating(null)
        } else {
            setFilterRating(rating)
        }
        // Reset về trang 1 khi thay đổi bộ lọc
        setCurrentPage(1)
    }

    // Get sorted and filtered feedbacks
    const getSortedAndFilteredFeedbacks = () => {
        let sortableFeedbacks = [...feedbacks]

        // Apply filter
        if (filterRating !== null) {
            sortableFeedbacks = sortableFeedbacks.filter((feedback) => feedback.rating === filterRating)
        }

        // Apply sort
        if (sortConfig.key) {
            sortableFeedbacks.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1
                }
                return 0
            })
        }

        return sortableFeedbacks
    }

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentFeedbacks = getSortedAndFilteredFeedbacks().slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(getSortedAndFilteredFeedbacks().length / itemsPerPage)

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    const renderStars = (rating) => {
        const stars = []
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={18}
                    className={i < rating ? "star-filled" : "star-empty"}
                    fill={i < rating ? "#FFD700" : "none"}
                    stroke={i < rating ? "#FFD700" : "#CBD5E1"}
                />,
            )
        }
        return <div className="star-rating">{stars}</div>
    }

    return (
        <div className="feedback-container">
            <div className="feedback-content">
                <div className="feedback-header">
                    <h1>Phản hồi từ bệnh nhân</h1>
                    <div className="feedback-summary">
                        {!loading && (
                            <div className="feedback-stats">
                                <span>Tổng số phản hồi: <strong>{feedbacks.length}</strong></span>
                                {feedbacks.length > 0 && (
                                    <span>Đánh giá trung bình: <strong>
                                        {(feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1)}
                                    </strong> / 5</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="feedback-filters">
                    <div className="filter-group">
                        <span className="filter-label">Lọc theo đánh giá:</span>
                        <div className="rating-filters">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <button
                                    key={rating}
                                    className={`rating-filter-btn ${filterRating === rating ? "active" : ""}`}
                                    onClick={() => handleFilterRating(rating)}
                                    type="button"
                                >
                                    {rating} <Star size={14} fill="#FFD700" stroke="#FFD700" />
                                </button>
                            ))}
                            {filterRating !== null && (
                                <button
                                    className="rating-filter-btn clear-filter"
                                    onClick={() => setFilterRating(null)}
                                    type="button"
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Feedback Table */}
                <div className="feedback-table-container">
                    <table className="feedback-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên bệnh nhân</th>
                            <th>Tên dịch vụ</th>
                            <th
                                className={`sortable ${sortConfig.key === "date" ? "sorted" : ""}`}
                                onClick={() => requestSort("date")}
                            >
                                Ngày đánh giá
                                {sortConfig.key === "date" && (
                                    <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                                )}
                            </th>
                            <th
                                className={`sortable ${sortConfig.key === "rating" ? "sorted" : ""}`}
                                onClick={() => requestSort("rating")}
                            >
                                Đánh giá
                                {sortConfig.key === "rating" && (
                                    <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                                )}
                            </th>
                            <th>Bình luận</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="loading-cell">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : currentFeedbacks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="empty-cell">
                                    {filterRating !== null ? 
                                        `Không có phản hồi nào với ${filterRating} sao` : 
                                        "Chưa có phản hồi nào từ bệnh nhân"}
                                </td>
                            </tr>
                        ) : (
                            currentFeedbacks.map((feedback, index) => (
                                <tr key={feedback.id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{feedback.customerName}</td>
                                    <td>{feedback.serviceName}</td>
                                    <td>{feedback.date}</td>
                                    <td>{renderStars(feedback.rating)}</td>
                                    <td>{feedback.comment}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="feedback-pagination">
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
    )
}
