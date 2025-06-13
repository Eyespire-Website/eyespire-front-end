"use client"
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import "./RelatedProducts.css"

export default function RelatedProducts({ products }) {
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

  const handleAddToCart = (product) => {
    console.log("Adding to cart:", product)
    // Implement cart logic here
  }

  if (!Array.isArray(products)) {
    return null;
  }

  return (
    <section className="related-products-wrapper">
      <div className="related-products-container">
        <h2 className="section-title">
          These would <span className="highlight">Look Good</span>
        </h2>

        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <Link
                to={`/shop/${product.id}`}
                className="product-link"
              >
                <div className="product-image">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price}</p>

                  <div className="color-options">
                    {product.colors?.map((color, index) => (
                      <div
                        key={`${product.id}-color-${index}`}
                        className={`color-swatch ${getColorClass(color)}`}
                      />
                    ))}
                  </div>
                </div>
              </Link>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
                aria-label={`Add ${product.name} to cart`}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

RelatedProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      image: PropTypes.string,
      colors: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
}