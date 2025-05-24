import React, { useState } from "react";
import "./Gallery.css";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const galleryImages = [
    {
      id: 1,
      category: "clinic",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery1.jpg",
      title: "Modern Examination Room"
    },
    {
      id: 2,
      category: "equipment",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery2.jpg",
      title: "Advanced Eye Testing Equipment"
    },
    {
      id: 3,
      category: "products",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery3.jpg",
      title: "Premium Eyewear Collection"
    },
    {
      id: 4,
      category: "clinic",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery4.jpg",
      title: "Comfortable Waiting Area"
    },
    {
      id: 5,
      category: "equipment",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery5.jpg",
      title: "Digital Eye Scanning"
    },
    {
      id: 6,
      category: "products",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery6.jpg",
      title: "Designer Frames Display"
    }
  ];

  const categories = [
    { id: "all", name: "All" },
    { id: "clinic", name: "Our Clinic" },
    { id: "equipment", name: "Equipment" },
    { id: "products", name: "Products" }
  ];

  const filteredImages = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeCategory);

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2 className="gallery-title">Our Gallery</h2>
        <p className="gallery-subtitle">Take a visual tour of our facilities and services</p>
        
        <div className="gallery-filter">
          {categories.map(category => (
            <button 
              key={category.id}
              className={`filter-button ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="gallery-grid">
        {filteredImages.map(item => (
          <div key={item.id} className="gallery-item">
            <img 
              src={item.image} 
              alt={item.title} 
              className="gallery-image" 
            />
            <div className="gallery-overlay">
              <h4 className="gallery-item-title">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
