"use client"
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import "./RelatedProducts.css"

export default function RelatedProducts({ products }) {
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

    // Function to process image URL (same logic as ProductGallery)
    const processImageUrl = (imageUrl) => {
        if (!imageUrl) return "/placeholder.svg";

        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }

        return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${imageUrl}`;
    };

    const handleAddToCart = (product) => {
        console.log("Adding to cart:", product)
        // Implement cart logic here
    }

    if (!Array.isArray(products)) {
        return null;
    }

    return (
        <section className="st-related-products-wrapper">
            <div className="st-related-products-container">
                <h2 className="st-section-title">
                    These would <span className="st-highlight">Look Good</span>
                </h2>

                <div className="st-products-grid">
                    {products.map((product) => (
                        <div className="st-product-card" key={product.id}>
                            <Link
                                to={`/product/${product.id}`}
                                className="st-product-link"
                            >
                                <div className="st-product-image">
                                    <img
                                        src={processImageUrl(product.images?.[0] || product.imageUrl || "/placeholder.svg")}
                                        alt={product.name}
                                        loading="lazy"
                                    />
                                </div>

                                <div className="st-product-info">
                                    <h3 className="st-product-name">{product.name}</h3>
                                    <p className="st-product-price">${product.price}</p>

                                    <div className="st-color-options">
                                        {product.colors?.map((color, index) => (
                                            <div
                                                key={`${product.id}-color-${index}`}
                                                className={`st-color-swatch ${getColorClass(color)}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Link>
                            <button
                                className="st-add-to-cart-btn"
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
            imageUrl: PropTypes.string, // Added imageUrl to PropTypes
            images: PropTypes.arrayOf(PropTypes.string), // Added images to PropTypes
            colors: PropTypes.arrayOf(PropTypes.string),
        })
    ).isRequired,
}