import React, { useState } from 'react';
import ManualRefundList from '../../../components/ManualRefundList';
import RefundStats from '../../../components/RefundStats';
import UserRefundHistory from '../../../components/UserRefundHistory';

const RefundManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedPatientName, setSelectedPatientName] = useState('');

    const tabs = [
        { id: 'pending', label: 'Chờ xử lý', icon: '⏳' },
        { id: 'stats', label: 'Thống kê', icon: '📊' },
        { id: 'history', label: 'Lịch sử', icon: '📋' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'pending':
                return <ManualRefundList />;
            case 'stats':
                return <RefundStats />;
            case 'history':
                return (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Nhập ID bệnh nhân để xem lịch sử hoàn tiền..."
                                value={selectedUserId || ''}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    width: '300px',
                                    marginRight: '10px'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Tên bệnh nhân (tùy chọn)"
                                value={selectedPatientName}
                                onChange={(e) => setSelectedPatientName(e.target.value)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    width: '200px'
                                }}
                            />
                        </div>
                        {selectedUserId && (
                            <UserRefundHistory 
                                userId={selectedUserId} 
                                patientName={selectedPatientName}
                            />
                        )}
                        {!selectedUserId && (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: '#666',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                Nhập ID bệnh nhân để xem lịch sử hoàn tiền
                            </div>
                        )}
                    </div>
                );
            default:
                return <ManualRefundList />;
        }
    };

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
            
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                borderBottom: '2px solid #dee2e6',
                marginBottom: '20px'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#666',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            marginRight: '5px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Tab Content */}
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default RefundManagement;
