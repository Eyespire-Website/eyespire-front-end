import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as refundsService from '../services/refundsService';

// Component thống kê hoàn tiền cho Admin
const RefundStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Đầu tháng
        endDate: new Date().toISOString().split('T')[0] // Hôm nay
    });

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const statsData = await refundsService.getRefundStats(dateRange.startDate, dateRange.endDate);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching refund stats:', error);
            toast.error('Không thể tải thống kê hoàn tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
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
                Đang tải thống kê...
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0' }}>Thống kê hoàn tiền</h3>
                
                {/* Date Range Picker */}
                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    alignItems: 'center',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Từ ngày:
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Đến ngày:
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <button
                        onClick={fetchStats}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        Cập nhật
                    </button>
                </div>
            </div>

            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {/* Tổng số hoàn tiền */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '8px',
                        border: '1px solid #bbdefb'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
                            Tổng số giao dịch
                        </h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                            {stats.totalRefunds || 0}
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            giao dịch hoàn tiền
                        </p>
                    </div>

                    {/* Tổng số tiền hoàn */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '8px',
                        border: '1px solid #c8e6c9'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>
                            Tổng số tiền hoàn
                        </h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
                            {stats.totalAmount ? `${stats.totalAmount.toLocaleString()} VNĐ` : '0 VNĐ'}
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            đã hoàn cho bệnh nhân
                        </p>
                    </div>

                    {/* Hoàn tiền đang chờ */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '8px',
                        border: '1px solid #ffcc02'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>
                            Đang chờ xử lý
                        </h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
                            {stats.pendingRefunds || 0}
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            giao dịch chờ xử lý
                        </p>
                    </div>

                    {/* Hoàn tiền hoàn tất */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '8px',
                        border: '1px solid #4caf50'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>
                            Đã hoàn tất
                        </h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                            {stats.completedRefunds || 0}
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            giao dịch hoàn tất
                        </p>
                    </div>
                </div>
            )}

            {/* Breakdown by method */}
            {stats && stats.byMethod && (
                <div style={{ marginTop: '30px' }}>
                    <h4 style={{ margin: '0 0 15px 0' }}>Phân tích theo phương thức hoàn tiền</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {Object.entries(stats.byMethod).map(([method, count]) => (
                            <div key={method} style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                                    {count}
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    {method === 'MANUAL' && 'Thủ công'}
                                    {method === 'BANK_TRANSFER' && 'Chuyển khoản'}
                                    {method === 'CASH' && 'Tiền mặt'}
                                    {method === 'E_WALLET' && 'Ví điện tử'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!stats && !loading && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Không có dữ liệu thống kê</h4>
                    <p style={{ margin: '0' }}>
                        Chưa có giao dịch hoàn tiền nào trong khoảng thời gian đã chọn.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RefundStats;
