"use client"

import { X, User, Package, CreditCard } from "lucide-react"
import "./stmStyle/STM-OrderDetailModal.css"
import { useState, useEffect } from "react"

const OrderDetailModal = ({ order, isOpen, onClose, onStatusUpdate }) => {
  // Thêm vào đầu component, sau các props
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState(order?.status || "pending")
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)

  // Thêm các status options
  const statusOptions = [
    { value: "pending", label: "Chờ xác nhận", color: "#f59e0b" },
    { value: "confirmed", label: "Đã xác nhận", color: "#3b82f6" },
    { value: "processing", label: "Đang xử lý", color: "#8b5cf6" },
    { value: "shipped", label: "Đã gửi hàng", color: "#06b6d4" },
    { value: "delivered", label: "Đã giao hàng", color: "#10b981" },
    { value: "cancelled", label: "Đã hủy", color: "#ef4444" },
  ]

  // Thêm useEffect để sync status khi order thay đổi
  useEffect(() => {
    if (order) {
      setNewStatus(order.status)
    }
  }, [order])

  // Thêm function xử lý cập nhật trạng thái
  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      setShowStatusUpdate(false)
      return
    }

    setIsUpdatingStatus(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const updatedOrder = {
        ...order,
        status: newStatus,
        statusText: statusOptions.find((s) => s.value === newStatus)?.label,
        updatedAt: new Date().toISOString(),
      }

      console.log("Status updated:", updatedOrder)

      // Callback để cập nhật order trong parent component
      if (onStatusUpdate) {
        onStatusUpdate(updatedOrder)
      }

      alert(`Trạng thái đơn hàng đã được cập nhật thành "${statusOptions.find((s) => s.value === newStatus)?.label}"`)
      setShowStatusUpdate(false)
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Có lỗi xảy ra khi cập nhật trạng thái!")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Thêm function in đơn hàng
  const handlePrintOrder = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #333;">HÓA ĐON BÁN HÀNG</h1>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h2>Thông tin đơn hàng</h2>
          <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
          <p><strong>Ngày đặt:</strong> ${order.orderDate}</p>
          <p><strong>Trạng thái:</strong> ${order.statusText}</p>
        </div>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h2>Thông tin khách hàng</h2>
          <p><strong>Tên:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Điện thoại:</strong> ${order.customerPhone}</p>
          <p><strong>Địa chỉ:</strong> ${order.customerAddress}</p>
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
              ${order.items
        .map(
          (item) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₫${item.price.toLocaleString()}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₫${item.total.toLocaleString()}</td>
                </tr>
              `,
        )
        .join("")}
            </tbody>
          </table>
        </div>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <h2>Tổng kết</h2>
          <p><strong>Tạm tính:</strong> ₫${order.subtotal.toLocaleString()}</p>
          <p><strong>Phí vận chuyển:</strong> ₫${order.shipping.toLocaleString()}</p>
          <p><strong>Thuế:</strong> ₫${order.tax.toLocaleString()}</p>
          <p style="font-size: 18px; color: #e74c3c;"><strong>Tổng cộng:</strong> ₫${order.total.toLocaleString()}</p>
        </div>
      </div>
    `

    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${order.id}</title>
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
              }
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!isOpen || !order) return null

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "confirmed":
        return "#3b82f6"
      case "processing":
        return "#8b5cf6"
      case "shipped":
        return "#06b6d4"
      case "delivered":
        return "#10b981"
      case "cancelled":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "#10b981"
      case "pending":
        return "#f59e0b"
      case "failed":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết đơn hàng #{order.id}</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="order-detail-grid">
            <div className="detail-section">
              <div className="section-title">
                <User size={18} />
                <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Thông tin khách hàng</h3>
              </div>
              <div className="detail-content">
                <div className="detail-row">
                  <span className="label">Tên khách hàng:</span>
                  <span className="value">{order.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{order.customerEmail}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{order.customerPhone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Địa chỉ:</span>
                  <span className="value">{order.customerAddress}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <div className="section-title">
                <Package size={18} />
                <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Thông tin đơn hàng</h3>

              </div>
              <div className="detail-content">
                <div className="detail-row">
                  <span className="label">Ngày đặt:</span>
                  <span className="value">{order.orderDate}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Trạng thái:</span>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(order.status) + "20",
                      color: getStatusColor(order.status),
                    }}
                  >
                    {order.statusText}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Thanh toán:</span>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getPaymentStatusColor(order.paymentStatus) + "20",
                      color: getPaymentStatusColor(order.paymentStatus),
                    }}
                  >
                    {order.paymentStatus === "paid"
                      ? "Đã thanh toán"
                      : order.paymentStatus === "pending"
                        ? "Chờ thanh toán"
                        : "Thất bại"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Phương thức thanh toán:</span>
                  <span className="value">{order.paymentMethod}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phương thức vận chuyển:</span>
                  <span className="value">{order.shippingMethod}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-title">
              <Package size={18} />
              <h3>Sản phẩm đặt hàng</h3>
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <div className="item-info">
                      <span>Số lượng: {item.quantity}</span>
                      <span>Đơn giá: ₫{item.price.toLocaleString()}</span>
                      <span className="item-total">Thành tiền: ₫{item.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="section-title">
              <CreditCard size={18} />
              <h3>Tổng kết đơn hàng</h3>
            </div>
            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>₫{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>₫{order.shipping.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Thuế:</span>
                <span>₫{order.tax.toLocaleString()}</span>
              </div>
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>₫{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="detail-section">
              <div className="section-title">
                <h3>Ghi chú</h3>
              </div>
              <div className="detail-content">
                <p>{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>

          {!showStatusUpdate ? (
            <button className="btn btn-primary" onClick={() => setShowStatusUpdate(true)}>
              Cập nhật trạng thái
            </button>
          ) : (
            <div className="status-update-section">
              <select
                className="form-select"
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
                className="btn btn-success"
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || newStatus === order.status}
              >
                {isUpdatingStatus ? "Đang cập nhật..." : "Xác nhận"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowStatusUpdate(false)
                  setNewStatus(order.status)
                }}
                disabled={isUpdatingStatus}
              >
                Hủy
              </button>
            </div>
          )}

          <button className="btn btn-success" onClick={handlePrintOrder}>
            In đơn hàng
          </button>
        </div>
      </div>
    </div >
  )
}

export default OrderDetailModal
