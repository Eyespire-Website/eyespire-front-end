import React from "react";
import ServiceCard from "./ServiceCard";
import "./Services.css";

const Services = () => {
  const servicesData = [
    {
      id: 1,
      title: "Eye Exams",
      number: "01",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/ecthffy2_expires_30_days.png",
      description: "Quis risus sed vulputate odio ut. Vitae elementum curabitur vitae nunc velit"
    },
    {
      id: 2,
      title: "Retina Repair",
      number: "02",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/cke0ytby_expires_30_days.png",
      description: "Tortor id aliquet lectus proin nibh nisl condimentum gravida rutrum quisque"
    },
    {
      id: 3,
      title: "Dry Eye Surgery",
      number: "03",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/jtr7l0a4_expires_30_days.png",
      description: "Faucibus turpis in eu mi bibendum neque egestas congue in dictum non consectetur"
    },
    {
      id: 4,
      title: "Laser Eye Surgery",
      number: "04",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/90iw91rs_expires_30_days.png",
      description: "Dapibus ultrices in iaculis nunc sed. Non diam phasellus vestibulum lorem sed risus ultricies"
    },
    {
      id: 5,
      title: "Optical Service",
      number: "05",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/91cudbug_expires_30_days.png",
      description: "Ultrices neque ornare aenean euismod elementum. Integer feugiat scelerisque varius"
    },
    {
      id: 6,
      title: "Surgical Procedure",
      number: "06",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/b115wlay_expires_30_days.png",
      description: "Massa enim nec dui nunc mattis enim ut tellus. Adipiscing diam donec adipiscing tristique"
    }
  ];

  return (
    <div className="column7">
      <div className="row-view10">
        <span className="text17">{"Our Eye Care Services"}</span>
        <span className="text18">
          {"Curabitur vitae nunc sed velit dignissim sodales pretium"}
        </span>
      </div>
      <div className="row-view11">
        {servicesData.slice(0, 3).map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            number={service.number}
            imageUrl={service.imageUrl}
            description={service.description}
          />
        ))}
      </div>
      <div className="row-view14">
        {servicesData.slice(3, 6).map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            number={service.number}
            imageUrl={service.imageUrl}
            description={service.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
