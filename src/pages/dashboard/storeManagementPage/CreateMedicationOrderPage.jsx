"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Search, Save, Package, Eye, X, CheckCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import appointmentService from "../../../services/appointmentService";
import orderService from "../../../services/orderService";
import medicalRecordService from "../../../services/medicalRecordService";
import productService from "../../../services/productService";
import Pagination from "../../../components/storeManagement/Pagination";
import "./STM-Style/STM-globals.css";
import "../../../styles/unified-table.css";

// Custom debounce hook
const useDebounce = (callback, delay) => {
    const [timeoutId, setTimeoutId] = useState(null);
    return useCallback(
        (...args) => {
            if (timeoutId) clearTimeout(timeoutId);
            const id = setTimeout(() => callback(...args), delay);
            setTimeoutId(id);
        },
        [timeoutId, callback, delay]
    );
};

// Hàm ánh xạ trạng thái sang văn bản hiển thị
const mapStatusToDisplay = (status) => {
    switch (status) {
        case "COMPLETED":
            return "Đã thanh toán tiền";
        case "PENDING":
            return "Chờ giao thuốc";
        case "NOT_BUY":
            return "Không mua thuốc";
        case "DELIVERED":
            return "Đã giao thuốc";
        default:
            return status || "Chưa xác định";
    }
};

// Normalize image URL
const getFullUrl = (url) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    const fallbackImage = "https://placehold.co/50x50?text=Image";
    if (!url || url.trim() === "") {
        console.log("Image URL is null or empty, using fallback:", fallbackImage);
        return fallbackImage;
    }
    const normalizedUrl = url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
    console.log("Normalized image URL:", normalizedUrl);
    return normalizedUrl;
};

const CreateMedicationOrderPage = ({ onBack, onOrderCreated, selectedOrder = null }) => {
    const [appointmentId, setAppointmentId] = useState("");
    const [appointment, setAppointment] = useState(null);
    const [medications, setMedications] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
    const [errors, setErrors] = useState({});
    const [lastFetchedId, setLastFetchedId] = useState(null);
    const [prescriptionStatus, setPrescriptionStatus] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    const fallbackImage = "https://placehold.co/50x50?text=Image";

    const handleImageError = (e) => {
        console.warn(`Failed to load image: ${e.target.src}`);
        e.target.src = fallbackImage;
    };

    // Fetch all appointments with status "COMPLETED"
    const fetchAllAppointments = async () => {
        try {
            setIsLoading(true);
            const appointmentsData = await appointmentService.getAllAppointments();
            const mappedAppointments = await Promise.all(
                appointmentsData.map(async (appt) => {
                    const invoice = await appointmentService.getAppointmentInvoice(appt.id).catch(() => null);
                    const status = appt.status || "PENDING";
                    const prescriptionStatus = invoice?.prescriptionStatus || "NOT_BUY";
                    if (!appt.status) {
                        console.warn(`Appointment ID ${appt.id} has undefined status`);
                    }
                    if (!invoice?.prescriptionStatus) {
                        console.warn(`Appointment ID ${appt.id} has undefined prescriptionStatus`);
                    }
                    return {
                        id: appt.id,
                        patientName: appt.patient?.name || appt.patientName || "N/A",
                        appointmentDate: appt.appointmentDate
                            ? new Date(appt.appointmentDate).toLocaleDateString("vi-VN", {
                                timeZone: "Asia/Ho_Chi_Minh",
                            })
                            : "N/A",
                        prescriptionStatus,
                        status,
                    };
                })
            );
            const completedAppointments = mappedAppointments.filter(
                (appt) => appt.status === "COMPLETED"
            );
            setAppointments(completedAppointments);
            setFilteredAppointments(completedAppointments);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            setErrors({ general: "Không thể tải danh sách cuộc hẹn đã hoàn thành." });
            setAppointments([]);
            setFilteredAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch appointment details by ID
    const fetchAppointment = async (id) => {
        if (!id || id === lastFetchedId) return;
        setIsLoading(true);
        setErrors({});
        setMedications([]);
        setAppointment(null);
        setPrescriptionStatus(null);
        setLastFetchedId(id);

        try {
            const [appointmentData, invoiceResponse, medicationResponse] = await Promise.all([
                appointmentService.getAppointmentById(id).catch((err) => {
                    console.warn("Error fetching appointment:", err);
                    return null;
                }),
                appointmentService.getAppointmentInvoice(id).catch((err) => {
                    console.warn("No invoice found for appointment ID:", id, err);
                    return null;
                }),
                medicalRecordService.getMedicationsByAppointmentId(id).catch((err) => {
                    console.warn("No medications found for appointment ID:", id, err);
                    return { products: [], prescriptionStatus: "NOT_BUY", totalAmount: 0 };
                }),
            ]);

            if (!appointmentData) {
                setErrors({ general: "Không thể tải thông tin cuộc hẹn. Vui lòng kiểm tra mã cuộc hẹn." });
                setIsLoading(false);
                return;
            }

            if (appointmentData.status !== "COMPLETED") {
                setErrors({
                    general: "Cuộc hẹn này chưa hoàn thành. Chỉ các cuộc hẹn đã hoàn thành mới được phép lấy thuốc.",
                });
                setIsLoading(false);
                return;
            }

            // Map patient name correctly
            const mappedAppointment = {
                ...appointmentData,
                patientName: appointmentData.patient?.name || appointmentData.patientName || "N/A",
                patientEmail: appointmentData.patient?.email || appointmentData.patientEmail || "N/A",
                patientPhone: appointmentData.patient?.phone || appointmentData.patientPhone || "N/A",
            };

            console.log("Fetched appointment data:", appointmentData);
            console.log("Mapped appointment:", mappedAppointment);

            setAppointment(mappedAppointment);

            if (!invoiceResponse) {
                setErrors({ general: "Không tìm thấy hóa đơn cho cuộc hẹn này." });
                setIsLoading(false);
                return;
            }

            const products = medicationResponse?.products || [];
            const prescriptionStatus = invoiceResponse?.prescriptionStatus || medicationResponse?.prescriptionStatus || "NOT_BUY";

            if (prescriptionStatus === "DELIVERED") {
                setErrors({ general: "Đã giao thuốc cho bệnh nhân." });
                setIsLoading(false);
            }

            setPrescriptionStatus(prescriptionStatus);

            if (products.length > 0) {
                const enrichedProducts = await Promise.all(
                    products.map(async (med) => {
                        console.log(`Raw imageUrl for product ${med.name}:`, med.imageUrl);
                        // Fetch product details if imageUrl is missing or invalid
                        let imageUrl = med.imageUrl;
                        if (!imageUrl || imageUrl.trim() === "") {
                            try {
                                const product = await productService.getProductById(med.id);
                                imageUrl = product.imageUrl || "";
                                console.log(`Fetched imageUrl for product ${med.name} from productService:`, imageUrl);
                            } catch (error) {
                                console.warn(`Failed to fetch product details for ID ${med.id}:`, error);
                                imageUrl = "";
                            }
                        }
                        return {
                            productId: med.id,
                            name: med.name || "Không xác định",
                            image: getFullUrl(imageUrl), // Normalize image URL
                            quantity: med.quantity || 1,
                            price: parseFloat(med.price || 0),
                            total: parseFloat(med.totalPrice || med.price * med.quantity || 0),
                            maxQuantity: med.stockQuantity || Infinity,
                        };
                    })
                );
                setMedications(enrichedProducts);
            } else {
                setErrors({ general: "Không có thuốc nào được kê trong cuộc hẹn này." });
            }
        } catch (err) {
            console.error("Unexpected error fetching data:", err);
            setErrors({ general: err.message || "Không thể tải thông tin cuộc hẹn." });
            setAppointment(null);
            setMedications([]);
            setPrescriptionStatus(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search for appointments
    const debouncedSearch = useDebounce((searchTerm) => {
        if (!searchTerm) {
            setFilteredAppointments(appointments);
        } else {
            const filtered = appointments.filter(
                (appt) =>
                    appt.id.toString().includes(searchTerm) ||
                    appt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAppointments(filtered);
        }
    }, 300);

    // Handle appointment selection
    const handleSelectAppointment = (id) => {
        if (expandedRowId === id) {
            // If clicking on the same row, collapse it
            setExpandedRowId(null);
            setAppointment(null);
            setMedications([]);
            setAppointmentId("");
            setLastFetchedId(null);
            setErrors({});
            setPrescriptionStatus(null);
        } else {
            // Expand the new row
            setExpandedRowId(id);
            setAppointmentId(id.toString());
            fetchAppointment(id);
        }
    };

    // Handle close appointment
    const handleCloseAppointment = () => {
        setExpandedRowId(null);
        setAppointment(null);
        setMedications([]);
        setAppointmentId("");
        setLastFetchedId(null);
        setErrors({});
        setPrescriptionStatus(null);
    };

    // Validate order form
    const validateOrderForm = () => {
        const newErrors = {};
        if (!appointment?.userId) newErrors["appointment.userId"] = "Vui lòng chọn một cuộc hẹn hợp lệ.";
        if (!medications || medications.length === 0) newErrors.items = "Phải có ít nhất một sản phẩm.";
        if (prescriptionStatus === "NOT_BUY") newErrors.prescriptionStatus = "Đơn thuốc chưa được thanh toán.";
        if (prescriptionStatus === "DELIVERED") newErrors.prescriptionStatus = "Đơn thuốc đã được giao trước đó.";
        medications.forEach((item, index) => {
            if (!item.productId || typeof item.productId !== "number" || !item.quantity || !item.price) {
                newErrors[`items[${index}]`] = `Thông tin sản phẩm ${item.name} không hợp lệ.`;
            }
            if (item.quantity > item.maxQuantity) {
                newErrors[`items[${index}].quantity`] = `Số lượng sản phẩm ${item.name} vượt quá tồn kho.`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle confirm delivery
    const handleConfirmDelivery = async () => {
        if (!validateOrderForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin đơn hàng.", {
                toastId: `delivery-validation-error-${appointmentId}`,
            });
            return;
        }

        setIsConfirmingDelivery(true);
        try {
            // Validate stock availability
            for (const med of medications) {
                const product = await productService.getProductById(med.productId);
                if (!product || product.stockQuantity < med.quantity) {
                    throw new Error(`Sản phẩm ${med.name} không đủ số lượng trong kho. Còn lại: ${product?.stockQuantity || 0}.`);
                }
            }

            // Prepare order data
            const formattedData = {
                userId: Number(appointment.userId),
                items: medications.map((med) => ({
                    productId: med.productId,
                    productName: med.name,
                    quantity: med.quantity,
                    price: med.price,
                })),
                paymentMethod: "CASH",
                totalAmount: medications.reduce((sum, med) => sum + med.total, 0),
                status: "COMPLETED",
            };

            // Additional validation for order data
            if (!formattedData.userId || typeof formattedData.userId !== "number") {
                throw new Error("ID khách hàng không hợp lệ.");
            }
            if (!formattedData.items || !Array.isArray(formattedData.items) || formattedData.items.length === 0) {
                throw new Error("Danh sách sản phẩm không hợp lệ.");
            }
            if (!formattedData.paymentMethod || formattedData.paymentMethod !== "CASH") {
                throw new Error("Phương thức thanh toán không hợp lệ.");
            }

            console.log("Creating in-store order for medication delivery:", formattedData);

            // Create in-store order (stock is updated by backend)
            const newOrder = await orderService.createInStoreOrder(formattedData);

            // Update prescription status to DELIVERED
            await appointmentService.updatePrescriptionStatus(appointmentId, "DELIVERED");

            toast.success(`Đã giao thành công!`, {
                toastId: `delivery-confirmed-${appointmentId}`,
            });

            // Reset page state to reflect updated data
            handleCloseAppointment(); // Clear form
            await fetchAllAppointments(); // Refresh appointment list
            setLastFetchedId(null); // Allow refetching the same appointment if needed

            // Call onBack only if it exists and is a function
            if (typeof onBack === "function") {
                onBack();
            }
        } catch (err) {
            console.error("Error confirming delivery:", err);
            const errorMessage = err.response?.data?.message || err.message || "Lỗi khi tạo đơn hàng và xác nhận giao đơn thuốc.";
            toast.error(errorMessage, {
                toastId: `delivery-error-${appointmentId}`,
            });
        } finally {
            setIsConfirmingDelivery(false);
        }
    };

    // Handle submit (for "Lưu đơn hàng" button)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) {
            toast.info("Vui lòng đợi dữ liệu đang được tải.", {
                toastId: "medication-order-loading",
            });
            return;
        }

        if (!validateOrderForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin đơn hàng.", {
                toastId: "medication-order-validation-error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Validate stock availability
            for (const med of medications) {
                const product = await productService.getProductById(med.productId);
                if (!product || product.stockQuantity < med.quantity) {
                    throw new Error(`Sản phẩm ${med.name} không đủ số lượng trong kho. Còn lại: ${product?.stockQuantity || 0}.`);
                }
            }

            const formattedData = {
                userId: selectedOrder?.userId || appointment.userId,
                items: medications.map((med) => ({
                    productId: med.productId,
                    productName: med.name,
                    quantity: med.quantity,
                    price: med.price,
                })),
                paymentMethod: "CASH",
                totalAmount: medications.reduce((sum, med) => sum + med.total, 0),
                status: "COMPLETED",
            };

            console.log("Creating Order with Data:", formattedData);
            const newOrder = await orderService.createInStoreOrder(formattedData);

            // Update prescription status to DELIVERED
            await appointmentService.updatePrescriptionStatus(appointmentId, "DELIVERED");

            toast.success(`Đơn hàng thuốc #${newOrder.id.toString().padStart(3, "0")} đã được tạo thành công!`, {
                toastId: `medication-order-created-${newOrder.id}`,
            });

            // Reset page state to reflect updated data
            handleCloseAppointment(); // Clear form
            await fetchAllAppointments(); // Refresh appointment list
            setLastFetchedId(null); // Allow refetching the same appointment if needed

            // Call onBack only if it exists and is a function
            if (typeof onBack === "function") {
                onBack();
            }
        } catch (err) {
            console.error("Error creating medication order:", err);
            const errorMessage = err.response?.data?.message || err.message || "Lỗi khi tạo đơn hàng thuốc.";
            toast.error(errorMessage, {
                toastId: "medication-order-error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fetch appointments on mount
    useEffect(() => {
        fetchAllAppointments();
    }, []);

    return (
        <div className="card">
            <div className="card-content">
                {isLoading && <p className="stm-loading">Đang tải dữ liệu...</p>}
                {errors.general && <p className="stm-error">{errors.general}</p>}

                <div className="filter-bar-container">
                    <h3 className="filter-title">
                        <Search size={20} /> Tìm kiếm cuộc hẹn
                    </h3>
                    <div className="search-box-container">
                        <label className="required">Mã cuộc hẹn</label>
                        <div className="search-box">
                            <input
                                type="text"
                                value={appointmentId}
                                onChange={(e) => {
                                    setAppointmentId(e.target.value);
                                    debouncedSearch(e.target.value);
                                }}
                                placeholder="Nhập mã cuộc hẹn hoặc tên bệnh nhân"
                                className="input-field"
                            />
                            <Search size={16} />
                        </div>
                    </div>
                    <div className="unified-table-container">
                        <div className="unified-table-header">
                            <div className="unified-table-header-content">
                                <Package className="unified-table-header-icon" />
                                <span className="unified-table-header-text">Danh sách cuộc hẹn ({filteredAppointments.length} cuộc hẹn)</span>
                            </div>
                        </div>
                        <div className="unified-table-wrapper">
                            <table className="unified-table">
                                <thead>
                                <tr>
                                    <th>Mã cuộc hẹn</th>
                                    <th>Tên bệnh nhân</th>
                                    <th>Ngày khám</th>
                                    <th>Trạng thái đơn thuốc</th>
                                    <th>Trạng thái thanh toán</th>
                                    <th>Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedAppointments.length > 0 ? (
                                    paginatedAppointments.map((appt) => (
                                        <React.Fragment key={appt.id}>
                                            <tr>
                                                <td><span className="unified-highlight">{appt.id}</span></td>
                                                <td>
                                                    <div className="unified-item-info">
                                                        <div className="unified-user-name">{appt.patientName}</div>
                                                    </div>
                                                </td>
                                                <td>{appt.appointmentDate}</td>
                                                <td>
                                                    <span className={`unified-status-badge ${
                                                        appt.prescriptionStatus === 'COMPLETED' ? 'status-completed' :
                                                            appt.prescriptionStatus === 'PENDING' ? 'status-pending' :
                                                                appt.prescriptionStatus === 'DELIVERED' ? 'status-shipped' : 'status-cancelled'
                                                    }`}>
                                                        {mapStatusToDisplay(appt.prescriptionStatus)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`unified-status-badge ${
                                                        appt.status === 'COMPLETED' ? 'status-completed' :
                                                            appt.status === 'PENDING' ? 'status-pending' :
                                                                appt.status === 'DELIVERED' ? 'status-shipped' : 'status-cancelled'
                                                    }`}>
                                                        {mapStatusToDisplay(appt.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="unified-action-buttons">
                                                        <button
                                                            type="button"
                                                            className={`unified-btn ${
                                                                expandedRowId === appt.id ? 'unified-btn-secondary' : 'unified-btn-primary'
                                                            }`}
                                                            onClick={() => handleSelectAppointment(appt.id)}
                                                            title={expandedRowId === appt.id ? "Đóng" : "Xem"}
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRowId === appt.id && appointment && (
                                                <tr>
                                                    <td colSpan="6" className="inline-details-cell">
                                                        <div className="inline-appointment-details">
                                                            {/* Customer Information */}
                                                            <div className="inline-section">
                                                                <h4 className="inline-section-title">
                                                                    <Package size={16} /> Thông tin khách hàng
                                                                </h4>
                                                                <div className="inline-customer-info">
                                                                    <div className="inline-info-item">
                                                                        <label>Tên khách hàng:</label>
                                                                        <span>{appointment.patientName || "N/A"}</span>
                                                                    </div>
                                                                    <div className="inline-info-item">
                                                                        <label>Email:</label>
                                                                        <span>{appointment.patientEmail || "N/A"}</span>
                                                                    </div>
                                                                    <div className="inline-info-item">
                                                                        <label>Số điện thoại:</label>
                                                                        <span>{appointment.patientPhone || "N/A"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Medications */}
                                                            <div className="inline-section">
                                                                <h4 className="inline-section-title">
                                                                    <Package size={16} /> Thuốc kê đơn
                                                                </h4>
                                                                {medications.length > 0 ? (
                                                                    <div className="inline-medications">
                                                                        {medications.map((med) => (
                                                                            <div key={med.productId} className="inline-medication-item">
                                                                                <img
                                                                                    src={med.image}
                                                                                    alt={med.name}
                                                                                    className="inline-product-img"
                                                                                    onError={handleImageError}
                                                                                />
                                                                                <div className="inline-med-info">
                                                                                    <h5>{med.name}</h5>
                                                                                    <p>₫{med.price.toLocaleString()}</p>
                                                                                </div>
                                                                                <div className="inline-quantity">
                                                                                    Số lượng: {med.quantity}
                                                                                </div>
                                                                                <div className="inline-total">
                                                                                    ₫{med.total.toLocaleString()}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="inline-no-results">
                                                                        {errors.general || "Không có thuốc nào được kê trong cuộc hẹn này."}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Order Summary and Actions */}
                                                            {medications.length > 0 && (
                                                                <div className="inline-section">
                                                                    <h4 className="inline-section-title">
                                                                        <Package size={16} /> Tổng kết đơn hàng
                                                                    </h4>
                                                                    <div className="inline-summary">
                                                                        <div className="inline-total-row">
                                                                            <span>Tổng cộng:</span>
                                                                            <span className="inline-total-amount">
                                                                                ₫{medications.reduce((sum, med) => sum + med.total, 0).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="inline-actions">
                                                                        {prescriptionStatus === "NOT_BUY" ? (
                                                                            <p className="inline-error">Bệnh nhân không mua thốc.</p>
                                                                        ) : prescriptionStatus === "DELIVERED" ? (
                                                                            <p className="inline-success">Đơn thuốc đã được giao.</p>
                                                                        ) : (
                                                                            <button
                                                                                className="inline-confirm-btn"
                                                                                onClick={handleConfirmDelivery}
                                                                                disabled={isConfirmingDelivery || isLoading || !appointment}
                                                                            >
                                                                                <CheckCircle size={16} />
                                                                                {isConfirmingDelivery ? "Đang xác nhận..." : "Xác nhận giao đơn thuốc"}
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            className="inline-close-btn"
                                                                            onClick={handleCloseAppointment}
                                                                            title="Đóng"
                                                                        >
                                                                            <X size={16} /> Đóng
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="stm-no-results">
                                            Không tìm thấy cuộc hẹn nào có trạng thái đã thanh toán tiền.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination - Separated from table */}
                    {filteredAppointments.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Default props to prevent errors if onBack or onOrderCreated are not provided
CreateMedicationOrderPage.defaultProps = {
    onBack: () => console.warn("onBack function not provided"),
    onOrderCreated: () => {},
    selectedOrder: null,
};

export default CreateMedicationOrderPage;