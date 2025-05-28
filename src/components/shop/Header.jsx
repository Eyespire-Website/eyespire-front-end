import "./Header.css"

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <span>O</span>
              </div>
              <span className="logo-text">OptiOne</span>
            </div>
            <nav className="nav">
              <a href="#" className="nav-link">
                Home
              </a>
              <a href="#" className="nav-link">
                About
              </a>
              <div className="nav-dropdown">
                <a href="#" className="nav-link">
                  Services ▼
                </a>
              </div>
              <div className="nav-dropdown">
                <a href="#" className="nav-link">
                  Shop ▼
                </a>
              </div>
              <div className="nav-dropdown">
                <a href="#" className="nav-link">
                  Blog ▼
                </a>
              </div>
            </nav>
          </div>
          <div className="header-right">
            <span className="phone">📞 +123 45 67 890</span>
            <div className="help-icon">?</div>
          </div>
        </div>
      </div>
    </header>
  )
}
