"use client";

import { useState, useEffect, useRef } from "react";
import orderService from "../../services/orderService";
import { X, User, Package, ZoomIn, ZoomOut } from "lucide-react";
import "./stmStyle/ODM-OrderDetailModal.css";

const OrderDetailModal = ({
                              order,
                              isOpen,
                              onClose = () => {},
                              onStatusUpdate = () => {},
                              onResetFilters = () => {}, // Add the new prop
                          }) => {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState(order?.status || "PENDING");
    const [showStatusUpdate, setShowStatusUpdate] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [errorMessage, setErrorMessage] = useState(null);
    const imageContainerRef = useRef(null);

    const statusOptions = [
        { value: "PAID", label: "Đã thanh toán", color: "#166534" },
        { value: "SHIPPED", label: "Đã gửi hàng", color: "#0891b2" },
        { value: "COMPLETED", label: "Đã hoàn thành", color: "#1e40af" },
        { value: "CANCELED", label: "Đã hủy", color: "#991b1b" },
    ];

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    const fallbackImage = "https://placehold.co/60x60?text=Image";

    const getFullUrl = (url) => {
        if (!url || url.trim() === "" || url === "/placeholder.svg") {
            console.log("Image URL is invalid, using fallback:", fallbackImage);
            return fallbackImage;
        }
        return url.startsWith("http") ? url.trim() : `${baseUrl}${url.startsWith("/") ? url : "/" + url}`;
    };

    const handleImageError = (e) => {
        console.error(`Failed to load image: ${e.target.src}`);
        e.target.src = fallbackImage;
    };

    const handleImageClick = (url) => {
        setSelectedImage(url);
        setZoomLevel(1);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
        setZoomLevel(1);
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.2, 5));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
    };

    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
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
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleCloseModal();
        };
        if (selectedImage) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage]);

    useEffect(() => {
        if (order && order.items) {
            console.log(
                "Order items:",
                order.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }))
            );
        }
    }, [order]);

    useEffect(() => {
        if (order) {
            setNewStatus(order.status);
        }
    }, [order]);

    const handleStatusUpdate = async () => {
        if (newStatus === order.status) {
            setShowStatusUpdate(false);
            return;
        }

        setIsUpdatingStatus(true);
        setErrorMessage(null);

        try {
            const cleanOrderId = order.id.replace(/^#/, "");
            const numericOrderId = parseInt(cleanOrderId, 10);
            if (isNaN(numericOrderId)) {
                throw new Error(`ID đơn hàng không hợp lệ: ${cleanOrderId}`);
            }
            if (!statusOptions.some((s) => s.value === newStatus)) {
                throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
            }
            console.log(`Updating status for order ${numericOrderId} to ${newStatus}`);
            const updatedOrderData = await orderService.updateOrderStatus(numericOrderId, newStatus);
            const updatedOrder = {
                ...order,
                status: newStatus,
                statusText: statusOptions.find((s) => s.value === newStatus)?.label || "Không xác định",
                updatedAt: new Date().toISOString(),
            };
            onStatusUpdate(updatedOrder);
            onResetFilters(); // Call the reset callback after successful update
            alert(`Trạng thái đơn hàng đã được cập nhật thành "${statusOptions.find((s) => s.value === newStatus)?.label}"`);
            setShowStatusUpdate(false);
        } catch (error) {
            console.error("Error updating status:", {
                message: error.message,
                stack: error.stack,
            });
            setErrorMessage(`Có lỗi xảy ra khi cập nhật trạng thái: ${error.message}. Vui lòng kiểm tra đăng nhập hoặc liên hệ hỗ trợ.`);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handlePrintOrder = () => {
        const totalAmount = (order.total || 0).toLocaleString();
        const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #333;">HÓA ĐƠN BÁN HÀNG</h1>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h2>Thông tin đơn hàng</h2>
          <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
          <p><strong>Ngày đặt:</strong> ${order.orderDate || "N/A"}</p>
          <p><strong>Trạng thái:</strong> ${order.statusText || "Chưa xác định"}</p>
        </div>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h2>Thông tin khách hàng</h2>
          <p><strong>Tên:</strong> ${order.customerName || "N/A"}</p>
          <p><strong>Email:</strong> ${order.customerEmail || "N/A"}</p>
          <p><strong>Điện thoại:</strong> ${order.customerPhone || "N/A"}</p>
          <p><strong>Địa chỉ:</strong> ${order.customerAddress || "N/A"}</p>
        </div>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h2>Chi tiết sản phẩm</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Sản phẩm</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Số lượng</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Đơn giá</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(
            (item) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.name || "Không xác định"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity || 0}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₫${(item.price || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₫${(item.total || 0).toLocaleString()}</td>
                </tr>
              `
        ).join("")}
            </tbody>
          </table>
        </div>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h2>Tổng kết</h2>
          <p style="font-size: 18px; color: #e74c3c;"><strong>Tổng cộng:</strong> ₫${totalAmount}</p>
        </div>
      </div>
    `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn hàng ${order.id}</title>
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    if (!isOpen || !order) return null;

    return (
        <div className="odm-modal-overlay" onClick={onClose}>
            <div className="odm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="odm-modal-header">
                    <h2>Chi tiết đơn hàng #{order.id.replace("#", "")}</h2>
                    <button className="odm-btn odm-btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="odm-modal-body">
                    {errorMessage && (
                        <div className="odm-error-message" style={{ color: "red", marginBottom: "10px" }}>
                            {errorMessage}
                        </div>
                    )}
                    <div className="odm-order-detail-grid">
                        <div className="odm-detail-section">
                            <div className="odm-section-title">
                                <User size={20} />
                                <h3 className="odm-title">Thông tin khách hàng</h3>
                            </div>
                            <div className="odm-detail-content">
                                <div className="odm-detail-row">
                                    <span className="odm-label">Tên khách hàng:</span>
                                    <span className="odm-value">{order.customerName || "N/A"}</span>
                                </div>
                                <div className="odm-detail-row">
                                    <span className="odm-label">Email:</span>
                                    <span className="odm-value">{order.customerEmail || "N/A"}</span>
                                </div>
                                <div className="odm-detail-row">
                                    <span className="odm-label">Số điện thoại:</span>
                                    <span className="odm-value">{order.customerPhone || "N/A"}</span>
                                </div>
                                <div className="odm-detail-row">
                                    <span className="odm-label">Địa chỉ:</span>
                                    <span className="odm-value">{order.customerAddress || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="odm-detail-section">
                            <div className="odm-section-title">
                                <Package size={20} />
                                <h3 className="odm-title">Thông tin đơn hàng</h3>
                            </div>
                            <div className="odm-detail-content">
                                <div className="odm-detail-row">
                                    <span className="odm-label">Ngày đặt:</span>
                                    <span className="odm-value">{order.orderDate || "N/A"}</span>
                                </div>
                                <div className="odm-detail-row">
                                    <span className="odm-label">Trạng thái:</span>
                                    <span className={`stm-status stm-status--${order.status.toLowerCase()}`}>
                    {order.statusText || "Chưa xác định"}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="odm-detail-section">
                        <div className="odm-section-title">
                            <Package size={24} />
                            <h3 className="odm-title">Sản phẩm đặt hàng</h3>
                        </div>
                        <div className="odm-order-items">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <div key={item.id || index} className="odm-order-item">
                                        <img
                                            src={getFullUrl(item.image)}
                                            alt={item.name || "Product image"}
                                            className="odm-item-image"
                                            onError={handleImageError}
                                            onClick={() => handleImageClick(getFullUrl(item.image))}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <div className="odm-item-details">
                                            <h4 className="odm-item-name">{item.name || "Không xác định"}</h4>
                                            <div className="odm-item-info">
                                                <span>Số lượng: {item.quantity || 0}</span>
                                                <span>Đơn giá: ₫{(item.price || 0).toLocaleString()}</span>
                                                <span className="odm-item-total">
                          Thành tiền: ₫{(item.total || 0).toLocaleString()}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Không có sản phẩm nào.</p>
                            )}
                        </div>
                    </div>

                    <div className="odm-detail-section">
                        <div className="odm-section-title">
                            <h3 className="odm-title">Tổng kết đơn hàng</h3>
                        </div>
                        <div className="odm-order-summary">
                            <div className="odm-summary-row odm-total">
                                <span>Tổng cộng:</span>
                                <span>₫{(order.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {order.notes && order.notes !== "N/A" && (
                        <div className="odm-detail-section">
                            <div className="odm-section-title">
                                <h3 className="odm-title">Ghi chú</h3>
                            </div>
                            <div className="odm-detail-content">
                                <p>{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="odm-modal-footer">
                    <button className="odm-btn odm-btn-secondary" onClick={onClose}>
                        Đóng
                    </button>

                    {!showStatusUpdate ? (
                        <button
                            className="odm-btn odm-btn-primary"
                            onClick={() => setShowStatusUpdate(true)}
                        >
                            Cập nhật trạng thái
                        </button>
                    ) : (
                        <div className="odm-status-update-section">
                            <select
                                className="odm-form-select"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                disabled={isUpdatingStatus}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="odm-btn odm-btn-success"
                                onClick={handleStatusUpdate}
                                disabled={isUpdatingStatus || newStatus === order.status}
                            >
                                {isUpdatingStatus ? "Đang cập nhật..." : "Xác nhận"}
                            </button>
                            <button
                                className="odm-btn odm-btn-secondary"
                                onClick={() => {
                                    setShowStatusUpdate(false);
                                    setNewStatus(order.status);
                                }}
                                disabled={isUpdatingStatus}
                            >
                                Hủy
                            </button>
                        </div>
                    )}

                    <button className="odm-btn odm-btn-success" onClick={handlePrintOrder}>
                        In đơn hàng
                    </button>
                </div>

                {selectedImage && (
                    <div className="image-modal-overlay" onClick={handleCloseModal}>
                        <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="image-modal-close" onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                            <div className="image-modal-content" ref={imageContainerRef}>
                                <img
                                    src={selectedImage}
                                    alt="Zoomed product image"
                                    style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s" }}
                                    onError={handleImageError}
                                />
                            </div>
                            <div className="image-modal-controls">
                                <button onClick={handleZoomIn} disabled={zoomLevel >= 5}>
                                    <ZoomIn size={20} />
                                </button>
                                <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                                    <ZoomOut size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailModal;