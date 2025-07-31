import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Calendar, Package, FileText } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/payment-detail.css';
import authService from "../../../../services/authService";
import paymentHistoryService from "../../../../services/paymentHistoryService";

export default function PaymentDetailPage() {
    const { id, type } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Kiểm tra xác thực người dùng
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                setUser(currentUser);

                // Lấy chi tiết hóa đơn
                const invoiceDetail = await paymentHistoryService.getPaymentDetail(id, type);
                if (!invoiceDetail) {
                    toast.error("Không tìm thấy thông tin hóa đơn");
                    navigate('/payment-history');
                    return;
                }
                setInvoice(invoiceDetail);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
                toast.error("Không thể tải thông tin hóa đơn");
                setLoading(false);
            }
        };

        fetchData();
    }, [id, type, navigate]);

    const handleBackClick = () => {
        navigate('/dashboard/patient/payment-history');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Tạo một PDF từ nội dung hóa đơn (sẽ triển khai sau)
        toast.info("Tính năng tải hóa đơn đang được phát triển");
    };

    const getInvoiceIcon = () => {
        return type === "service" ? (
            <div className="invoice-icon service-icon">
                <FileText size={24} />
            </div>
        ) : (
            <div className="invoice-icon order-icon">
                <Package size={24} />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="payment-detail-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin hóa đơn...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="payment-detail-container">
                <div className="error-container">
                    <h2>Không tìm thấy hóa đơn</h2>
                    <button className="back-button" onClick={handleBackClick}>
                        <ArrowLeft size={16} />
                        <span>Quay lại</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-detail-container">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="payment-detail-header">
                <button className="back-button" onClick={handleBackClick}>
                    <ArrowLeft size={16} />
                    <span>Quay lại</span>
                </button>
                <h1>Chi tiết hóa đơn</h1>
                <div className="header-actions">
                    <button className="print-button" onClick={handlePrint}>
                        <Printer size={16} />
                        <span>In hóa đơn</span>
                    </button>
                    <button className="download-button" onClick={handleDownload}>
                        <Download size={16} />
                        <span>Tải PDF</span>
                    </button>
                </div>
            </div>

            <div className="payment-detail-content">
                <div className="invoice-card">
                    <div className="invoice-header">
                        <div className="invoice-title-section">
                            {getInvoiceIcon()}
                            <div>
                                <h2 className="invoice-title">{invoice.serviceName}</h2>
                                <p className="invoice-type">
                                    {invoice.type === "service" ? "Hóa đơn dịch vụ" : "Hóa đơn đơn hàng"}
                                </p>
                            </div>
                        </div>
                        <div className="invoice-status">
                            <span className={`status-badge paid`}>
                                {paymentHistoryService.getStatusText(`paid`)}
                            </span>
                        </div>
                    </div>

                    <div className="invoice-body">
                        <div className="invoice-section">
                            <h3>Thông tin hóa đơn</h3>
                            <div className="invoice-grid">
                                <div className="invoice-item">
                                    <span className="item-label">Mã hóa đơn:</span>
                                    <span className="item-value">{invoice.id.toString().replace(/^(INV|ORD)/, '')}</span>
                                </div>
                                <div className="invoice-item">
                                    <span className="item-label">Ngày tạo:</span>
                                    <span className="item-value">{invoice.date}</span>
                                </div>
                                <div className="invoice-item">
                                    <span className="item-label">Số tiền:</span>
                                    <span className="item-value amount">{invoice.amount}</span>
                                </div>
                                <div className="invoice-item">
                                    <span className="item-label">Phương thức thanh toán:</span>
                                    <span className="item-value">{invoice.paymentMethod || "Tiền mặt"}</span>
                                </div>
                                <div className="invoice-item">
                                    <span className="item-label">Thời gian thanh toán:</span>
                                    <span className="item-value">{invoice.paymentTime || invoice.date}</span>
                                </div>
                                <div className="invoice-item">
                                    <span className="item-label">Mã giao dịch:</span>
                                    <span className="item-value">{invoice.transactionNo || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-section">
                            <h3>Thông tin khách hàng</h3>
                            <div className="invoice-grid">
                                <div className="invoice-item">
                                    <span className="item-label">Người thanh toán:</span>
                                    <span className="item-value">{invoice.payerName || user?.name || "N/A"}</span>
                                </div>
                                <div className="invoice-item">
                                    <span className="item-label">Email:</span>
                                    <span className="item-value">{invoice.patientEmail || user?.email || "N/A"}</span>
                                </div>
                                <div className="invoice-item">
                                    <span className="item-label">Số điện thoại:</span>
                                    <span className="item-value">{invoice.patientPhone || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {invoice.type === "service" && (
                            <div className="invoice-section">
                                <h3>Chi tiết dịch vụ</h3>
                                <div className="service-details">
                                    <table className="service-table">
                                        <thead>
                                        <tr>
                                            <th>Dịch vụ</th>
                                            <th>Bác sĩ</th>
                                            <th>Ngày khám</th>
                                            <th>Giá</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{invoice.serviceName}</td>
                                            <td>{invoice.doctorName || "N/A"}</td>
                                            <td>{invoice.appointmentDate || invoice.date}</td>
                                            <td>{invoice.amount}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {invoice.type === "order" && (
                            <div className="invoice-section">
                                <h3>Chi tiết đơn hàng</h3>
                                <div className="order-details">
                                    <table className="order-table">
                                        <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {invoice.orderItems ? (
                                            invoice.orderItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.productName}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price}</td>
                                                    <td>{item.total}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td>{invoice.serviceName}</td>
                                                <td>1</td>
                                                <td>{invoice.amount}</td>
                                                <td>{invoice.amount}</td>
                                            </tr>
                                        )}
                                        </tbody>
                                        <tfoot>
                                        <tr>
                                            <td colSpan="3" className="total-label">Tổng cộng</td>
                                            <td className="total-amount">{invoice.amount}</td>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {invoice.notes && (
                            <div className="invoice-section">
                                <h3>Ghi chú</h3>
                                <p className="invoice-notes">{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="invoice-footer">
                        <p>Cảm ơn quý khách đã sử dụng dịch vụ của Eyespire</p>
                        <p className="footer-contact">Mọi thắc mắc xin liên hệ: support@eyespire.com | Hotline: 1900 1234</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
