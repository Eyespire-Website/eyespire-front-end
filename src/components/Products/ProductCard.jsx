import React, { useState } from "react";
import { toast } from "react-toastify";
import cartService from "../../services/cartService";
import "./Products.css";

const ProductCard = ({ name, price, imageUrl, isSale, productId, productData }) => {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      // Create product object for cart
      const product = productData || {
        id: productId,
        name: name,
        price: price.replace(/[^0-9]/g, ''), // Remove currency symbols
        imageUrl: imageUrl
      };

      await cartService.addToCart(product, null, 1); // Default color and quantity
      toast.success(`Đã thêm ${name} vào giỏ hàng!`);

      // Trigger storage event to update cart count
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
      <div
          className="product-card"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
      >
        {isSale && (
            <div
                className="view2"
                style={{
                  backgroundImage: 'url(https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/vjj2ibfx_expires_30_days.png)',
                }}
            >
              <span className="text31">{"Giảm Giá"}</span>
            </div>
        )}
        <span className="text32">{name}</span>
        <div className="row-view19">
          <div className="row-view20">
            <span className="text33">{price}</span>
          </div>
          <button
              className={`button3 ${addingToCart ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={addingToCart}
          >
          <span className="text34">
            {addingToCart ? "Đang thêm..." : "Thêm Vào Giỏ"}
          </span>
          </button>
        </div>
      </div>
  );
};

export default ProductCard;
