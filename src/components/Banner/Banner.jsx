import React, { useState } from "react";
import "./Banner.css";
import homepage_header_1 from "../../assets/homepage_header_1.jpg";

const Banner = () => {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="row-view6">
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
      </div>
      <div className="column5">
        <div className="view">
          <img
            src={homepage_header_1}
            className="image4"
            alt="Eye doctor"
          />
        </div>
        <img
          src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/h1lgx2ut_expires_30_days.png"}
          className="image5"
          alt="Decoration"
        />
      </div>
      <div className="absolute-column"
        style={{
          backgroundImage: 'url(https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/bdkb2f6i_expires_30_days.png)',
        }}
      >
        <span className="text9">
          {"550+"}
        </span>
        <span className="text10">
          {"Successfully\nEye Surgery"}
        </span>
      </div>
    </div>
  );
};

export default Banner;
