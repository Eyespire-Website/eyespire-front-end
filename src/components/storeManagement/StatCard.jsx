import "./stmStyle/STM-StatCard.css"

const StatCard = ({ title, value, change, icon, changeType = "neutral" }) => {
  return (
    <div className="stat-card">
      <div className="stat-hdr">
        <span className="stat-title">{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${changeType}`}>{change}</div>
    </div>
  )
}

export default StatCard
