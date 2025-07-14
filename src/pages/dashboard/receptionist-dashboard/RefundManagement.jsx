import React from 'react';
import ManualRefundList from '../../../components/ManualRefundList';

const RefundManagement = () => {
    return (
        <div className="refund-management">
            <div style={{ 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    Quản lý hoàn tiền
                </h2>
                <p style={{ margin: '0', color: '#666' }}>
                    Quản lý các cuộc hẹn đã hủy cần hoàn tiền thủ công cho bệnh nhân
                </p>
            </div>
            
            <ManualRefundList />
        </div>
    );
};

export default RefundManagement;
