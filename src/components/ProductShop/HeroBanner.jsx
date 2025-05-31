import { Link } from "react-router-dom"
import "./HeroBanner.css"

const HeroBanner = ({ title = "Shop", breadcrumb = ["Home", "Shop"] }) => {
  return (
    <div className="hero-banner">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="container">
          <div className="breadcrumb-nav">
            {breadcrumb.map((item, index) => (
              <span key={index}>
                <Link
                  to={index === 0 ? "/" : `/${item.toLowerCase()}`}
                  className="breadcrumb-link"
                >
                  {item}
                </Link>
                {index < breadcrumb.length - 1 && (
                  <span className="separator">›</span>
                )}
              </span>
            ))}
          </div>
          <h1 className="hero-title">{title}</h1>
        </div>
      </div>
    </div>
  )
}

export default HeroBanner