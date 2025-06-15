"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./doctor-records.css"
import { Upload, Trash2, User, FileText, Stethoscope, Pill, StickyNote, Minus, Plus, ChevronDown } from "lucide-react"

export default function CreateMedicalRecord() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState([])
    const [selectedFiles, setSelectedFiles] = useState([])
    const [medications, setMedications] = useState([
        { id: 1, name: "Chloramphenicol", quantity: 3 },
        { id: 2, name: "Malachite Green", quantity: 1 },
    ])
    const [selectedMedication, setSelectedMedication] = useState("Malachite Green")
    const [showMedicationDropdown, setShowMedicationDropdown] = useState(false)

    const availableMedications = [
        "Malachite Green",
        "Chloramphenicol",
        "Methylene Blue",
        "Salt (NaCl)",
        "Potassium Permanganate",
        "Formalin",
        "Acriflavine",
        "Copper Sulfate",
    ]

    const [recordData, setRecordData] = useState({
        patientId: "",
        diagnosis: "",
        prescription: "",
        notes: "",
        recordFileUrl: "",
    })

    // Fetch patients on component mount
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true)
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))
                setPatients([
                    { id: 1, name: "Nguyễn Văn A", phone: "0352195876", email: "nguyenvana@gmail.com" },
                    { id: 2, name: "Trần Thị B", phone: "0987654321", email: "tranthib@gmail.com" },
                    { id: 3, name: "Lê Văn C", phone: "0123456789", email: "levanc@gmail.com" },
                ])
            } catch (error) {
                console.error("Error fetching patients:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPatients()
    }, [])

    const handleBackHome = () => {
        navigate("/")
    }

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

        const newFiles = files.map((file) => ({
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

    const handleMedicationQuantity = (id, change) => {
        setMedications((prev) =>
            prev
                .map((med) => (med.id === id ? { ...med, quantity: Math.max(0, med.quantity + change) } : med))
                .filter((med) => med.quantity > 0),
        )
    }

    const addMedication = () => {
        if (!selectedMedication) return

        // Check if medication already exists
        const exists = medications.some((med) => med.name.toLowerCase() === selectedMedication.toLowerCase())

        if (!exists) {
            setMedications((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: selectedMedication,
                    quantity: 1,
                },
            ])
        } else {
            // If exists, increase quantity
            setMedications((prev) =>
                prev.map((med) =>
                    med.name.toLowerCase() === selectedMedication.toLowerCase() ? { ...med, quantity: med.quantity + 1 } : med,
                ),
            )
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!recordData.patientId || !recordData.diagnosis) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc!")
            return
        }

        try {
            setLoading(true)

            // Prepare data for submission
            const formData = new FormData()

            // Add record data
            Object.keys(recordData).forEach((key) => {
                if (recordData[key]) {
                    formData.append(key, recordData[key])
                }
            })

            // Add medications to prescription
            const prescriptionData = medications.map((med) => `${med.name}: ${med.quantity}`).join("\n")
            formData.append("prescription", prescriptionData)

            // Add files
            selectedFiles.forEach((fileObj, index) => {
                formData.append(`files`, fileObj.file)
            })

            // Simulate API call
            console.log("Submitting medical record:", recordData)
            console.log("Medications:", medications)
            await new Promise((resolve) => setTimeout(resolve, 1500))

            alert("Hồ sơ bệnh án đã được tạo thành công!")

            // Reset form
            setRecordData({
                patientId: "",
                diagnosis: "",
                prescription: "",
                notes: "",
                recordFileUrl: "",
            })
            setSelectedFiles([])
            setMedications([])
        } catch (error) {
            console.error("Error creating medical record:", error)
            alert("Có lỗi xảy ra khi tạo hồ sơ bệnh án!")
        } finally {
            setLoading(false)
        }
    }

    const selectedPatient = patients.find((p) => p.id === Number.parseInt(recordData.patientId))

    return (
        <div className="records-container">
            <div className="records-content">
                <div className="records-header">
                    <h1>Tạo hồ sơ bệnh án</h1>
                </div>

                <div className="create-record-form-container">
                    <form onSubmit={handleSubmit} className="record-form">
                        <div className="form-grid-medical">
                            {/* Patient Selection */}
                            <div className="form-section">
                                <div className="section-header">
                                    <User size={20} />
                                    <h3>Thông tin bệnh nhân</h3>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="required">*</span> Chọn bệnh nhân
                                    </label>
                                    <select
                                        name="patientId"
                                        value={recordData.patientId}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="">-- Chọn bệnh nhân --</option>
                                        {patients.map((patient) => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.name} - {patient.phone}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPatient && (
                                    <div className="patient-info">
                                        <p>
                                            <strong>Tên:</strong> {selectedPatient.name}
                                        </p>
                                        <p>
                                            <strong>Điện thoại:</strong> {selectedPatient.phone}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {selectedPatient.email}
                                        </p>
                                    </div>
                                )}

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
                                                            <img src={fileObj.preview || "/placeholder.svg"} alt={`Preview ${index}`} />
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

                            {/* Medical Information */}
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

                            {/* Medication Management */}
                            <div className="form-section">
                                <div className="section-header">
                                    <Pill size={20} />
                                    <h3>Tìm thuốc</h3>
                                </div>

                                <div className="form-group">
                                    <div className="medication-dropdown-container">
                                        <div
                                            className="medication-dropdown"
                                            onClick={() => setShowMedicationDropdown(!showMedicationDropdown)}
                                        >
                                            <span>{selectedMedication}</span>
                                            <ChevronDown size={16} className={showMedicationDropdown ? "rotated" : ""} />
                                        </div>

                                        {showMedicationDropdown && (
                                            <div className="medication-dropdown-menu">
                                                {availableMedications.map((med) => (
                                                    <div
                                                        key={med}
                                                        className="medication-dropdown-item"
                                                        onClick={() => {
                                                            setSelectedMedication(med)
                                                            setShowMedicationDropdown(false)
                                                            addMedication()
                                                        }}
                                                    >
                                                        {med}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="medications-list-container">
                                    {medications.map((med) => (
                                        <div key={med.id} className="medication-item-new">
                                            <div className="medication-name">{med.name}</div>
                                            <div className="medication-controls">
                                                <button
                                                    type="button"
                                                    className="quantity-btn minus"
                                                    onClick={() => handleMedicationQuantity(med.id, -1)}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="medication-quantity">{med.quantity}</span>
                                                <button
                                                    type="button"
                                                    className="quantity-btn plus"
                                                    onClick={() => handleMedicationQuantity(med.id, 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => handleMedicationQuantity(med.id, -med.quantity)}
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
                            <button type="button" className="cancel-button" onClick={() => navigate("/dashboard/doctor/records")}>
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
