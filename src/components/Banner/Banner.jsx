import React, { useState } from "react";
import "./Banner.css";
import homepage_header_1 from "../../assets/homepage_header_1.jpg";
import homepage_header_2 from "../../assets/homepage_header_2.jpg";

const Banner = () => {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="row-view6">
      {/* Phần bên trái */}
      <div className="column3">
        <span className="text7">
          {"The Best Eye Doctors & Technology"}
        </span>
        <div className="column4">
          <input
            placeholder={"Search Service"}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="input"
          />
          <button className="button" onClick={() => alert("Pressed!")}>
            <span className="text8">{""}</span>
          </button>
        </div>
        
        {/* Phần thống kê */}
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">8+</span>
            <span className="stat-text">High Qualified Doctors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-text">Positive Feedback</span>
          </div>
        </div>
        
        {/* Phần khuyến mãi */}
        <div className="promo-box">
          <h3 className="promo-title">100% Modern Eye Equipment</h3>
          <p className="promo-desc">Explore advanced eye exam tools like Auto Refractors, OCT machines, and Phacoemulsification systems from Germany, USA, Japan, and Switzerland for top-quality care at our clinic.</p>
          <img
            src={homepage_header_2}
          />
        </div>
      </div>
      
      {/* Phần hình ảnh bên phải */}
      <div className="column5">
        <div className="view">
          <img
            src={homepage_header_1}
            className="image4"
            alt="Eye doctor"
          />
        </div>
        
        {/* Phần thống kê 550+ */}
        <div className="success-stats">
          <span className="text9">
            {"550+"}
          </span>
          <span className="text10">
            {"Successfully\nEye Surgery"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
