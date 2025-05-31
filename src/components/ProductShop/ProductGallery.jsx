"use client"
import "./ProductGallery.css"

export default function ProductGallery({ images, selectedImage, onImageSelect, productName }) {
  return (
    <div className="product-gallery">
      {/* Main Image */}
      <div className="main-image">
        <img src={images[selectedImage] || "/placeholder.svg"} alt={`${productName} - View ${selectedImage + 1}`} />
      </div>

      {/* Thumbnail Images */}
      <div className="thumbnail-grid">
        {images.map((image, index) => (
          <button
            key={index}
            className={`thumbnail ${index === selectedImage ? "active" : ""}`}
            onClick={() => onImageSelect(index)}
          >
            <img src={image || "/placeholder.svg"} alt={`${productName} - Thumbnail ${index + 1}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
