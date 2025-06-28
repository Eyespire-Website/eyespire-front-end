import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, DollarSign, FileText, User, Calendar } from 'lucide-react';
import appointmentService from '../../../services/appointmentService';
import '../../../assets/css/payment-management.css';

export default function PaymentManagement() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchWaitingPaymentAppointments();
    }, []);

    const fetchWaitingPaymentAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getWaitingPaymentAppointments();
            setAppointments(data);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách cuộc hẹn chờ thanh toán:', err);
            setError('Không thể tải danh sách cuộc hẹn. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async (appointmentId) => {
        try {
            setLoading(true);
            const appointmentData = appointments.find(app => app.id === appointmentId);
            setSelectedAppointment(appointmentData);
            
            const invoiceData = await appointmentService.getAppointmentInvoice(appointmentId);
            setInvoice(invoiceData);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi lấy thông tin hóa đơn:', err);
            setError('Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.');
            setInvoice(null);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedAppointment) return;
        
        if (!transactionId.trim()) {
            setError('Vui lòng nhập mã giao dịch thanh toán');
            return;
        }

        try {
            setLoading(true);
            await appointmentService.markAppointmentAsPaid(selectedAppointment.id, transactionId);
            
            // Cập nhật lại danh sách cuộc hẹn
            await fetchWaitingPaymentAppointments();
            
            // Reset state
            setSelectedAppointment(null);
            setInvoice(null);
            setTransactionId('');
            setError(null);
            
            alert('Xác nhận thanh toán thành công!');
        } catch (err) {
            console.error('Lỗi khi xác nhận thanh toán:', err);
            setError('Không thể xác nhận thanh toán. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="payment-management-container">
            <h1 className="page-title">Quản lý thanh toán</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="payment-management-content">
                <div className="appointments-list">
                    <h2>Danh sách cuộc hẹn chờ thanh toán</h2>
                    
                    {loading && !selectedAppointment ? (
                        <div className="loading">Đang tải...</div>
                    ) : appointments.length === 0 ? (
                        <div className="no-data">Không có cuộc hẹn nào đang chờ thanh toán</div>
                    ) : (
                        <table className="appointments-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Bệnh nhân</th>
                                    <th>Bác sĩ</th>
                                    <th>Ngày giờ</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map(appointment => (
                                    <tr key={appointment.id} className={selectedAppointment?.id === appointment.id ? 'selected' : ''}>
                                        <td>{appointment.id}</td>
                                        <td>{appointment.patient?.fullName || 'N/A'}</td>
                                        <td>{appointment.doctor?.fullName || 'N/A'}</td>
                                        <td>{formatDate(appointment.appointmentDate)}</td>
                                        <td>
                                            <button 
                                                className="view-invoice-btn"
                                                onClick={() => handleViewInvoice(appointment.id)}
                                            >
                                                <FileText size={16} />
                                                Xem hóa đơn
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {selectedAppointment && invoice && (
                    <div className="invoice-details">
                        <h2>Chi tiết hóa đơn</h2>
                        
                        <div className="invoice-card">
                            <div className="invoice-header">
                                <h3>Hóa đơn #{invoice.id}</h3>
                                <div className="appointment-info">
                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <span>Ngày khám: {formatDate(selectedAppointment.appointmentDate)}</span>
                                    </div>
                                    <div className="info-item">
                                        <User size={16} />
                                        <span>Bệnh nhân: {selectedAppointment.patient?.fullName}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="invoice-body">
                                <div className="invoice-row">
                                    <span>Tiền đặt cọc:</span>
                                    <span>{formatCurrency(invoice.depositAmount)}</span>
                                </div>
                                <div className="invoice-row">
                                    <span>Tổng chi phí:</span>
                                    <span>{formatCurrency(invoice.totalAmount)}</span>
                                </div>
                                <div className="invoice-row highlight">
                                    <span>Số tiền cần thanh toán:</span>
                                    <span>{formatCurrency(invoice.remainingAmount)}</span>
                                </div>
                            </div>
                            
                            <div className="payment-confirmation">
                                <h4>Xác nhận thanh toán</h4>
                                <div className="input-group">
                                    <label htmlFor="transactionId">Mã giao dịch:</label>
                                    <input
                                        type="text"
                                        id="transactionId"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Nhập mã giao dịch thanh toán"
                                    />
                                </div>
                                
                                <div className="action-buttons">
                                    <button 
                                        className="cancel-btn"
                                        onClick={() => {
                                            setSelectedAppointment(null);
                                            setInvoice(null);
                                            setTransactionId('');
                                        }}
                                    >
                                        <X size={16} />
                                        Hủy
                                    </button>
                                    <button 
                                        className="confirm-btn"
                                        onClick={handleConfirmPayment}
                                        disabled={loading}
                                    >
                                        <Check size={16} />
                                        Xác nhận thanh toán
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
