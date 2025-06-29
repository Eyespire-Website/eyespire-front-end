"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { User, Calendar, FileText, ArrowLeft, File, ZoomIn, ZoomOut, X } from "lucide-react"
import axios from "axios"
import "./view-medical-record.css"

// Format ngày giờ cho dễ đọc
const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A"
    try {
        const date = new Date(dateTime)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
    } catch {
        return "N/A"
    }
}

const formatDate = (date) => {
    if (!date) return "N/A"
    try {
        const d = new Date(date)
        return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch {
        return "N/A"
    }
}

export default function ViewMedicalRecordPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [medicalRecord, setMedicalRecord] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [address, setAddress] = useState("N/A")
    const [selectedImage, setSelectedImage] = useState(null)
    const [zoomLevel, setZoomLevel] = useState(1)
    const imageContainerRef = useRef(null)

    // Fetch address names from API
    const fetchAddressNames = async (provinceCode, districtCode, wardCode, addressDetail) => {
        try {
            const provincesResponse = await axios.get("https://provinces.open-api.vn/api/p/")
            const provinces = provincesResponse.data
            const province = provinces.find(p => p.code === parseInt(provinceCode))?.name || provinceCode || ""

            let district = districtCode || ""
            let ward = wardCode || ""

            if (provinceCode) {
                const districtsResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
                const districts = districtsResponse.data.districts
                district = districts.find(d => d.code === parseInt(districtCode))?.name || districtCode || ""
            }

            if (districtCode && provinceCode) {
                const wardsResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
                const wards = wardsResponse.data.wards
                ward = wards.find(w => w.code === parseInt(wardCode))?.name || wardCode || ""
            }

            const addressParts = [
                addressDetail && addressDetail !== "N/A" ? addressDetail : "Chưa xác định",
                ward ? `Xã ${ward}` : null,
                district ? `Huyện ${district}` : null,
                province ? `Tỉnh ${province}` : null,
            ].filter(Boolean).join(", ") || "N/A"

            return addressParts
        } catch (err) {
            console.error("Failed to fetch address names:", err)
            return [
                addressDetail && addressDetail !== "N/A" ? addressDetail : "Chưa xác định",
                wardCode ? `Xã ${wardCode}` : null,
                districtCode ? `Huyện ${districtCode}` : null,
                provinceCode ? `Tỉnh ${provinceCode}` : null,
            ].filter(Boolean).join(", ") || "N/A"
        }
    }

    // Lấy dữ liệu từ state
    useEffect(() => {
        if (!state?.medicalRecordData) {
            setError("Không tìm thấy thông tin hồ sơ bệnh án.")
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const record = {
                    id: state.medicalRecordData.id || "N/A",
                    appointmentId: state.medicalRecordData.appointmentId || "N/A",
                    date: state.medicalRecordData.date || "N/A",
                    time: state.medicalRecordData.time || "N/A",
                    diagnosis: state.medicalRecordData.diagnosis || "Chưa cập nhật",
                    service: state.medicalRecordData.service || "Chưa cập nhật",
                    notes: state.medicalRecordData.notes || "Không có ghi chú",
                    patient: {
                        id: state.medicalRecordData.patient?.id || "N/A",
                        name: state.medicalRecordData.patient?.name || "Chưa cập nhật",
                        email: state.medicalRecordData.patient?.email || "N/A",
                        phone: state.medicalRecordData.patient?.phone || "N/A",
                        gender: state.medicalRecordData.patient?.gender || "N/A",
                        dateOfBirth: state.medicalRecordData.patient?.dateOfBirth || "N/A",
                        province: state.medicalRecordData.patient?.province || null,
                        district: state.medicalRecordData.patient?.district || null,
                        ward: state.medicalRecordData.patient?.ward || null,
                        addressDetail: state.medicalRecordData.patient?.addressDetail || "Chưa xác định",
                    },
                    doctor: {
                        id: state.medicalRecordData.doctor?.id || "N/A",
                        name: state.medicalRecordData.doctor?.name || "Chưa cập nhật",
                        specialty: state.medicalRecordData.doctor?.specialty || { name: "N/A" },
                        qualification: state.medicalRecordData.doctor?.qualification || "N/A",
                        experience: state.medicalRecordData.doctor?.experience || null,
                    },
                    createdAt: state.medicalRecordData.createdAt || new Date().toISOString(),
                    updatedAt: state.medicalRecordData.updatedAt || new Date().toISOString(),
                    recordFileUrl: state.medicalRecordData.recordFileUrl || "",
                    recommendedProducts: state.medicalRecordData.recommendedProducts || [],
                }
                setMedicalRecord(record)

                const resolvedAddress = await fetchAddressNames(
                    record.patient.province,
                    record.patient.district,
                    record.patient.ward,
                    record.patient.addressDetail
                )
                setAddress(resolvedAddress)
            } catch (err) {
                console.error("Failed to resolve address:", err)
                setError("Không thể tải thông tin địa chỉ.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [state])

    // Xử lý zoom bằng chuột
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 3))
        }

        const imageContainer = imageContainerRef.current
        if (selectedImage && imageContainer) {
            imageContainer.addEventListener("wheel", handleWheel, { passive: false })
        }

        return () => {
            if (imageContainer) {
                imageContainer.removeEventListener("wheel", handleWheel)
            }
        }
    }, [selectedImage])

    // Đóng modal bằng phím Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleCloseModal()
        }
        if (selectedImage) {
            window.addEventListener("keydown", handleKeyDown)
        }
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedImage])

    // Xử lý quay lại
    const handleBack = () => {
        const returnPath = state?.returnPath || "/dashboard/doctor/patients"
        console.log("Navigating back to:", returnPath)
        navigate(returnPath, { state: { activeSection: "health" } })
    }

    const handleImageClick = (url) => {
        setSelectedImage(url)
        setZoomLevel(1)
    }

    const handleCloseModal = () => {
        setSelectedImage(null)
        setZoomLevel(1)
    }

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.2, 3))
    }

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
    }

    if (loading) {
        return (
            <div className="view-medical-record">
                <div className="view-medical-record__loading">
                    <div className="view-medical-record__spinner"></div>
                    <p>Đang tải thông tin hồ sơ bệnh án...</p>
                </div>
            </div>
        )
    }

    if (error || !medicalRecord) {
        return (
            <div className="view-medical-record">
                <div className="view-medical-record__error">
                    <p>{error || "Không tìm thấy thông tin hồ sơ bệnh án."}</p>
                    <button onClick={handleBack} className="view-medical-record__back-button">
                        <ArrowLeft size={16} className="view-medical-record__icon" />
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    const patient = medicalRecord.patient || {}
    const doctor = medicalRecord.doctor || {}
    const fileUrls = medicalRecord.recordFileUrl ? medicalRecord.recordFileUrl.split(";").filter(Boolean) : []
    const imageUrls = fileUrls.filter(url => url.match(/\.(jpg|jpeg|png)$/i))
    const otherFiles = fileUrls.filter(url => !url.match(/\.(jpg|jpeg|png)$/i))

    // Prepend base URL to make file URLs accessible
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"
    const getFullUrl = (url) => url.startsWith("http") ? url : `${baseUrl}${url}`

    return (
        <div className="view-medical-record">
            <div className="view-medical-record__container">
                <div className="view-medical-record__header">
                    <h1 className="view-medical-record__title">Chi tiết hồ sơ bệnh án</h1>
                </div>

                <div className="view-medical-record__card">
                    <div className="view-medical-record__card-header">
                        <div className="view-medical-record__card-header-content">
                            <FileText className="view-medical-record__card-header-icon" />
                            <span className="view-medical-record__card-header-text">Thông tin hồ sơ bệnh án</span>
                        </div>
                    </div>

                    <div className="view-medical-record__section">
                        <h2 className="view-medical-record__section-title">Thông tin bệnh nhân</h2>
                        <div className="view-medical-record__info-group">
                            <div className="view-medical-record__info-item">
                                <User size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Tên</span>
                                    <p className="view-medical-record__value">{patient.name || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Email</span>
                                    <p className="view-medical-record__value">{patient.email || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Số điện thoại</span>
                                    <p className="view-medical-record__value">{patient.phone || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Giới tính</span>
                                    <p className="view-medical-record__value">{patient.gender === "Nam" ? "Nam" : patient.gender === "Nữ" ? "Nữ" : "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <Calendar size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Ngày sinh</span>
                                    <p className="view-medical-record__value">{formatDate(patient.dateOfBirth)}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Địa chỉ</span>
                                    <p className="view-medical-record__value">{address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="view-medical-record__section">
                        <h2 className="view-medical-record__section-title">Thông tin bác sĩ</h2>
                        <div className="view-medical-record__info-group">
                            <div className="view-medical-record__info-item">
                                <User size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Tên</span>
                                    <p className="view-medical-record__value">{doctor.name || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Chuyên khoa</span>
                                    <p className="view-medical-record__value">{doctor.specialty?.name || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Trình độ</span>
                                    <p className="view-medical-record__value">{doctor.qualification || "N/A"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Kinh nghiệm</span>
                                    <p className="view-medical-record__value">{doctor.experience ? `${doctor.experience} năm` : "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="view-medical-record__section">
                        <h2 className="view-medical-record__section-title">Chi tiết bệnh án</h2>
                        <div className="view-medical-record__info-group">
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Chẩn đoán</span>
                                    <p className="view-medical-record__value">{medicalRecord.diagnosis || "Không có chẩn đoán"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Dịch vụ</span>
                                    <p className="view-medical-record__value">{medicalRecord.service || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <FileText size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Ghi chú</span>
                                    <p className="view-medical-record__value">{medicalRecord.notes || "Không có ghi chú"}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <Calendar size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Thời gian tạo</span>
                                    <p className="view-medical-record__value">{formatDateTime(medicalRecord.createdAt)}</p>
                                </div>
                            </div>
                            <div className="view-medical-record__info-item">
                                <Calendar size={18} className="view-medical-record__icon" />
                                <div>
                                    <span className="view-medical-record__label">Thời gian cập nhật</span>
                                    <p className="view-medical-record__value">{formatDateTime(medicalRecord.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {medicalRecord.recommendedProducts && medicalRecord.recommendedProducts.length > 0 && (
                        <div className="view-medical-record__section">
                            <h2 className="view-medical-record__section-title">Sản phẩm được đề xuất</h2>
                            <div className="view-medical-record__info-group">
                                {medicalRecord.recommendedProducts.map((item, index) => (
                                    <div key={index} className="view-medical-record__info-item">
                                        <FileText size={18} className="view-medical-record__icon" />
                                        <div>
                                            <span className="view-medical-record__label">Sản phẩm #{index + 1}</span>
                                            <p className="view-medical-record__value">
                                                Tên: {item.product?.name || "N/A"}<br />
                                                Mô tả: {item.product?.description || "N/A"}<br />
                                                Số lượng: {item.quantity || "N/A"}<br />
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {fileUrls.length > 0 && (
                        <div className="view-medical-record__section">
                            <h2 className="view-medical-record__section-title">Tệp đính kèm</h2>
                            <div className="view-medical-record__info-group">
                                {imageUrls.map((url, index) => (
                                    <div key={index} className="view-medical-record__info-item">
                                        <File size={18} className="view-medical-record__icon" />
                                        <div>
                                            <span className="view-medical-record__label">Hình ảnh #{index + 1}</span>
                                            <img
                                                src={getFullUrl(url)}
                                                alt={`Tệp đính kèm ${index + 1}`}
                                                className="view-medical-record__image"
                                                onClick={() => handleImageClick(getFullUrl(url))}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {otherFiles.map((url, index) => (
                                    <div key={index} className="view-medical-record__info-item">
                                        <File size={18} className="view-medical-record__icon" />
                                        <div>
                                            <span className="view-medical-record__label">Tệp #{index + 1}</span>
                                            <a
                                                href={getFullUrl(url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="view-medical-record__value"
                                                style={{ color: "#1e40af", textDecoration: "underline" }}
                                            >
                                                Tệp đính kèm #{index + 1}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedImage && (
                        <div className="image-modal-overlay" onClick={handleCloseModal}>
                            <div className="image-modal" onClick={e => e.stopPropagation()}>
                                <button className="image-modal-close" onClick={handleCloseModal}>
                                    <X size={24} />
                                </button>
                                <div className="image-modal-content" ref={imageContainerRef}>
                                    <img
                                        src={selectedImage}
                                        alt="Zoomed"
                                        style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s" }}
                                    />
                                </div>
                                <div className="image-modal-controls">
                                    <button onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                                        <ZoomIn size={20} />
                                    </button>
                                    <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                                        <ZoomOut size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="view-medical-record__actions">
                        <button onClick={handleBack} className="view-medical-record__back-button">
                            <ArrowLeft size={16} className="view-medical-record__icon" />
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}