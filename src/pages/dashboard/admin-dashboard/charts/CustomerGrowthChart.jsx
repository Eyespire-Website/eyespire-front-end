const CustomerGrowthChart = () => {
  const data = [
    { month: "T1", new: 45, returning: 32 },
    { month: "T2", new: 52, returning: 38 },
    { month: "T3", new: 48, returning: 42 },
    { month: "T4", new: 61, returning: 45 },
    { month: "T5", new: 58, returning: 48 },
    { month: "T6", new: 67, returning: 52 },
  ]

  const maxValue = Math.max(...data.map((d) => d.new + d.returning))

  return (
      <div className="customer-growth-chart">
        <div className="growth-bars">
          {data.map((item, index) => (
              <div key={index} className="growth-bar-group">
                <div className="stacked-bar">
                  <div
                      className="bar-segment new-customers"
                      style={{ height: `${(item.new / maxValue) * 100}%` }}
                      title={`Khách hàng mới: ${item.new}`}
                  ></div>
                  <div
                      className="bar-segment returning-customers"
                      style={{ height: `${(item.returning / maxValue) * 100}%` }}
                      title={`Khách hàng quay lại: ${item.returning}`}
                  ></div>
                </div>
                <span className="growth-label">{item.month}</span>
              </div>
          ))}
        </div>
        <div className="growth-summary">
          <div className="growth-metric">
            <span className="metric-label">Tổng khách hàng mới</span>
            <span className="metric-value">331</span>
            <span className="metric-change positive">+23%</span>
          </div>
          <div className="growth-metric">
            <span className="metric-label">Tỷ lệ quay lại</span>
            <span className="metric-value">68%</span>
            <span className="metric-change positive">+5%</span>
          </div>
        </div>
      </div>
  )
}

export default CustomerGrowthChart
