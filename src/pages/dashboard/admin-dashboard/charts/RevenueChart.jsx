const RevenueChart = () => {
  const data = [
    { month: "T1", revenue: 25.5, target: 30 },
    { month: "T2", revenue: 32.1, target: 35 },
    { month: "T3", revenue: 28.8, target: 32 },
    { month: "T4", revenue: 41.2, target: 38 },
    { month: "T5", revenue: 38.9, target: 40 },
    { month: "T6", revenue: 45.2, target: 42 },
  ]

  const maxValue = Math.max(...data.map((d) => Math.max(d.revenue, d.target)))

  return (
      <div className="revenue-chart">
        <div className="chart-bars">
          {data.map((item, index) => (
              <div key={index} className="bar-group">
                <div className="bar-container">
                  <div
                      className="bar revenue-bar"
                      style={{ height: `${(item.revenue / maxValue) * 100}%` }}
                      title={`Doanh thu: ₫${item.revenue}M`}
                  ></div>
                  <div
                      className="bar target-bar"
                      style={{ height: `${(item.target / maxValue) * 100}%` }}
                      title={`Mục tiêu: ₫${item.target}M`}
                  ></div>
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
          ))}
        </div>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng doanh thu</span>
            <span className="summary-value">₫211.7M</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tăng trưởng</span>
            <span className="summary-value positive">+18.5%</span>
          </div>
        </div>
      </div>
  )
}

export default RevenueChart
