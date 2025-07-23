import React, { useState, useEffect } from 'react';
import dashboardService from '../../../../services/dashboardService';

const AppointmentStatusChart = () => {
    const [appointmentStats, setAppointmentStats] = useState({
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppointmentStats = async () => {
            try {
                setLoading(true);
                const stats = await dashboardService.getAppointmentStats();
                setAppointmentStats(stats);
                setError(null);
            } catch (err) {
                console.error('Lỗi khi lấy thống kê cuộc hẹn:', err);
                setError('Không thể tải dữ liệu');
                // Sử dụng dữ liệu fallback
                setAppointmentStats({
                    pending: 5,
                    confirmed: 8,
                    completed: 12,
                    cancelled: 2
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAppointmentStats();
    }, []);

    // Tính toán dữ liệu cho biểu đồ
    const total = appointmentStats.pending + appointmentStats.confirmed + appointmentStats.completed + appointmentStats.cancelled;
    
    const data = [
        { 
            status: "Hoàn thành", 
            count: appointmentStats.completed, 
            color: "#10b981", 
            percentage: total > 0 ? (appointmentStats.completed / total) * 100 : 0 
        },
        { 
            status: "Đã xác nhận", 
            count: appointmentStats.confirmed, 
            color: "#3b82f6", 
            percentage: total > 0 ? (appointmentStats.confirmed / total) * 100 : 0 
        },
        { 
            status: "Chờ xác nhận", 
            count: appointmentStats.pending, 
            color: "#f59e0b", 
            percentage: total > 0 ? (appointmentStats.pending / total) * 100 : 0 
        },
        { 
            status: "Đã hủy", 
            count: appointmentStats.cancelled, 
            color: "#ef4444", 
            percentage: total > 0 ? (appointmentStats.cancelled / total) * 100 : 0 
        },
    ];

    if (loading) {
        return (
            <div className="appointment-chart">
                <div className="chart-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="appointment-chart">
            <div className="donut-chart">
                <svg viewBox="0 0 100 100" className="donut-svg">
                    {data.map((item, index) => {
                        const radius = 35
                        const circumference = 2 * Math.PI * radius
                        const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
                        const strokeDashoffset = -data
                            .slice(0, index)
                            .reduce((acc, curr) => acc + (curr.percentage / 100) * circumference, 0)

                        return (
                            <circle
                                key={index}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="8"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="donut-segment"
                            />
                        )
                    })}
                </svg>
                <div className="donut-center">
                    <span className="donut-total">{total}</span>
                    <span className="donut-label">Tổng</span>
                </div>
            </div>
            <div className="chart-legend-list">
                {error && (
                    <div className="chart-error">
                        <p>⚠️ {error} - Hiển thị dữ liệu mẫu</p>
                    </div>
                )}
                {data.map((item, index) => (
                    <div key={index} className="legend-row">
                        <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                        <span className="legend-text">{item.status}</span>
                        <span className="legend-count">{item.count}</span>
                        <span className="legend-percentage">({item.percentage.toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AppointmentStatusChart
