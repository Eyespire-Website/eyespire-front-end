"use client"

import "./ProductInfo.css"

export default function ProductInfo({
  product,
  selectedColor,
  onColorSelect,
  quantity,
  onQuantityChange,
  onAddToCart,
}) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`pi-star ${i < rating ? "pi-filled" : ""}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="pi-product-info">
      {/* Rating */}
      <div className="pi-rating-section">
        <div className="pi-stars">{renderStars(product.rating)}</div>
        <span className="pi-review-count">({product.reviewCount} review)</span>
      </div>

      {/* Product Name */}
      <h1 className="pi-product-name">{product.name}</h1>

      {/* Color Selection */}
      <div className="pi-color-section">
        <h3>Choose color</h3>
        <div className="pi-color-options">
          {product.colors.map((color) => (
            <button
              key={color.id}
              className={`pi-color-option ${selectedColor.id === color.id ? "pi-selected" : ""}`}
              onClick={() => onColorSelect(color)}
              style={{ backgroundColor: color.color }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="pi-price-section">
        {product.originalPrice && <span className="pi-original-price">${product.originalPrice}</span>}
        <span className="pi-current-price">${product.price}</span>
      </div>

      {/* Quantity */}
      <div className="pi-quantity-section">
        <label htmlFor="quantity">Quantity:</label>
        <div className="pi-quantity-controls">
          <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))}>-</button>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, Number.parseInt(e.target.value) || 1))}
            min="1"
          />
          <button onClick={() => onQuantityChange(quantity + 1)}>+</button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button className="pi-add-to-cart-btn" onClick={onAddToCart}>
        Select Glasses
      </button>
    </div>
  )
}