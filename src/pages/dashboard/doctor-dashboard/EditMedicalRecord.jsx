"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Clipboard, User, Calendar, Clock, Stethoscope, FileText, Pill, Upload, Trash2, ChevronDown, Plus, Minus, ZoomIn, ZoomOut, X, Search } from "lucide-react";
import medicalRecordService from "../../../services/medicalRecordService";
import appointmentService from "../../../services/appointmentService";
import "./EditMedicalRecord.css";

const formatDateTime = (dateTime, fallbackDate, fallbackTime) => {
    if (!dateTime) {
        if (fallbackDate && fallbackTime) {
            try {
                const combinedDateTime = new Date(fallbackDate + 'T' + fallbackTime);
                if (!isNaN(combinedDateTime.getTime())) {
                    return combinedDateTime.toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    });
                }
            } catch {
                return "Không có thông tin lịch hẹn";
            }
        }
        return "Không có thông tin lịch hẹn";
    }
    try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) return "Không có thông tin lịch hẹn";
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "Không có thông tin lịch hẹn";
    }
};

const formatDate = date => {
    if (!date) return "N/A";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "N/A";
        return d.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    } catch {
        return "N/A";
    }
};

export default function EditMedicalRecord() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [medicalRecord, setMedicalRecord] = useState(null);
    const [formData, setFormData] = useState({
        diagnosis: "",
        notes: "",
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [recommendedMedicines, setRecommendedMedicines] = useState([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [serviceSearchQuery, setServiceSearchQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingQuantityId, setEditingQuantityId] = useState(null);
    const [tempQuantity, setTempQuantity] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serviceError, setServiceError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const dropdownRef = useRef(null);
    const imageContainerRef = useRef(null);

    // Filter services for service search
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!state?.medicalRecordData) {
            console.error("No medicalRecordData found in state");
            setError("Không tìm thấy thông tin hồ sơ bệnh án.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const record = state.medicalRecordData;
                console.log("Medical Record Data:", JSON.stringify(record, null, 2));
                console.log("Patient Date of Birth:", record.patient?.dateOfBirth);
                console.log("Service Data:", {
                    appointmentServiceId: record.appointment?.service?.id,
                    serviceId: record.serviceId,
                    serviceName: record.service,
                    services: record.appointment?.services,
                });

                setMedicalRecord(record);

                const fileUrls = record.recordFileUrl ? record.recordFileUrl.split(";").filter(url => url.trim()) : [];
                const imageUrls = fileUrls.filter(url => url.match(/\.(jpg|jpeg|png)$/i));
                setExistingFiles(
                    fileUrls.map(url => ({
                        url: url.startsWith("/uploads/") ? url : "/uploads/" + url,
                        isImage: imageUrls.includes(url),
                    }))
                );

                setFormData({
                    diagnosis: record.diagnosis || "",
                    notes: record.notes || "",
                });

                const initialMedicines = Array.isArray(record.recommendedProducts)
                    ? record.recommendedProducts
                        .filter(p => (p.productId || p.product?.id) && p.quantity > 0)
                        .map(p => ({
                            id: p.productId || p.product?.id,
                            name: p.product?.name || "Unknown",
                            quantity: p.quantity || 1,
                        }))
                    : [];
                setRecommendedMedicines(initialMedicines);
                console.log("Initial recommendedMedicines:", JSON.stringify(initialMedicines, null, 2));

                const [productsData, servicesData] = await Promise.all([
                    medicalRecordService.getProductsMedicine().catch(err => {
                        console.error("Failed to fetch products:", err);
                        setError("Không thể tải danh sách thuốc: " + (err.response?.data?.message || err.message));
                        return [];
                    }),
                    appointmentService.getMedicalServices().catch(err => {
                        console.error("Failed to fetch services:", err);
                        setServiceError("Không thể tải danh sách dịch vụ: " + (err.response?.data?.message || err.message));
                        return [];
                    }),
                ]);
                setProducts(productsData);
                setServices(servicesData);
                console.log("Services fetched:", JSON.stringify(servicesData, null, 2));

                if (servicesData.length === 0) {
                    setServiceError("Danh sách dịch vụ trống. Vui lòng kiểm tra API.");
                } else {
                    let initialServiceIds = [];
                    if (record.appointment?.services?.length > 0) {
                        initialServiceIds = record.appointment.services
                            .map(s => s.id)
                            .filter(id => servicesData.some(service => service.id === id));
                    } else if (record.serviceId) {
                        if (servicesData.some(s => s.id === record.serviceId)) {
                            initialServiceIds = [record.serviceId];
                        }
                    } else if (record.service) {
                        const matchedService = servicesData.find(s => s.name.toLowerCase() === record.service.toLowerCase());
                        if (matchedService) {
                            initialServiceIds = [matchedService.id];
                            console.log("Matched service:", matchedService);
                        } else {
                            console.warn("No matching service found for:", record.service);
                            setServiceError("Không tìm thấy dịch vụ phù hợp với: " + record.service);
                        }
                    }
                    setSelectedServiceIds(initialServiceIds);
                    console.log("Initial selectedServiceIds:", initialServiceIds);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Không thể tải dữ liệu: " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [state]);

    useEffect(() => {
        const handleWheel = e => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 3));
        };

        const imageContainer = imageContainerRef.current;
        if (selectedImage && imageContainer) {
            imageContainer.addEventListener("wheel", handleWheel, { passive: false });
        }

        return () => {
            if (imageContainer) {
                imageContainer.removeEventListener("wheel", handleWheel);
            }
        };
    }, [selectedImage]);

    useEffect(() => {
        const handleKeyDown = e => {
            if (e.key === "Escape") handleCloseModal();
        };
        if (selectedImage) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage]);

    useEffect(() => {
        const handleClickOutside = event => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowServiceDropdown(false);
                setServiceSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value || "",
        }));
    };

    const handleFileChange = e => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const maxFileSize = 5 * 1024 * 1024;
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

        const validFiles = files.filter(file => {
            if (file.size > maxFileSize) {
                setError("File " + file.name + " quá lớn! Kích thước tối đa là 5MB.");
                return false;
            }
            if (!allowedTypes.includes(file.type)) {
                setError("File " + file.name + " có định dạng không được hỗ trợ!");
                return false;
            }
            return true;
        });

        const newFiles = validFiles.map(file => ({
            file,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
            name: file.name,
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index, isExisting = false) => {
        if (isExisting) {
            setExistingFiles(prev => prev.filter((_, i) => i !== index));
        } else {
            setSelectedFiles(prev => {
                const updated = prev.filter((_, i) => i !== index);
                prev[index]?.preview && URL.revokeObjectURL(prev[index].preview);
                return updated;
            });
        }
    };

    const handleMedicineQuantity = (id, change) => {
        setRecommendedMedicines(prev =>
            prev
                .map(med => (med.id === id ? { ...med, quantity: Math.max(1, med.quantity + change) } : med))
                .filter(med => med.quantity > 0)
        );
    };

    const handleQuantityInputChange = (id, value) => {
        setTempQuantity(value);
    };

    const handleQuantityInputBlur = id => {
        const newQuantity = parseInt(tempQuantity, 10);
        if (!isNaN(newQuantity) && newQuantity >= 1) {
            setRecommendedMedicines(prev => prev.map(med => (med.id === id ? { ...med, quantity: newQuantity } : med)));
        }
        setEditingQuantityId(null);
        setTempQuantity("");
    };

    const handleQuantityClick = (id, quantity) => {
        setEditingQuantityId(id);
        setTempQuantity(quantity.toString());
    };

    const removeMedicine = id => {
        setRecommendedMedicines(prev => prev.filter(med => med.id !== id));
    };

    const addMedicine = productName => {
        const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
        if (!product) {
            setError("Không tìm thấy thuốc: " + productName);
            return;
        }
        setRecommendedMedicines(prev => {
            const exists = prev.find(med => med.id === product.id);
            if (exists) {
                return prev.map(med => (med.id === product.id ? { ...med, quantity: med.quantity + 1 } : med));
            }
            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                },
            ];
        });
        setSearchQuery("");
    };

    const handleServiceToggle = serviceId => {
        setSelectedServiceIds(prev => {
            const updated = prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId];
            console.log("Selected serviceIds:", updated);
            return updated;
        });
        setServiceError(null);
    };

    const handleImageClick = url => {
        setSelectedImage(url);
        setZoomLevel(1);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
        setZoomLevel(1);
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
    };

    const handleSave = async () => {
        try {
            console.log("Saving data:", {
                diagnosis: formData.diagnosis,
                serviceIds: selectedServiceIds,
                notes: formData.notes,
                recommendedMedicines,
                newFiles: selectedFiles.map(f => f.name),
                existingFiles: existingFiles.map(f => f.url),
            });

            if (!formData.diagnosis?.trim()) {
                setError("Chẩn đoán không được để trống!");
                return;
            }
            if (selectedServiceIds.length === 0) {
                setServiceError("Vui lòng chọn ít nhất một dịch vụ!");
                return;
            }

            const invalidMedicines = recommendedMedicines.filter(
                med => !med.id || isNaN(med.id) || med.quantity <= 0 || !Number.isInteger(Number(med.quantity))
            );
            if (invalidMedicines.length > 0) {
                setError("Danh sách thuốc chứa dữ liệu không hợp lệ!");
                console.error("Invalid recommendedMedicines:", JSON.stringify(invalidMedicines, null, 2));
                return;
            }

            const confirmSave = window.confirm("Bạn chắc chắn muốn lưu?");
            if (!confirmSave) {
                console.log("User cancelled save operation");
                return;
            }

            setLoading(true);
            setError(null);
            setServiceError(null);

            const updatedData = {
                diagnosis: formData.diagnosis.trim(),
                serviceIds: selectedServiceIds.map(Number),
                notes: formData.notes.trim() || "",
                recommendedProducts: recommendedMedicines
                    .filter(med => med.id && med.quantity > 0)
                    .map(med => ({
                        productId: Number(med.id),
                        quantity: Number(med.quantity),
                    })),
                files: selectedFiles.map(fileObj => fileObj.file).filter(file => file && file.size > 0),
                filesToDelete: medicalRecord.recordFileUrl
                    ? medicalRecord.recordFileUrl
                        .split(";")
                        .filter(url => url.trim())
                        .filter(url => !existingFiles.some(f => f.url === "/uploads/" + url || f.url === url))
                        .map(url => (url.startsWith("/uploads/") ? url : "/uploads/" + url))
                    : [],
            };

            console.log("Sending updatedData to backend:", JSON.stringify(updatedData, null, 2));

            const response = await medicalRecordService.updateMedicalRecord(medicalRecord.id, updatedData);
            console.log("Update response:", JSON.stringify(response, null, 2));

            if (
                medicalRecord.appointment &&
                JSON.stringify(selectedServiceIds) !== JSON.stringify(
                    medicalRecord.appointment.services?.map(s => s.id) || [medicalRecord.appointment.service?.id]
                )
            ) {
                try {
                    await appointmentService.updateAppointmentServices(medicalRecord.appointment.id, selectedServiceIds);
                    console.log("Appointment services updated successfully");
                } catch (err) {
                    console.warn("Failed to update appointment services:", err);
                    setError("Cập nhật hồ sơ thành công nhưng không thể cập nhật dịch vụ cuộc hẹn.");
                }
            }

            navigate(state?.returnPath || "/dashboard/doctor/patients", {
                state: { activeSection: "health" },
            });
        } catch (err) {
            console.error("Failed to update medical record:", {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
            setError("Không thể cập nhật hồ sơ bệnh án: " + (err.response?.data?.message || err.message));
            if (err.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        const returnPath = state?.returnPath || "/dashboard/doctor/patients";
        navigate(returnPath, { state: { activeSection: "health" } });
    };

    if (loading) {
        return (
            <div className="d-edit-medical-record">
                <div className="d-edit-medical-record__loading">
                    <div className="d-edit-medical-record__spinner"></div>
                    <p>Đang tải thông tin hồ sơ bệnh án...</p>
                </div>
            </div>
        );
    }

    if (error || !medicalRecord) {
        return (
            <div className="d-edit-medical-record">
                <div className="d-edit-medical-record__error">
                    <p>{error || "Không tìm thấy thông tin hồ sơ bệnh án."}</p>
                    <button onClick={handleBack} className="d-edit-medical-record__back-button">
                        <ArrowLeft size={16} className="d-edit-medical-record__icon" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const patient = medicalRecord.patient || {};
    const doctor = medicalRecord.doctor || {};
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    const getFullUrl = url => (url.startsWith("http") ? url : baseUrl + (url.startsWith("/uploads/") ? url : "/uploads/" + url));

    return (
        <div className="d-edit-medical-record">
            <div className="d-edit-medical-record__container">
                <div className="d-edit-medical-record__header">
                    <h1 className="d-edit-medical-record__title">Chỉnh sửa hồ sơ bệnh án</h1>
                </div>

                <div className="d-edit-medical-record__card">
                    <div className="d-edit-medical-record__card-header">
                        <div className="d-edit-medical-record__card-header-content">
                            <Clipboard className="d-edit-medical-record__card-header-icon" />
                            <span className="d-edit-medical-record__card-header-text">Thông tin hồ sơ bệnh án</span>
                        </div>
                    </div>

                    <div className="d-edit-medical-record__section">
                        <h2 className="d-edit-medical-record__section-title">Thông tin bệnh nhân</h2>
                        <div className="d-edit-medical-record__info-group">
                            <div className="d-edit-medical-record__info-item">
                                <User size={18} className="d-edit-medical-record__icon" />
                                <div>
                                    <span className="d-edit-medical-record__label">Tên</span>
                                    <p className="d-edit-medical-record__value">{patient.name || "Withheld"}</p>
                                </div>
                            </div>
                            <div className="d-edit-medical-record__info-item">
                                <User size={18} className="d-edit-medical-record__icon" />
                                <div>
                                    <span className="d-edit-medical-record__label">Giới tính</span>
                                    <p className="d-edit-medical-record__value">{patient.gender || "Withheld"}</p>
                                </div>
                            </div>
                            <div className="d-edit-medical-record__info-item">
                                <Calendar size={18} className="d-edit-medical-record__icon" />
                                <div>
                                    <span className="d-edit-medical-record__label">Ngày sinh</span>
                                    <p className="d-edit-medical-record__value">{formatDate(patient.dateOfBirth)}</p>
                                </div>
                            </div>
                            <div className="d-edit-medical-record__info-item">
                                <Stethoscope size={18} className="d-edit-medical-record__icon" />
                                <div>
                                    <span className="d-edit-medical-record__label">Bác sĩ</span>
                                    <p className="d-edit-medical-record__value">{doctor.name || "Withheld"}</p>
                                </div>
                            </div>
                            <div className="d-edit-medical-record__info-item">
                                <Calendar size={18} className="d-edit-medical-record__icon" />
                                <div>
                                    <span className="d-edit-medical-record__label">Ngày tạo hồ sơ</span>
                                    <p className="d-edit-medical-record__value">{formatDate(medicalRecord.createdAt || medicalRecord.date)}</p>
                                </div>
                            </div>
                            <div className="d-edit-medical-record__info-item">
                                <Clock size={18} className="d-edit-medical-record__icon" />
                                <div>
                                    <span className="d-edit-medical-record__label">Ngày giờ khám</span>
                                    <p className="d-edit-medical-record__value">
                                        {formatDateTime(medicalRecord.appointment?.appointmentTime, medicalRecord.date, medicalRecord.time)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-edit-medical-record__section">
                        <h2 className="d-edit-medical-record__section-title">Thông tin bệnh án</h2>
                        {error && <div className="d-edit-medical-record__error-message">{error}</div>}
                        {serviceError && <div className="d-edit-medical-record__error-message">{serviceError}</div>}
                        <div className="d-edit-medical-record__form-group">
                            <label className="d-edit-medical-record__label">
                                <Stethoscope size={18} className="d-edit-medical-record__icon" />
                                Chẩn đoán
                            </label>
                            <input
                                type="text"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleInputChange}
                                className="d-edit-medical-record__input"
                                placeholder="Nhập chẩn đoán"
                                required
                            />
                        </div>
                        <div className="d-edit-medical-record__form-group">
                            <label className="d-edit-medical-record__label">
                                <Clipboard size={18} className="d-edit-medical-record__icon" />
                                Dịch vụ
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
                                                onChange={e => setServiceSearchQuery(e.target.value)}
                                                placeholder="Tìm kiếm dịch vụ..."
                                                className="dropdown-search-input"
                                            />
                                        </div>
                                        {filteredServices.length > 0 ? (
                                            filteredServices.map(service => (
                                                <div
                                                    key={'service-' + service.id}
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
                                            <div className="dropdown-item empty">Không tìm thấy dịch vụ phù hợp</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="services-list-container">
                                {selectedServiceIds.length > 0 ? (
                                    <ul className="services-list">
                                        {selectedServiceIds.map(serviceId => {
                                            const service = services.find(s => s.id === serviceId);
                                            return (
                                                <li key={'service-' + serviceId} className="service-item">
                                                    {service?.name || `Dịch vụ ID: ${serviceId}`}
                                                    <button
                                                        type="button"
                                                        className="remove-service-button"
                                                        onClick={() => handleServiceToggle(serviceId)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="empty-message">Chưa có dịch vụ được chọn</div>
                                )}
                            </div>
                        </div>
                        <div className="d-edit-medical-record__form-group">
                            <label className="d-edit-medical-record__label">
                                <FileText size={18} className="d-edit-medical-record__icon" />
                                Ghi chú
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="d-edit-medical-record__textarea"
                                placeholder="Nhập ghi chú"
                            />
                        </div>
                        <div className="d-edit-medical-record__form-group">
                            <label className="d-edit-medical-record__label">
                                <Pill size={18} className="d-edit-medical-record__icon" />
                                Sản phẩm đề xuất
                            </label>
                            <div className="search-container">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="d-edit-medical-record__input"
                                    placeholder="Tìm kiếm thuốc..."
                                />
                                {searchQuery && (
                                    <div className="medication-dropdown-menu">
                                        {products
                                            .filter(
                                                p =>
                                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    (p.description &&
                                                        p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                            )
                                            .map(product => (
                                                <div
                                                    key={'product-' + product.id}
                                                    className="medication-dropdown-item"
                                                    onClick={() => addMedicine(product.name)}
                                                >
                                                    <span className="medication-name">{product.name}</span>
                                                    {product.description && (
                                                        <span className="medication-description">{product.description}</span>
                                                    )}
                                                </div>
                                            ))}
                                        {searchQuery &&
                                            products.filter(
                                                p =>
                                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    (p.description &&
                                                        p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                            ).length === 0 && (
                                                <div className="medication-dropdown-menu empty">
                                                    Không tìm thấy thuốc phù hợp
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                            <div className="medications-list-container">
                                {recommendedMedicines.map(med => (
                                    <div key={'med-' + med.id} className="medication-card simplified">
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
                                                    onChange={e => handleQuantityInputChange(med.id, e.target.value)}
                                                    onBlur={() => handleQuantityInputBlur(med.id)}
                                                    className="quantity-input"
                                                    min="1"
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
                                ))}
                                {recommendedMedicines.length === 0 && (
                                    <div className="empty-message">Chưa có thuốc được chọn</div>
                                )}
                            </div>
                        </div>
                        <div className="d-edit-medical-record__form-group">
                            <label className="d-edit-medical-record__label">
                                <FileText size={18} className="d-edit-medical-record__icon" />
                                Hình ảnh / Tài liệu
                            </label>
                            <div className="file-upload-container">
                                {existingFiles.length > 0 && (
                                    <div className="file-preview-container">
                                        {existingFiles.map((fileObj, index) => (
                                            <div key={'existing-' + index} className="file-preview-item">
                                                {fileObj.isImage ? (
                                                    <img
                                                        src={getFullUrl(fileObj.url)}
                                                        alt={'Existing-' + index}
                                                        className="file-preview-image"
                                                        onClick={() => handleImageClick(getFullUrl(fileObj.url))}
                                                    />
                                                ) : (
                                                    <div className="file-icon">
                                                        <FileText size={32} />
                                                        <span>{fileObj.url.split("/").pop()}</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="remove-file-button"
                                                    onClick={() => removeFile(index, true)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                            <div key={'new-' + index} className="file-preview-item">
                                                {fileObj.file.type.startsWith("image/") ? (
                                                    <img
                                                        src={fileObj.preview}
                                                        alt={'Preview-' + index}
                                                        className="file-preview-image"
                                                        onClick={() => handleImageClick(fileObj.preview)}
                                                    />
                                                ) : (
                                                    <div className="file-icon">
                                                        <FileText size={32} />
                                                        <span>{fileObj.name}</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="remove-file-button"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

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
                                        style={{ transform: 'scale(' + zoomLevel + ')', transition: "transform 0.2s" }}
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

                    <div className="d-edit-medical-record__actions">
                        <button onClick={handleBack} className="d-edit-medical-record__back-button">
                            <ArrowLeft size={16} className="d-edit-medical-record__icon" />
                            Quay lại
                        </button>
                        <button
                            onClick={handleSave}
                            className="d-edit-medical-record__save-button"
                            disabled={loading}
                        >
                            <Save size={16} className="d-edit-medical-record__icon" />
                            {loading ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}