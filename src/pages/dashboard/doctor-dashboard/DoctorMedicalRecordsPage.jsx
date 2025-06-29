"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, User, FileText, RefreshCw } from "lucide-react"
import "./doctor-appointments.css"
import medicalRecordService from "../../../services/medicalRecordService"
import authService from "../../../services/authService"

// Hàm format ngày từ createdAt (LocalDateTime)
const formatDate = (dateTime) => {
    if (!dateTime) {
        return "N/A"
    }
    try {
        const date = new Date(dateTime).toISOString().split('T')[0] // Lấy ngày YYYY-MM-DD
        return date
    } catch (error) {
        console.error("Lỗi khi format createdAt:", dateTime, error)
        return "N/A"
    }
}

export default function DoctorMedicalRecordsPage() {
    const [allRecords, setAllRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()
    const itemsPerPage = 5

    // Lấy userId từ người dùng hiện tại
    const currentUser = authService.getCurrentUser()
    const userId = currentUser?.id || null
    console.log("Current User:", { userId, currentUser })

    // Fetch medical records for the logged-in doctor
    const fetchMedicalRecords = async () => {
        if (!userId) {
            setError("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại hoặc kiểm tra thông tin tài khoản.")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            console.log(`Fetching medical records for userId: ${userId}`)
            const data = await medicalRecordService.getDoctorMedicalRecordsByUserId(userId)
            console.log("Raw Medical Records API Response:", JSON.stringify(data, null, 2))

            // Xử lý và format dữ liệu
            const formattedRecords = data?.length > 0 ? data.map(record => ({
                ...record,
                createdAt: formatDate(record.createdAt),
                patientName: record.patient?.name || "Không xác định",
                patientId: record.patient?.id,
            })) : []

            console.log("Formatted Medical Records:", JSON.stringify(formattedRecords, null, 2))
            setAllRecords(formattedRecords)
            if (formattedRecords.length === 0) {
                setError("Chưa có hồ sơ bệnh án nào. Vui lòng tạo hồ sơ mới hoặc kiểm tra dữ liệu bác sĩ.")
            }
        } catch (err) {
            console.error("Failed to fetch medical records:", err)
            if (err.response?.status === 401) {
                setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
            } else if (err.response?.status === 404) {
                setError("Không tìm thấy bác sĩ liên kết với tài khoản này. Vui lòng kiểm tra ID bác sĩ.")
            } else {
                setError(`Không thể tải danh sách hồ sơ bệnh án: ${err.response?.data?.message || err.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setSearchQuery("") // Reset search query on mount
        fetchMedicalRecords()
    }, [userId])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    // Handle view medical record details
    const handleViewMedicalRecord = (record) => {
        navigate("/dashboard/doctor/view-medical-record", {
            state: {
                medicalRecordData: record,
                mode: "view",
            },
        })
    }

    // Filter records based on search query
    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) {
            return allRecords
        }

        const query = searchQuery.toLowerCase().trim()
        return allRecords.filter((record) => {
            return (
                (record.patientName?.toLowerCase() || "").includes(query) ||
                (record.createdAt || "").includes(query) ||
                (record.diagnosis?.toLowerCase() || "").includes(query) ||
                (record.prescription?.toLowerCase() || "").includes(query) ||
                (record.notes?.toLowerCase() || "").includes(query)
            )
        })
    }, [allRecords, searchQuery])

    // Pagination logic
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
    const paginatedRecords = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredRecords.slice(startIndex, endIndex)
    }, [filteredRecords, currentPage, itemsPerPage])

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        console.log("Search Query:", e.target.value)
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
    }

    const getPageNumbers = () => {
        const pageNumbers = []
        const maxPagesToShow = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i)
        }

        return pageNumbers
    }

    if (!currentUser) {
        return (
            <div className="appointments">
                <div className="appointments__error">
                    <p>Vui lòng đăng nhập để xem danh sách hồ sơ bệnh án.</p>
                    <button onClick={() => navigate("/login")} className="appointments__retry-button">
                        Đăng nhập
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="appointments">
                <div className="appointments__loading">
                    <div className="appointments__spinner"></div>
                    <p>Đang tải danh sách hồ sơ bệnh án...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="appointments">
            <div className="appointments__header">
                <h1 className="appointments__title">Danh sách hồ sơ bệnh án</h1>
                <div className="appointments__search-container">
                    <div className="appointments__search-wrapper">
                        <FileText className="appointments__search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm hồ sơ (Tên bệnh nhân, ngày tạo, chẩn đoán...)"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="appointments__search-input"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="appointments__error">
                    <p>{error}</p>
                    <button onClick={fetchMedicalRecords} className="appointments__retry-button">
                        Thử lại
                    </button>
                    {error.includes("đăng nhập") && (
                        <button onClick={() => navigate("/login")} className="appointments__retry-button">
                            Đăng nhập lại
                        </button>
                    )}
                </div>
            )}

            {filteredRecords.length > 0 && (
                <div className="appointments__table-container">
                    <div className="appointments__table-header">
                        <div className="appointments__table-header-content">
                            <FileText className="appointments__table-header-icon" />
                            <span className="appointments__table-header-text">
                                Danh sách hồ sơ bệnh án ({filteredRecords.length} hồ sơ)
                            </span>
                        </div>
                    </div>

                    <div className="appointments__table-wrapper">
                        <table className="appointments__table">
                            <thead>
                            <tr>
                                <th className="appointments__table-head appointments__table-head--number">#</th>
                                <th className="appointments__table-head">Bệnh nhân</th>
                                <th className="appointments__table-head">Ngày tạo</th>
                                <th className="appointments__table-head">Chẩn đoán</th>
                                <th className="appointments__table-head">Ghi chú</th>
                                <th className="appointments__table-head">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedRecords.map((record, index) => (
                                <tr key={record.id} className="appointments__table-row">
                                    <td className="appointments__table-cell">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="appointments__table-cell">
                                        <div className="appointments__icon-text">
                                            <User className="appointments__icon" />
                                            <span>{record.patientName || "Không xác định"}</span>
                                        </div>
                                    </td>
                                    <td className="appointments__table-cell">
                                        <div className="appointments__icon-text">
                                            <Calendar className="appointments__icon" />
                                            <span>{record.createdAt || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="appointments__table-cell">
                                        <div className="appointments__reason-text">{record.diagnosis || "Không có chẩn đoán"}</div>
                                    </td>
                                    <td className="appointments__table-cell">
                                        <div className="appointments__reason-text">{record.notes || "Không có ghi chú"}</div>
                                    </td>
                                    <td className="appointments__table-cell">
                                        <div className="appointments__actions">
                                            <button
                                                className="appointments__detail-button"
                                                onClick={() => handleViewMedicalRecord(record)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="appointments__pagination">
                            <div className="appointments__pagination-info">
                                Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRecords.length)} -{" "}
                                {Math.min(currentPage * itemsPerPage, filteredRecords.length)} trong tổng số{" "}
                                {filteredRecords.length} hồ sơ
                            </div>
                            <div className="appointments__pagination-controls">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="appointments__pagination-button"
                                >
                                    Trước
                                </button>
                                {getPageNumbers().map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`appointments__pagination-button ${
                                            currentPage === pageNum ? "appointments__pagination-button--active" : ""
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="appointments__pagination-button"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}