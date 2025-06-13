const AppointmentStatusChart = () => {
    const data = [
        { status: "Hoàn thành", count: 142, color: "#10b981", percentage: 71 },
        { status: "Đã xác nhận", count: 35, color: "#3b82f6", percentage: 17.5 },
        { status: "Chờ xác nhận", count: 18, color: "#f59e0b", percentage: 9 },
        { status: "Đã hủy", count: 5, color: "#ef4444", percentage: 2.5 },
    ]

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
                    <span className="donut-total">200</span>
                    <span className="donut-label">Tổng</span>
                </div>
            </div>
            <div className="chart-legend-list">
                {data.map((item, index) => (
                    <div key={index} className="legend-row">
                        <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                        <span className="legend-text">{item.status}</span>
                        <span className="legend-count">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AppointmentStatusChart
