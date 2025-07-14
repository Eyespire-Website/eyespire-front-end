import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as refundsService from '../services/refundsService';

// Component hiển thị lịch sử hoàn tiền của một user cụ thể
const UserRefundHistory = ({ userId, patientName }) => {
    const [refundHistory, setRefundHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserRefundHistory();
        }
    }, [userId]);

    const fetchUserRefundHistory = async () => {
        try {
            setLoading(true);
            const history = await refundsService.getUserRefundHistory(userId);
            setRefundHistory(history);
        } catch (error) {
            console.error('Error fetching user refund history:', error);
            toast.error('Không thể tải lịch sử hoàn tiền');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { color: '#ffc107', text: 'Đang chờ' },
            'COMPLETED': { color: '#28a745', text: 'Hoàn tất' },
            'FAILED': { color: '#dc3545', text: 'Thất bại' }
        };
        
        const config = statusConfig[status] || { color: '#6c757d', text: status };
        
        return (
            <span style={{
                padding: '4px 8px',
                backgroundColor: config.color,
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {config.text}
            </span>
        );
    };

    const getMethodText = (method) => {
        const methodMap = {
            'MANUAL': 'Thủ công',
            'BANK_TRANSFER': 'Chuyển khoản',
            'CASH': 'Tiền mặt',
            'E_WALLET': 'Ví điện tử'
        };
        return methodMap[method] || method;
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '40px',
                color: '#666' 
            }}>
                Đang tải lịch sử hoàn tiền...
            </div>
        );
    }

    if (refundHistory.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Không có lịch sử hoàn tiền</h4>
                <p style={{ margin: '0' }}>
                    {patientName ? `${patientName} chưa có giao dịch hoàn tiền nào.` : 'Chưa có giao dịch hoàn tiền nào.'}
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>
                    Lịch sử hoàn tiền {patientName && `- ${patientName}`}
                </h3>
                <p style={{ color: '#666', margin: '0' }}>
                    Tổng cộng: {refundHistory.length} giao dịch hoàn tiền
                </p>
            </div>
            
            <div style={{ display: 'grid', gap: '15px' }}>
                {refundHistory.map(refund => (
                    <div key={refund.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: refund.refundStatus === 'COMPLETED' ? '#d4edda' : '#fff3cd'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>
                                    Mã hoàn tiền: #{refund.id}
                                </h4>
                                {getStatusBadge(refund.refundStatus)}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ 
                                    fontSize: '18px', 
                                    fontWeight: 'bold', 
                                    color: '#28a745' 
                                }}>
                                    {refund.refundAmount ? `${refund.refundAmount.toLocaleString()} VNĐ` : '10,000 VNĐ'}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                            <div>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Ngày hẹn:</strong> {refund.appointment?.appointmentDate || 'N/A'}
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Lý do:</strong> {refund.refundReason || 'Hủy cuộc hẹn'}
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Ngày tạo:</strong> {refund.createdAt ? new Date(refund.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                            </div>
                            
                            <div>
                                {refund.refundStatus === 'COMPLETED' && (
                                    <>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>Phương thức:</strong> {getMethodText(refund.refundMethod)}
                                        </p>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>Xử lý bởi:</strong> {refund.completedBy} ({refund.completedByRole})
                                        </p>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>Hoàn tất:</strong> {refund.completedAt ? new Date(refund.completedAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {refund.notes && (
                            <div style={{ 
                                marginTop: '10px', 
                                padding: '8px', 
                                backgroundColor: '#f8f9fa', 
                                borderRadius: '4px',
                                fontSize: '13px'
                            }}>
                                <strong>Ghi chú:</strong> {refund.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserRefundHistory;
