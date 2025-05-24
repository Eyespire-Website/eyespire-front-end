import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <div className="row-view">
      <div className="row-view2">
        <img
          src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"}
          className="image"
        />
        <span className="text">{"Eyespire"}</span>
      </div>
      <div className="column2">
        <div className="row-view3">
          <div className="row-view4">
            <span className="text2">{"Home"}</span>
            <span className="text3">{""}</span>
          </div>
          <span className="text4">{"About"}</span>
          <div className="row-view4">
            <span className="text5">{"Services"}</span>
            <span className="text3">{""}</span>
          </div>
          <div className="row-view4">
            <span className="text5">{"Shop"}</span>
            <span className="text3">{""}</span>
          </div>
          <div className="row-view4">
            <span className="text2">{"Blog"}</span>
            <span className="text3">{""}</span>
          </div>
        </div>
        <img
          src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/w8okmquz_expires_30_days.png"}
          className="image2"
        />
      </div>
      <div className="row-view5">
        <span className="text6">{"+123 45 67 890"}</span>
        <img
          src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/u7cc0lma_expires_30_days.png"}
          className="image3"
        />
      </div>
    </div>
  );
};

export default Header;
