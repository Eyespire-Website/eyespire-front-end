import React from "react";
import "./Services.css";

const ServiceCard = ({ title, number, imageUrl, description }) => {
  return (
    <div className="column2 service-card">
      <div className="row-view12">
        <span className="text19">{title}</span>
        <span className="text20">{number}</span>
      </div>
      <img src={imageUrl} className="image7" />
      <span className="text21">{description}</span>
      <div className="row-view13">
        <span className="text22">{"Get Service"}</span>
        <span className="text23">{""}</span>
      </div>
    </div>
  );
};

export default ServiceCard;
