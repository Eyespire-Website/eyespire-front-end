const RevenueChart = () => {
  const data = [
    { month: "T1", orders: 8, appointments: 4 },
    { month: "T2", orders: 12, appointments: 7 },
    { month: "T3", orders: 10, appointments: 5 },
    { month: "T4", orders: 15, appointments: 10 },
    { month: "T5", orders: 13, appointments: 9 },
    { month: "T6", orders: 18, appointments: 12 },
  ]

  const maxValue = Math.max(...data.map((d) => Math.max(d.orders, d.appointments)))

  return (
      <div className="revenue-chart">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' }}></div>
            <span>Doanh thu đơn hàng</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)' }}></div>
            <span>Doanh thu cuộc hẹn</span>
          </div>
        </div>
        <div className="chart-bars">
          {data.map((item, index) => (
              <div key={index} className="bar-group">
                <div className="bar-container">
                  <div
                      className="bar orders-bar"
                      style={{ height: `${(item.orders / maxValue) * 100}%` }}
                      title={`Doanh thu đơn hàng: ₫${item.orders}M`}
                  ></div>
                  <div
                      className="bar appointments-bar"
                      style={{ height: `${(item.appointments / maxValue) * 100}%` }}
                      title={`Doanh thu cuộc hẹn: ₫${item.appointments}M`}
                  ></div>
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
          ))}
        </div>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng đơn hàng</span>
            <span className="summary-value">₫76M</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tổng cuộc hẹn</span>
            <span className="summary-value">₫47M</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tăng trưởng chung</span>
            <span className="summary-value positive">+15.2%</span>
          </div>
        </div>
      </div>
  )
}

export default RevenueChart
