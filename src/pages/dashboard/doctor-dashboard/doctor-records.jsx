"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Upload, Trash2, FileText, Stethoscope, Pill, StickyNote, Minus, Plus, ChevronDown, Clipboard, Search } from "lucide-react"
import medicalRecordService from '../../../services/medicalRecordService'
import appointmentService from '../../../services/appointmentService'
import "./doctor-records.css"

export default function CreateMedicalRecord() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [products, setProducts] = useState([])
    const [services, setServices] = useState([])
    const [selectedFiles, setSelectedFiles] = useState([])
    const [recommendedMedicines, setRecommendedMedicines] = useState([])
    const [selectedServiceIds, setSelectedServiceIds] = useState([])
    const [showServiceDropdown, setShowServiceDropdown] = useState(false)
    const [serviceSearchQuery, setServiceSearchQuery] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [editingQuantityId, setEditingQuantityId] = useState(null)
    const [tempQuantity, setTempQuantity] = useState("")
    const dropdownRef = useRef(null)

    const appointmentId = state?.appointmentId
    const initialPatientId = state?.patientId
    const initialPatientName = state?.patientName
    const doctorId = state?.doctorId
    const initialServiceIds = state?.serviceIds || []

    const [recordData, setRecordData] = useState({
        patientId: "",
        diagnosis: "",
        serviceIds: initialServiceIds,
        notes: "",
    })

    // Filter products for medicine search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Filter services for service search
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
    )

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Validate navigation state
                if (!appointmentId || isNaN(Number(appointmentId))) {
                    setError("ID cuộc hẹn không hợp lệ!")
                    return
                }
                if (!doctorId || isNaN(Number(doctorId))) {
                    setError("ID bác sĩ không hợp lệ!")
                    return
                }
                if (!initialPatientId || isNaN(Number(initialPatientId))) {
                    setError("ID bệnh nhân không hợp lệ!")
                    return
                }

                const [productsData, servicesData] = await Promise.all([
                    medicalRecordService.getProductsMedicine(),
                    appointmentService.getMedicalServices()
                ])
                console.log("Fetched products:", JSON.stringify(productsData, null, 2))
                console.log("Fetched services:", JSON.stringify(servicesData, null, 2))
                setProducts(productsData)
                setServices(servicesData)

                if (initialServiceIds && initialServiceIds.length > 0) {
                    const validServiceIds = initialServiceIds.filter(id => servicesData.some(service => service.id === id))
                    setSelectedServiceIds(validServiceIds)
                    setRecordData(prev => ({
                        ...prev,
                        serviceIds: validServiceIds
                    }))
                }

                setRecordData(prev => ({
                    ...prev,
                    patientId: Number(initialPatientId)
                }))

                const appointmentStatus = await medicalRecordService.getAppointmentStatus(appointmentId)
                console.log("Appointment status:", appointmentStatus)
                if (appointmentStatus !== "CONFIRMED") {
                    setError("Cuộc hẹn không ở trạng thái Đã xác nhận, không thể tạo hồ sơ!")
                    return
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                if (error.response?.status === 401) {
                    setError("Không thể xác thực. Vui lòng kiểm tra phiên đăng nhập.")
                } else {
                    setError("Không thể tải dữ liệu: " + (error.response?.data?.message || error.message))
                }
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [initialPatientId, appointmentId, doctorId, initialServiceIds])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowServiceDropdown(false)
                setServiceSearchQuery("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        console.log(`Input change: ${name} = ${value}`)
        setRecordData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        const maxFileSize = 5 * 1024 * 1024
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
        setRecommendedMedicines((prev) => {
            const updated = prev
                .map((med) => (med.id === id ? { ...med, quantity: Math.max(0, med.quantity + change) } : med))
                .filter((med) => med.quantity > 0)
            console.log("After quantity change, recommendedMedicines:", JSON.stringify(updated, null, 2))
            return updated
        })
    }

    const handleQuantityInputChange = (id, value) => {
        setTempQuantity(value)
    }

    const handleQuantityInputBlur = (id) => {
        const newQuantity = parseInt(tempQuantity, 10)
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            setRecommendedMedicines((prev) => {
                const updated = prev
                    .map((med) => (med.id === id ? { ...med, quantity: newQuantity } : med))
                    .filter((med) => med.quantity > 0)
                console.log("After quantity input, recommendedMedicines:", JSON.stringify(updated, null, 2))
                return updated
            })
        }
        setEditingQuantityId(null)
        setTempQuantity("")
    }

    const handleQuantityClick = (id, quantity) => {
        setEditingQuantityId(id)
        setTempQuantity(quantity.toString())
    }

    const removeMedicine = (id) => {
        setRecommendedMedicines((prev) => {
            const updated = prev.filter((med) => med.id !== id)
            console.log("After removing medicine, recommendedMedicines:", JSON.stringify(updated, null, 2))
            return updated
        })
    }

    const addMedicine = (productName) => {
        const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase())
        if (!product) {
            console.warn(`Product not found: ${productName}`)
            return
        }
        setRecommendedMedicines((prev) => {
            const exists = prev.some((med) => med.id === product.id)
            let updated
            if (!exists) {
                updated = [
                    ...prev,
                    {
                        id: product.id,
                        name: product.name,
                        quantity: 1,
                    },
                ]
            } else {
                updated = prev.map((med) =>
                    med.id === product.id ? { ...med, quantity: med.quantity + 1 } : med
                )
            }
            console.log("After adding medicine, recommendedMedicines:", JSON.stringify(updated, null, 2))
            return updated
        })
        setSearchQuery("")
    }

    const handleServiceToggle = (serviceId) => {
        setSelectedServiceIds((prev) => {
            const updated = prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
            setRecordData((prevData) => ({
                ...prevData,
                serviceIds: updated
            }))
            console.log("Selected serviceIds:", updated)
            return updated
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Recommended Medicines before submit:", JSON.stringify(recommendedMedicines, null, 2))
        if (recommendedMedicines.length > 0) {
            const confirm = window.confirm(
                "Bạn đã chọn các thuốc sau:\n" +
                recommendedMedicines.map(m => `${m.name}: ${m.quantity}`).join("\n") +
                "\nDịch vụ đã chọn:\n" +
                selectedServiceIds
                    .map(id => services.find(s => s.id === id)?.name)
                    .filter(name => name)
                    .join("\n") +
                "\nXác nhận tạo hồ sơ bệnh án?"
            )
            if (!confirm) return
        }

        const patientId = Number(recordData.patientId)
        if (!patientId || isNaN(patientId) || patientId <= 0 ||
            !recordData.diagnosis || typeof recordData.diagnosis !== 'string' ||
            !recordData.diagnosis.trim() || selectedServiceIds.length === 0) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc (chẩn đoán, ít nhất một dịch vụ) và đảm bảo ID bệnh nhân hợp lệ!")
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

            if (JSON.stringify(selectedServiceIds) !== JSON.stringify(initialServiceIds)) {
                await appointmentService.updateAppointmentServices(appointmentId, selectedServiceIds)
                console.log(`Updated appointment ${appointmentId} with serviceIds: ${JSON.stringify(selectedServiceIds)}`)
            }

            const productQuantities = recommendedMedicines.map(med => ({
                productId: Number(med.id),
                quantity: Number(med.quantity)
            }))
            console.log("Product quantities to send:", JSON.stringify(productQuantities, null, 2))

            const recordDataToSend = {
                patientId,
                doctorId: Number(doctorId),
                diagnosis: recordData.diagnosis || '',
                serviceIds: selectedServiceIds,
                notes: recordData.notes || '',
                appointmentId: Number(appointmentId),
                productQuantities: productQuantities.length > 0 ? productQuantities : undefined,
            }

            console.log('RecordData to send:', JSON.stringify(recordDataToSend, null, 2))

            const response = await medicalRecordService.createMedicalRecordJson(recordDataToSend)
            console.log("Create Medical Record Response:", JSON.stringify(response, null, 2))
            await appointmentService.updateAppointmentStatus(appointmentId, "WAITING_PAYMENT")
            alert("Hồ sơ bệnh án đã được tạo thành công và cuộc hẹn đang chờ thanh toán!")
            setRecordData({ patientId: "", diagnosis: "", serviceIds: [], notes: "" })
            setSelectedFiles([])
            setSelectedServiceIds([])
            setRecommendedMedicines([])
            navigate("/dashboard/doctor/appointments", { state: { refresh: true } })
        } catch (error) {
            console.error("Error creating medical record:", error.response?.data, error.message)
            if (error.response?.status === 401) {
                setError("Không thể xác thực. Vui lòng kiểm tra phiên đăng nhập.")
            } else {
                setError("Có lỗi xảy ra khi tạo hồ sơ bệnh án: " + (error.response?.data?.message || error.message))
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="records-container">
                <div className="records-content">
                    <div className="records-header">
                        <h1 className="records-title">Tạo hồ sơ bệnh án</h1>
                    </div>
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="records-container">
                <div className="records-content">
                    <div className="records-header">
                        <h1 className="records-title">Tạo hồ sơ bệnh án</h1>
                        {initialPatientName && (
                            <p className="records-subtitle">
                                Đối với: {initialPatientName} (Cuộc hẹn ID: {appointmentId})
                            </p>
                        )}
                    </div>
                    <div className="error-message">{error}</div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/dashboard/doctor/appointments")}
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="records-container">
            <div className="records-content">
                <div className="records-header">
                    <h1 className="records-title">Tạo hồ sơ bệnh án</h1>
                    {initialPatientName && (
                        <p className="records-subtitle">
                            Đối với: {initialPatientName} (Cuộc hẹn ID: {appointmentId})
                        </p>
                    )}
                </div>

                <div className="records-card">
                    <div className="records-card-header">
                        <Clipboard className="records-card-header-icon" />
                        <span className="records-card-header-text">Thông tin hồ sơ bệnh án</span>
                    </div>

                    <form onSubmit={handleSubmit} className="record-form">
                        <div className="form-grid-medical">
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
                                    <div className="search-container">
                                        <Search size={16} style={{ marginRight: "8px", position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)" }} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="form-control search-input"
                                            placeholder="Tìm kiếm thuốc..."
                                            style={{ paddingLeft: "32px" }}
                                        />
                                        {searchQuery && filteredProducts.length > 0 && (
                                            <div className="medication-dropdown-menu">
                                                {filteredProducts.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="medication-dropdown-item"
                                                        onClick={() => addMedicine(product.name)}
                                                    >
                                                        <span className="medication-name">{product.name}</span>
                                                        {product.description && (
                                                            <span className="medication-description">{product.description}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {searchQuery && filteredProducts.length === 0 && (
                                            <div className="medication-dropdown-menu empty">
                                                Không tìm thấy thuốc phù hợp
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="medications-list-container">
                                    {recommendedMedicines.length > 0 ? (
                                        recommendedMedicines.map((med) => (
                                            <div key={med.id} className="medication-card simplified">
                                                <div className="medication-name">{med.name}</div>
                                                <div className="medication-controls">
                                                    <button
                                                        type="button"
                                                        className="quantity-btn minus"
                                                        onClick={() => handleMedicineQuantity(med.id, -1)}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    {editingQuantityId === med.id ? (
                                                        <input
                                                            type="number"
                                                            value={tempQuantity}
                                                            onChange={(e) => handleQuantityInputChange(med.id, e.target.value)}
                                                            onBlur={() => handleQuantityInputBlur(med.id)}
                                                            className="quantity-input"
                                                            min="0"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span
                                                            className="medication-quantity"
                                                            onClick={() => handleQuantityClick(med.id, med.quantity)}
                                                        >
                                                            {med.quantity}
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="quantity-btn plus"
                                                        onClick={() => handleMedicineQuantity(med.id, 1)}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="remove-medicine-button"
                                                        onClick={() => removeMedicine(med.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-message">Chưa có thuốc được chọn</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <FileText size={20} />
                                    <h3>Hình ảnh / Tài liệu</h3>
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
                                                            <img src={fileObj.preview} alt={`Preview ${index}`} className="file-preview-image" />
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
                                    <Clipboard size={20} />
                                    <h3>Dịch vụ đã chọn</h3>
                                </div>
                                <div className="form-group">
                                    <label>
                                        <span className="required">*</span> Dịch vụ
                                    </label>
                                    <div className="dropdown-container" ref={dropdownRef}>
                                        <div
                                            className="dropdown"
                                            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                                        >
                                            <Clipboard size={16} style={{ marginRight: "8px" }} />
                                            <span>Chọn dịch vụ</span>
                                            <ChevronDown size={16} className={showServiceDropdown ? "rotated" : ""} />
                                        </div>
                                        {showServiceDropdown && (
                                            <div className="dropdown-menu">
                                                <div className="dropdown-search">
                                                    <Search size={16} style={{ marginRight: "8px" }} />
                                                    <input
                                                        type="text"
                                                        value={serviceSearchQuery}
                                                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                                                        placeholder="Tìm kiếm dịch vụ..."
                                                        className="dropdown-search-input"
                                                    />
                                                </div>
                                                {filteredServices.length > 0 ? (
                                                    filteredServices.map((service) => (
                                                        <div
                                                            key={service.id}
                                                            className="dropdown-item"
                                                            onClick={() => handleServiceToggle(service.id)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedServiceIds.includes(service.id)}
                                                                readOnly
                                                            />
                                                            {service.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="dropdown-item empty">
                                                        Không tìm thấy dịch vụ phù hợp
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="services-list-container">
                                    {selectedServiceIds.length > 0 ? (
                                        <ul className="services-list">
                                            {selectedServiceIds.map((serviceId) => {
                                                const service = services.find(s => s.id === serviceId)
                                                return (
                                                    <li key={serviceId} className="service-item">
                                                        {service?.name || `Dịch vụ ID: ${serviceId}`}
                                                        <button
                                                            type="button"
                                                            className="remove-service-button"
                                                            onClick={() => handleServiceToggle(serviceId)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="empty-message">Chưa có dịch vụ được chọn</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate("/dashboard/doctor/appointments")}
                            >
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