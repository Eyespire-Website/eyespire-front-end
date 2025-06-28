"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./doctor-records.css"
import { Upload, Trash2, User, FileText, Stethoscope, Pill, StickyNote, Minus, Plus, ChevronDown } from "lucide-react"
import medicalRecordService from '../../../services/medicalRecordService';
import authService from '../../../services/authService';
import appointmentService from '../../../services/appointmentService';

export default function CreateMedicalRecord() {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState([])
    const [selectedFiles, setSelectedFiles] = useState([])
    const [recommendedMedicines, setRecommendedMedicines] = useState([])
    const [selectedMedicine, setSelectedMedicine] = useState("")
    const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
    const [error, setError] = useState(null)

    const [recordData, setRecordData] = useState({
        patientId: "",
        diagnosis: "",
        notes: "",
    })

    // Lấy thông tin từ state
    const { state } = location
    const appointmentId = state?.appointmentId
    const initialPatientId = state?.patientId
    const initialPatientName = state?.patientName
    const doctorId = state?.doctorId // Lấy doctorId từ state

    // Log state để debug
    console.log("Location state:", state)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Kiểm tra doctorId
                if (!doctorId || isNaN(Number(doctorId))) {
                    setError("ID bác sĩ không hợp lệ!")
                    navigate("/dashboard/doctor/appointments")
                    return
                }

                // Lấy danh sách thuốc
                const productsData = await medicalRecordService.getProductsMedicine()
                setProducts(productsData)

                // Thiết lập patientId
                if (initialPatientId && !isNaN(initialPatientId)) {
                    setRecordData(prev => ({
                        ...prev,
                        patientId: Number(initialPatientId)
                    }))
                } else {
                    setError("ID bệnh nhân không hợp lệ!")
                    navigate("/dashboard/doctor/appointments")
                }

                // Kiểm tra trạng thái cuộc hẹn
                if (appointmentId && !isNaN(appointmentId)) {
                    const appointmentStatus = await medicalRecordService.getAppointmentStatus(appointmentId)
                    if (appointmentStatus !== "CONFIRMED") {
                        setError("Cuộc hẹn phải ở trạng thái XÁC NHẬN để tạo hồ sơ bệnh án!")
                        navigate("/dashboard/doctor/appointments")
                    }
                } else {
                    setError("ID cuộc hẹn không hợp lệ!")
                    navigate("/dashboard/doctor/appointments")
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                setError("Không thể tải dữ liệu: " + (error.response?.data?.message || error.message))
                navigate("/dashboard/doctor/appointments")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [initialPatientId, appointmentId, doctorId, navigate])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setRecordData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        const maxFileSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

        const validFiles = files.filter(file => {
            if (file.size > maxFileSize) {
                setError(`File ${file.name} quá lớn! Kích thước tối đa là 5MB.`)
                return false
            }
            if (!allowedTypes.includes(file.type)) {
                setError(`File ${file.name} có định dạng không được hỗ trợ!`)
                return false
            }
            return true
        })

        const newFiles = validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
        }))

        setSelectedFiles((prev) => [...prev, ...newFiles])
    }

    const removeFile = (index) => {
        setSelectedFiles((prev) => {
            const updated = [...prev]
            URL.revokeObjectURL(updated[index].preview)
            updated.splice(index, 1)
            return updated
        })
    }

    const handleMedicineQuantity = (id, change) => {
        setRecommendedMedicines((prev) =>
            prev
                .map((med) => (med.id === id ? { ...med, quantity: Math.max(0, med.quantity + change) } : med))
                .filter((med) => med.quantity > 0),
        )
    }

    const addMedicine = () => {
        if (!selectedMedicine) {
            setError("Vui lòng chọn thuốc!")
            return
        }

        const product = products.find(p => p.name === selectedMedicine)
        if (!product) {
            setError("Thuốc không tồn tại!")
            return
        }

        const exists = recommendedMedicines.some((med) => med.id === product.id)
        if (!exists) {
            setRecommendedMedicines((prev) => [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                },
            ])
        } else {
            setRecommendedMedicines((prev) =>
                prev.map((med) =>
                    med.id === product.id ? { ...med, quantity: med.quantity + 1 } : med,
                ),
            )
        }
        setSelectedMedicine("")
        setShowMedicineDropdown(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const patientId = Number(recordData.patientId)
        if (!patientId || isNaN(patientId) || patientId <= 0 || !recordData.diagnosis.trim()) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc và đảm bảo ID bệnh nhân là số hợp lệ!")
            return
        }

        if (!appointmentId || isNaN(Number(appointmentId))) {
            setError("ID cuộc hẹn không hợp lệ!")
            return
        }

        if (!doctorId || isNaN(Number(doctorId))) {
            setError("ID bác sĩ không hợp lệ!")
            return
        }

        try {
            setLoading(true)
            setError(null)
            const productQuantities = recommendedMedicines.map(med => ({
                productId: Number(med.id),
                quantity: Number(med.quantity)
            }))

            console.log("Submitting data:", {
                patientId,
                doctorId: Number(doctorId),
                diagnosis: recordData.diagnosis,
                notes: recordData.notes,
                appointmentId: Number(appointmentId),
                productQuantities,
                files: selectedFiles.map(f => f.name)
            })

            // Tính tổng chi phí từ các thuốc được kê
            let totalMedicationCost = 0
            for (const med of recommendedMedicines) {
                const price = Number(med.price) || 0
                const quantity = Number(med.quantity) || 0
                totalMedicationCost += price * quantity
            }

            // Giả sử chi phí khám cơ bản là 300,000 VND
            const baseExaminationFee = 300000
            const totalAmount = baseExaminationFee + totalMedicationCost

            // Tạo hồ sơ bệnh án
            const response = await medicalRecordService.createMedicalRecord(
                {
                    ...recordData,
                    patientId,
                    doctorId: Number(doctorId),
                    appointmentId: Number(appointmentId),
                    productQuantities
                },
                selectedFiles.map(fileObj => fileObj.file)
            )

            // Chuyển trạng thái cuộc hẹn sang chờ thanh toán
            await appointmentService.setAppointmentWaitingPayment(
                Number(appointmentId),
                totalAmount
            )

            alert("Hồ sơ bệnh án đã được tạo thành công! Cuộc hẹn đã chuyển sang trạng thái chờ thanh toán.")
            setRecordData({ patientId: "", diagnosis: "", notes: "" })
            setSelectedFiles([])
            setRecommendedMedicines([])
            navigate("/dashboard/doctor/records")
        } catch (error) {
            console.error("Error creating medical record:", error.response?.data, error.message)
            setError("Có lỗi xảy ra khi tạo hồ sơ bệnh án: " + (error.response?.data?.message || error.message))
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="records-container">
                <div className="records-content">
                    <div className="records-header">
                        <h1>Tạo hồ sơ bệnh án</h1>
                    </div>
                    <div className="loading-container">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="records-container">
            <div className="records-content">
                <div className="records-header">
                    <h1>Tạo hồ sơ bệnh án</h1>
                    {initialPatientName && (
                        <p>Đối với: {initialPatientName} (Cuộc hẹn ID: {appointmentId})</p>
                    )}
                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                </div>

                <div className="create-record-form-container">
                    <form onSubmit={handleSubmit} className="record-form">
                        <div className="form-grid-medical">
                            <div className="form-section">
                                <div className="section-header">
                                    <User size={20} />
                                    <h3>Thông tin bệnh nhân</h3>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="required">*</span> Chọn bệnh nhân
                                    </label>
                                    <input
                                        type="text"
                                        name="patientId"
                                        value={initialPatientName || "Không có dữ liệu"}
                                        className="form-control"
                                        disabled
                                    />
                                </div>

                                <div className="patient-info">
                                    <p><strong>Tên:</strong> {initialPatientName || "Không có dữ liệu"}</p>
                                </div>

                                <div className="form-group">
                                    <label>Hình ảnh / Tài liệu</label>
                                    <div className="file-upload-container">
                                        <label htmlFor="file-upload" className="file-upload-button">
                                            <Upload size={18} />
                                            <span>Chọn file</span>
                                        </label>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            onChange={handleFileChange}
                                            accept="image/*,.pdf,.doc,.docx"
                                            multiple
                                            style={{ display: "none" }}
                                        />

                                        {selectedFiles.length > 0 && (
                                            <div className="file-preview-container">
                                                {selectedFiles.map((fileObj, index) => (
                                                    <div key={index} className="file-preview-item">
                                                        {fileObj.file.type.startsWith("image/") ? (
                                                            <img src={fileObj.preview} alt={`Preview ${index}`} />
                                                        ) : (
                                                            <div className="file-icon">
                                                                <FileText size={32} />
                                                                <span>{fileObj.name}</span>
                                                            </div>
                                                        )}
                                                        <button type="button" className="remove-file-button" onClick={() => removeFile(index)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <Stethoscope size={20} />
                                    <h3>Thông tin y tế</h3>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="required">*</span> Chẩn đoán
                                    </label>
                                    <textarea
                                        name="diagnosis"
                                        value={recordData.diagnosis}
                                        onChange={handleInputChange}
                                        className="form-control diagnosis-textarea"
                                        placeholder="Nhập chẩn đoán bệnh..."
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <StickyNote size={16} style={{ marginRight: "8px" }} />
                                        Ghi chú
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={recordData.notes}
                                        onChange={handleInputChange}
                                        className="form-control notes-textarea"
                                        placeholder="Ghi chú thêm về tình trạng bệnh nhân, lời khuyên..."
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <Pill size={20} />
                                    <h3>Thuốc được đề xuất</h3>
                                </div>

                                <div className="form-group">
                                    <div className="medication-dropdown-container">
                                        <div
                                            className="medication-dropdown"
                                            onClick={() => setShowMedicineDropdown(!showMedicineDropdown)}
                                        >
                                            <span>{selectedMedicine || "Chọn thuốc"}</span>
                                            <ChevronDown size={16} className={showMedicineDropdown ? "rotated" : ""} />
                                        </div>

                                        {showMedicineDropdown && (
                                            <div className="medication-dropdown-menu">
                                                {products.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="medication-dropdown-item"
                                                        onClick={() => {
                                                            setSelectedMedicine(product.name)
                                                            addMedicine()
                                                        }}
                                                    >
                                                        {product.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="medications-list-container">
                                    {recommendedMedicines.map((med) => (
                                        <div key={med.id} className="medication-item-new">
                                            <div className="medication-name">{med.name}</div>
                                            <div className="medication-controls">
                                                <button
                                                    type="button"
                                                    className="quantity-btn minus"
                                                    onClick={() => handleMedicineQuantity(med.id, -1)}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="medication-quantity">{med.quantity}</span>
                                                <button
                                                    type="button"
                                                    className="quantity-btn plus"
                                                    onClick={() => handleMedicineQuantity(med.id, 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => handleMedicineQuantity(med.id, -med.quantity)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => navigate("/dashboard/doctor/appointments")}>
                                Hủy
                            </button>
                            <button type="submit" className="create-record-button" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Tạo hồ sơ bệnh án"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}