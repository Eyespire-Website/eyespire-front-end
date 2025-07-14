import React from "react";
import ProductCard from "./ProductCard";
import "./Products.css";

const Products = () => {
  const productsData = [
    {
      id: 1,
      name: "Glasses RX 6462 (2502)",
      price: "2.800.000₫",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/jormflwm_expires_30_days.png",
      isSale: true
    },
    {
      id: 2,
      name: "Sunglasses Classic",
      price: "2.200.000₫",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/jormflwm_expires_30_days.png",
      isSale: false
    },
    {
      id: 3,
      name: "Contact Lenses Monthly",
      price: "1.500.000₫",
      imageUrl: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/jormflwm_expires_30_days.png",
      isSale: false
    }
  ];

  return (
    <div className="row-view18">
      <div className="column2 products-intro">
        <span className="text29">{"The Best Selling Products"}</span>
        <span className="text30">
          {"Risus commodo viverra maecenas accumsan lacus vel facilisis. Fermentum iaculis eu non diam phasellus vestibulum lorem."}
        </span>
        <button className="button2" onClick={() => alert("Pressed!")}>
          <span className="text28">{"See All"}</span>
        </button>
      </div>
      <div className="products-container">
        {productsData.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
            isSale={product.isSale}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
