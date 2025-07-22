import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as refundsService from '../services/refundsService';
import * as appointmentService from '../services/appointmentsService';

// Component có thể được sử dụng bởi cả Admin và Tiếp tân

const ManualRefundList = () => {
    const [refundList, setRefundList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        fetchRefundList();
        
        // Lấy thông tin user từ localStorage
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');
        setUserRole(role || 'UNKNOWN');
        setUserName(name || 'Unknown User');
    }, []);

    const fetchRefundList = async () => {
        try {
            setLoading(true);
            // Sử dụng API mới từ refunds service
            const pendingRefunds = await refundsService.getPendingRefunds();
            setRefundList(pendingRefunds);
        } catch (error) {
            console.error('Error fetching refund list:', error);
            toast.error('Không thể tải danh sách hoàn tiền');
            
            // Endpoint /api/appointments/refund-pending không tồn tại, fallback trực tiếp sang getAllAppointments
            try {
                console.log('Fallback to getAllAppointments');
                const appointments = await appointmentService.getAllAppointments();
                const filtered = appointments.filter(app => 
                    app.status === 'CANCELED' && 
                    app.requiresManualRefund === true &&
                    (!app.refundStatus || app.refundStatus === 'PENDING_MANUAL_REFUND')
                );
                console.log('Filtered appointments for refund:', filtered.length);
                setRefundList(filtered);
            } catch (finalError) {
                console.error('Final fallback error:', finalError);
            }
        } finally {
            setLoading(false);
        }
    };

    const markRefundCompleted = async (refundId, refundMethod = 'MANUAL') => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = currentUser.role || 'Unknown';
        const userName = currentUser.name || 'Unknown User';
        
        try {
            // Sử dụng API mới từ refunds service
            const completionData = {
                refundMethod: refundMethod,
                completedBy: userName,
                completedByRole: userRole,
                notes: `Hoàn tiền thủ công bởi ${userRole}: ${userName}`
            };
            
            await refundsService.completeRefund(refundId, completionData);
            
            // Cập nhật local state
            setRefundList(prev => prev.filter(refund => refund.id !== refundId));
            
            toast.success(`Đã đánh dấu hoàn tiền hoàn tất bởi ${userRole}: ${userName}`);
        } catch (error) {
            console.error('Error marking refund completed:', error);
            toast.error('Không thể cập nhật trạng thái hoàn tiền');
            
            // Fallback to old method
            try {
                const updateData = {
                    refundStatus: 'COMPLETED',
                    refundCompletedBy: userName,
                    refundCompletedByRole: userRole,
                    refundCompletedAt: new Date().toISOString()
                };
                
                // Tìm appointment tương ứng với refund
                const refund = refundList.find(r => r.id === refundId);
                if (refund && refund.appointmentId) {
                    await appointmentService.updateAppointment(refund.appointmentId, updateData);
                    setRefundList(prev => prev.filter(r => r.id !== refundId));
                    toast.success(`Đã đánh dấu hoàn tiền hoàn tất bởi ${userRole}: ${userName}`);
                }
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
            }
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (refundList.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Danh sách hoàn tiền thủ công</h3>
                <p>Không có cuộc hẹn nào cần hoàn tiền thủ công.</p>
            </div>
        );
    }

    // userRole đã được khai báo ở trên trong useState
    
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>Danh sách hoàn tiền thủ công</h3>
                    <p style={{ color: '#666', margin: '0' }}>
                        Các cuộc hẹn đã hủy cần hoàn tiền thủ công cho bệnh nhân
                    </p>
                </div>
                <div style={{ 
                    padding: '8px 12px', 
                    backgroundColor: userRole === 'ADMIN' ? '#007bff' : '#28a745',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    {userRole === 'ADMIN' ? 'Quản trị viên' : 'Tiếp tân'}
                </div>
            </div>
            
            <div style={{ display: 'grid', gap: '15px' }}>
                {refundList.map(refund => (
                    <div key={refund.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: '#fff3cd'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ margin: '0 0 10px 0' }}>
                                    Bệnh nhân: {refund.patientName || refund.appointment?.patientName || 'N/A'}
                                </h4>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Ngày hẹn:</strong> {refund.appointmentTime ? new Date(refund.appointmentTime).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Số tiền hoàn:</strong> <span style={{ color: '#d63384', fontWeight: 'bold' }}>
                                        {refund.refundAmount ? `${refund.refundAmount.toLocaleString()} VNĐ` : '10,000 VNĐ'}
                                    </span>
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Lý do hoàn tiền:</strong> {refund.refundReason || refund.appointment?.cancellationReason || 'Hủy cuộc hẹn'}
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Ngày tạo:</strong> {refund.createdAt ? new Date(refund.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                                <p style={{ margin: '5px 0', color: '#d63384' }}>
                                    <strong>⚠️ Cần hoàn tiền thủ công cho bệnh nhân</strong>
                                </p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <select 
                                    id={`refund-method-${refund.id}`}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        fontSize: '12px'
                                    }}
                                    defaultValue="MANUAL"
                                >
                                    <option value="MANUAL">Thủ công</option>
                                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="E_WALLET">Ví điện tử</option>
                                </select>
                                
                                <button
                                    onClick={() => {
                                        const method = document.getElementById(`refund-method-${refund.id}`).value;
                                        markRefundCompleted(refund.id, method);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Đã hoàn tiền
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManualRefundList;
