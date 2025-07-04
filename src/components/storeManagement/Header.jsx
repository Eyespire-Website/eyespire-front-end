import "./stmStyle/STM-Header.css"

const Header = ({ title }) => {
  return (
    <header className="mc-hdr">
      <h1 className="mc-title">{title}</h1>
      <div className="mc-actions">
        <button className="btn btn-secondary">Store Manager</button>
        
      </div>
    </header>
  )
}

export default Header
