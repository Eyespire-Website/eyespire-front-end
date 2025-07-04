"use client"
import { Link } from "react-router-dom";
import "./ProductCard.css"

export default function ProductCard({ product, onAddToCart }) {
  const getColorClass = (color) => {
    const colorMap = {
      black: "st-color-black",
      brown: "st-color-brown",
      green: "st-color-green",
      pink: "st-color-pink",
      white: "st-color-white",
      blue: "st-color-blue",
    }
    return colorMap[color] || "st-color-gray"
  }

  return (
    <div className="st-product-card">
      <Link to={`/product/${product.id}`} className="st-product-link">
        <div className="st-product-image">
          <img src={product.image || "/placeholder.svg"} alt={product.name} />
        </div>
        <div className="st-product-info">
          <h3 className="st-product-name">{product.name}</h3>
          <p className="st-product-price">${product.price}</p>
          <div className="st-color-options">
            {product.colors.map((color, index) => (
              <div key={index} className={`st-color-swatch ${getColorClass(color)}`} />
            ))}
          </div>
        </div>
      </Link>
      <button className="st-add-to-cart-btn" onClick={() => onAddToCart(product)}>
        Add to Cart
      </button>
    </div>
  )
}