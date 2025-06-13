const ServicesChart = () => {
  const data = [
    { service: "Khám tổng quát", count: 45, color: "#3b82f6" },
    { service: "Điều trị bệnh", count: 32, color: "#10b981" },
    { service: "Tư vấn thiết kế", count: 28, color: "#f59e0b" },
    { service: "Phẫu thuật", count: 15, color: "#ef4444" },
    { service: "Khám định kỳ", count: 25, color: "#8b5cf6" },
  ]

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
      <div className="services-chart">
        {data.map((item, index) => (
            <div key={index} className="service-bar">
              <div className="service-info">
                <span className="service-name">{item.service}</span>
                <span className="service-count">{item.count}</span>
              </div>
              <div className="service-progress">
                <div
                    className="service-fill"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: item.color,
                    }}
                ></div>
              </div>
            </div>
        ))}
      </div>
  )
}

export default ServicesChart
