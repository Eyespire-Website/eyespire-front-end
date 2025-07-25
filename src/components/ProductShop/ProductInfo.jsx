"use client"
import "./ProductInfo.css"

export default function ProductInfo({
                                        product,
                                        feedbacks, // Added feedbacks prop
                                        renderStars, // Added renderStars prop
                                        selectedColor,
                                        onColorSelect,
                                        quantity,
                                        onQuantityChange,
                                        onAddToCart,
                                        addingToCart,
                                    }) {
    // Calculate average rating and review count from feedbacks
    const averageRating = feedbacks?.length > 0
        ? Math.round(
            feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length
        )
        : product.rating || 0;
    const reviewCount = feedbacks?.length || product.reviewCount || 0;

    return (
        <div className="pi-product-info">
            {/* Rating */}
            <div className="pi-rating-section">
                <div className="pi-stars">{renderStars(averageRating)}</div>
                <span className="pi-review-count">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
            </div>

            {/* Product Name */}
            <h1 className="pi-product-name">{product.name}</h1>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
                <div className="pi-color-section">
                    <h3>Choose color</h3>
                    <div className="pi-color-options">
                        {product.colors.map((color) => (
                            <button
                                key={color.id}
                                className={`pi-color-option ${selectedColor && selectedColor.id === color.id ? "pi-selected" : ""}`}
                                onClick={() => onColorSelect(color)}
                                style={{ backgroundColor: color.color }}
                                title={color.name}
                                disabled={addingToCart}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Price */}
            <div className="pi-price-section">
                <span className="pi-current-price">{product.price}₫</span>
                {product.originalPrice && <span className="pi-original-price">{product.originalPrice}₫</span>}
            </div>

            {/* Quantity */}
            <div className="pi-quantity-section">
                <label htmlFor="quantity">Quantity:</label>
                <div className="pi-quantity-controls">
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        disabled={addingToCart}
                    >-</button>
                    <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => onQuantityChange(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        min="1"
                        disabled={addingToCart}
                    />
                    <button
                        onClick={() => onQuantityChange(quantity + 1)}
                        disabled={addingToCart}
                    >+</button>
                </div>
            </div>

            {/* Add to Cart Button */}
            <button
                className={`pi-add-to-cart-btn ${addingToCart ? 'pi-loading' : ''}`}
                onClick={onAddToCart}
                disabled={addingToCart}
            >
                {addingToCart ? 'Đang thêm...' : 'Mua'}
            </button>
        </div>
    );
}