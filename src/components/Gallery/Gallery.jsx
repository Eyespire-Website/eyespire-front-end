import React, { useState } from "react";
import "./Gallery.css";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const galleryImages = [
    {
      id: 1,
      category: "clinic",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery1.jpg",
      title: "Phòng Khám Hiện Đại"
    },
    {
      id: 2,
      category: "equipment",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery2.jpg",
      title: "Thiết Bị Kiểm Tra Mắt Tiên Tiến"
    },
    {
      id: 3,
      category: "products",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery3.jpg",
      title: "Bộ Sưu Tập Kính Mắt Cao Cấp"
    },
    {
      id: 4,
      category: "clinic",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery4.jpg",
      title: "Khu Vực Chờ Thoải Mái"
    },
    {
      id: 5,
      category: "equipment",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery5.jpg",
      title: "Quét Mắt Kỹ Thuật Số"
    },
    {
      id: 6,
      category: "products",
      image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/gallery6.jpg",
      title: "Trưng Bày Gọng Kính Thiết Kế"
    }
  ];

  const categories = [
    { id: "all", name: "Tất Cả" },
    { id: "clinic", name: "Phòng Khám Của Chúng Tôi" },
    { id: "equipment", name: "Thiết Bị" },
    { id: "products", name: "Sản Phẩm" }
  ];

  const filteredImages = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeCategory);

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2 className="gallery-title">Thư Viện Ảnh Của Chúng Tôi</h2>
        <p className="gallery-subtitle">Tham quan trực quan các cơ sở và dịch vụ của chúng tôi</p>
        
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
