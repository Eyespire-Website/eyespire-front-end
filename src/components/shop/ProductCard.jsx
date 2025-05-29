"use client"

import "./ProductCard.css"

export default function ProductCard({ product, onAddToCart }) {
  const getColorClass = (color) => {
    const colorMap = {
      black: "color-black",
      brown: "color-brown",
      green: "color-green",
      pink: "color-pink",
      white: "color-white",
      blue: "color-blue",
    }
    return colorMap[color] || "color-gray"
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image || "/placeholder.svg"} alt={product.name} />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price}</p>

        <div className="color-options">
          {product.colors.map((color, index) => (
            <div key={index} className={`color-swatch ${getColorClass(color)}`} />
          ))}
        </div>
      </div>

      <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
        Add to Cart
      </button>
    </div>
  )
}
