"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./doctor-feedback.css"
import "./doctor-feedback-unified.css"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, MessageSquare, Filter } from "lucide-react"
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
        <div className="doctor-feedback-content">
            {/* Header with filters */}
            <div className="doctor-feedback-content__header">
                <div className="doctor-feedback-content__header-content">
                    <div className="doctor-feedback-content__title-section">
                        <MessageSquare className="doctor-feedback-content__title-icon" />
                        <h1 className="doctor-feedback-content__title">Phản hồi từ bệnh nhân</h1>
                    </div>
                    <div className="doctor-feedback-content__stats">
                        {!loading && (
                            <div className="doctor-feedback-content__stats-content">
                                <span>Tổng số: <strong>{feedbacks.length}</strong></span>
                                {feedbacks.length > 0 && (
                                    <span>Trung bình: <strong>
                                        {(feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1)}
                                    </strong>/5</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="doctor-feedback-content__filters">
                <div className="doctor-feedback-content__filter-group">
                    <Filter className="doctor-feedback-content__filter-icon" />
                    <span className="doctor-feedback-content__filter-label">Lọc theo đánh giá:</span>
                    <div className="doctor-feedback-content__rating-filters">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <button
                                key={rating}
                                className={`doctor-feedback-content__rating-filter-btn ${
                                    filterRating === rating ? "doctor-feedback-content__rating-filter-btn--active" : ""
                                }`}
                                onClick={() => handleFilterRating(rating)}
                                type="button"
                            >
                                {rating} <Star size={14} fill="#FFD700" stroke="#FFD700" />
                            </button>
                        ))}
                        {filterRating !== null && (
                            <button
                                className="doctor-feedback-content__rating-filter-btn doctor-feedback-content__rating-filter-btn--clear"
                                onClick={() => setFilterRating(null)}
                                type="button"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="doctor-feedback-content__table-container">
                <div className="doctor-feedback-content__table-header">
                    <div className="doctor-feedback-content__table-header-content">
                        <MessageSquare className="doctor-feedback-content__table-header-icon" />
                        <span className="doctor-feedback-content__table-header-text">
                            Danh sách phản hồi ({getSortedAndFilteredFeedbacks().length} phản hồi)
                        </span>
                    </div>
                </div>

                <div className="doctor-feedback-content__table-wrapper">
                    <table className="doctor-feedback-content__table">
                        <thead>
                        <tr>
                            <th className="doctor-feedback-content__table-head doctor-feedback-content__table-head--number">#</th>
                            <th className="doctor-feedback-content__table-head">Bệnh nhân</th>
                            <th className="doctor-feedback-content__table-head">Dịch vụ</th>
                            <th
                                className={`doctor-feedback-content__table-head doctor-feedback-content__table-head--sortable ${
                                    sortConfig.key === "date" ? "doctor-feedback-content__table-head--sorted" : ""
                                }`}
                                onClick={() => requestSort("date")}
                            >
                                Ngày đánh giá
                                {sortConfig.key === "date" && (
                                    <span className="doctor-feedback-content__sort-icon">
                                        {sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </span>
                                )}
                            </th>
                            <th
                                className={`doctor-feedback-content__table-head doctor-feedback-content__table-head--sortable ${
                                    sortConfig.key === "rating" ? "doctor-feedback-content__table-head--sorted" : ""
                                }`}
                                onClick={() => requestSort("rating")}
                            >
                                Đánh giá
                                {sortConfig.key === "rating" && (
                                    <span className="doctor-feedback-content__sort-icon">
                                        {sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </span>
                                )}
                            </th>
                            <th className="doctor-feedback-content__table-head">Bình luận</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="doctor-feedback-content__loading-cell">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : currentFeedbacks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="doctor-feedback-content__no-results">
                                    {filterRating !== null ? 
                                        `Không có phản hồi nào với ${filterRating} sao` : 
                                        "Chưa có phản hồi nào từ bệnh nhân"}
                                </td>
                            </tr>
                        ) : (
                            currentFeedbacks.map((feedback, index) => (
                                <tr key={feedback.id} className="doctor-feedback-content__table-row">
                                    <td className="doctor-feedback-content__table-cell doctor-feedback-content__table-cell--number">{indexOfFirstItem + index + 1}</td>
                                    <td className="doctor-feedback-content__table-cell">{feedback.customerName}</td>
                                    <td className="doctor-feedback-content__table-cell">{feedback.serviceName}</td>
                                    <td className="doctor-feedback-content__table-cell">{feedback.date}</td>
                                    <td className="doctor-feedback-content__table-cell">
                                        <div className="doctor-feedback-content__rating">{renderStars(feedback.rating)}</div>
                                    </td>
                                    <td className="doctor-feedback-content__table-cell">
                                        <div className="doctor-feedback-content__comment">{feedback.comment}</div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Compact Pagination */}
                {getSortedAndFilteredFeedbacks().length > 0 && (
                    <div className="doctor-feedback-content__pagination">
                        <button
                            className="doctor-feedback-content__pagination-btn"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`doctor-feedback-content__pagination-btn ${
                                    currentPage === i + 1 ? 'doctor-feedback-content__pagination-btn--active' : ''
                                }`}
                                onClick={() => paginate(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="doctor-feedback-content__pagination-btn"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
