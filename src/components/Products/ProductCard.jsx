import React from "react";
import "./Products.css";

const ProductCard = ({ name, price, imageUrl, isSale }) => {
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
          <span className="text31">{"Sale"}</span>
        </div>
      )}
      <span className="text32">{name}</span>
      <div className="row-view19">
        <div className="row-view20">
          <span className="text33">{price}</span>
        </div>
        <button className="button3" onClick={() => alert("Added to cart!")}>
          <span className="text34">{"Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
