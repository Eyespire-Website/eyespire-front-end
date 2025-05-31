import "./Footer.css"

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <div className="logo-icon">
                <span>O</span>
              </div>
              <span className="logo-text">OptiOne</span>
            </div>
            <p className="footer-description">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat.
            </p>
            <div className="social-links">
              <span>📘</span>
              <span>📷</span>
              <span>🐦</span>
              <span>📺</span>
            </div>
          </div>

          <div className="footer-section">
            <h4>Useful Links</h4>
            <ul>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Services</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Shop</a>
              </li>
              <li>
                <a href="#">Contacts</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Latest News</h4>
            <div className="news-item">
              <h5>Is It OK to Wear Your Glasses All the Time?</h5>
              <p>August, 01 • No Comments</p>
            </div>
            <div className="news-item">
              <h5>Answers About Ortho-K (Orthokeratology)</h5>
              <p>August, 01 • No Comments</p>
            </div>
          </div>

          <div className="footer-section">
            <div className="image-gallery">
              <img src="/placeholder.svg?height=60&width=60" alt="Gallery 1" />
              <img src="/placeholder.svg?height=60&width=60" alt="Gallery 2" />
              <img src="/placeholder.svg?height=60&width=60" alt="Gallery 3" />
              <img src="/placeholder.svg?height=60&width=60" alt="Gallery 4" />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Copyright © OptiOne Template All rights reserved Copyright 2022</p>
        </div>
      </div>
    </footer>
  )
}
