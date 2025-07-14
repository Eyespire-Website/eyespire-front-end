"use client"
import "./ProductGallery.css"

export default function ProductGallery({ images, selectedImage, onImageSelect, productName }) {
  // Function to process image URL (same logic as ProductCard)
  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg";
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${imageUrl}`;
  };

  return (
    <div className="product-gallery">
      {/* Main Image */}
      <div className="main-image">
        <img 
          src={processImageUrl(images[selectedImage])} 
          alt={`${productName} - View ${selectedImage + 1}`} 
          loading="lazy"
        />
      </div>

      {/* Thumbnail Images */}
      <div className="thumbnail-grid">
        {images.map((image, index) => (
          <button
            key={index}
            className={`thumbnail ${index === selectedImage ? "active" : ""}`}
            onClick={() => onImageSelect(index)}
          >
            <img 
              src={processImageUrl(image)} 
              alt={`${productName} - Thumbnail ${index + 1}`} 
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
