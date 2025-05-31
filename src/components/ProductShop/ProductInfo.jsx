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
      <span key={i} className={`star ${i < rating ? "filled" : ""}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="product-info">
      {/* Rating */}
      <div className="rating-section">
        <div className="stars">{renderStars(product.rating)}</div>
        <span className="review-count">({product.reviewCount} review)</span>
      </div>

      {/* Product Name */}
      <h1 className="product-name">{product.name}</h1>

      {/* Color Selection */}
      <div className="color-section">
        <h3>Choose color</h3>
        <div className="color-options">
          {product.colors.map((color) => (
            <button
              key={color.id}
              className={`color-option ${selectedColor.id === color.id ? "selected" : ""}`}
              onClick={() => onColorSelect(color)}
              style={{ backgroundColor: color.color }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="price-section">
        {product.originalPrice && <span className="original-price">${product.originalPrice}</span>}
        <span className="current-price">${product.price}</span>
      </div>

      {/* Quantity */}
      <div className="quantity-section">
        <label htmlFor="quantity">Quantity:</label>
        <div className="quantity-controls">
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
      <button className="add-to-cart-btn" onClick={onAddToCart}>
        Select Glasses
      </button>
    </div>
  )
}
