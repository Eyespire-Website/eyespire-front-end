import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="row-view15">
      <div className="column9">
        <span className="text24">
          {"Getting Better Visual Field Results"}
        </span>
        <span className="text25">
          {"Quis risus sed vulputate odio ut. Vitae elementum curabitur vitae nunc sed velit dignissim sodales. Orci ac auctor augue mauris augue neque gravida"}
        </span>
        <div className="row-view16">
          <span className="text26">{""}</span>
          <span className="text27">{"V.EYE.P 360 Exams"}</span>
        </div>
        <div className="row-view16">
          <span className="text26">{""}</span>
          <span className="text27">{"Eye Care at Every Age"}</span>
        </div>
        <div className="row-view17">
          <span className="text26">{""}</span>
          <span className="text27">{"Eyeglasses and Contact Lenses"}</span>
        </div>
        <button className="button2" onClick={() => alert("Pressed!")}>
          <span className="text28">{"About Us"}</span>
        </button>
      </div>
      <img
        src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/o7kerqoa_expires_30_days.png"}
        className="image8"
      />
    </div>
  );
};

export default About;
