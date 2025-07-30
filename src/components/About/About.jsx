import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="row-view15">
      <div className="column9">
        <span className="text24">
          {"Đạt Được Kết Quả Thị Trường Tốt Hơn"}
        </span>
        <span className="text25">
          {"Chúng tôi cam kết mang đến dịch vụ chăm sóc mắt chất lượng cao với công nghệ hiện đại và đội ngũ bác sĩ giàu kinh nghiệm."}
        </span>
        <div className="row-view16">
          <span className="text26">{""}</span>
          <span className="text27">{"Khám Mắt Toàn Diện V.EYE.P 360"}</span>
        </div>
        <div className="row-view16">
          <span className="text26">{""}</span>
          <span className="text27">{"Chăm Sóc Mắt Ở Mọi Lứa Tuổi"}</span>
        </div>
        <div className="row-view17">
          <span className="text26">{""}</span>
          <span className="text27">{"Kính Mắt và Kính Áp Tròng"}</span>
        </div>
        <button className="button2" onClick={() => alert("Pressed!")}>
          <span className="text28">{"Về Chúng Tôi"}</span>
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
