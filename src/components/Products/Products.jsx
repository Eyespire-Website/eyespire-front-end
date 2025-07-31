import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import "./Products.css";
import productService from "../../services/productService";
import feedbackService from "../../services/feedbackService";

const Products = () => {
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  const fallbackImage = "https://placehold.co/300x300?text=Product";

  // Normalize image URL
  const getFullUrl = (url) => {
    if (!url || url.trim() === "") {
      return fallbackImage;
    }
    return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
  };

  // Fetch best selling products from database
  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all products from API
        const allProducts = await productService.getAllProducts();

        // Filter products with sales > 0, sort by sales descending, take top 3
        const bestSellingProducts = await Promise.all(
            allProducts
                .filter((product) => product && product.id && product.sales > 0)
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 3)
                .map(async (product) => {
                  try {
                    // Get feedback for rating calculation
                    const feedbacks = await feedbackService.getFeedbackByProductId(product.id);
                    const averageRating = feedbacks.length
                        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length)
                        : 0;

                    return {
                      id: product.id,
                      name: product.name || "Sản phẩm không có tên",
                      price: `${Number(product.price || 0).toLocaleString("vi-VN")}₫`,
                      imageUrl: getFullUrl(product.imageUrl),
                      isSale: product.sales > 10, // Consider as "sale" if sold more than 10 units
                      sales: Number(product.sales) || 0,
                      rating: parseFloat(averageRating.toFixed(1))
                    };
                  } catch (err) {
                    console.warn(`Error fetching feedback for product ${product.id}:`, err);
                    return {
                      id: product.id,
                      name: product.name || "Sản phẩm không có tên",
                      price: `${Number(product.price || 0).toLocaleString("vi-VN")}₫`,
                      imageUrl: getFullUrl(product.imageUrl),
                      isSale: product.sales > 10,
                      sales: Number(product.sales) || 0,
                      rating: 0
                    };
                  }
                })
        );

        // If no best selling products found, get top 3 products by price
        if (bestSellingProducts.length === 0) {
          const fallbackProducts = allProducts
              .sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
              .slice(0, 3)
              .map((product) => ({
                id: product.id,
                name: product.name || "Sản phẩm không có tên",
                price: `${Number(product.price || 0).toLocaleString("vi-VN")}₫`,
                imageUrl: getFullUrl(product.imageUrl),
                isSale: false,
                sales: Number(product.sales) || 0,
                rating: 0
              }));
          setProductsData(fallbackProducts);
        } else {
          setProductsData(bestSellingProducts);
        }
      } catch (err) {
        console.error("Error fetching best selling products:", err);
        setError("Không thể tải sản phẩm bán chạy");

        // Fallback to default products if API fails
        setProductsData([
          {
            id: 1,
            name: "Glasses RX 6462 (2502)",
            price: "2.800.000₫",
            imageUrl: fallbackImage,
            isSale: true,
            sales: 0,
            rating: 0
          },
          {
            id: 2,
            name: "Sunglasses Classic",
            price: "2.200.000₫",
            imageUrl: fallbackImage,
            isSale: false,
            sales: 0,
            rating: 0
          },
          {
            id: 3,
            name: "Contact Lenses Monthly",
            price: "1.500.000₫",
            imageUrl: fallbackImage,
            isSale: false,
            sales: 0,
            rating: 0
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellingProducts();
  }, []);

  // Handle navigation to shop page
  const handleViewAllProducts = () => {
    window.location.href = '/shop';
  };

  return (
      <div className="row-view18">
        <div className="column2 products-intro">
          <span className="text29">{"Sản Phẩm Bán Chạy Nhất"}</span>
          <span className="text30">
          {"Khám phá bộ sưu tập sản phẩm chăm sóc mắt chất lượng cao được khách hàng tin tưởng và lựa chọn nhiều nhất."}
        </span>
          <button className="button2" onClick={handleViewAllProducts}>
            <span className="text28">{"Xem Tất Cả"}</span>
          </button>
        </div>

        {loading ? (
            <div className="products-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải sản phẩm bán chạy...</p>
            </div>
        ) : error ? (
            <div className="products-error">
              <p>{error}</p>
              <button
                  className="retry-button"
                  onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
        ) : (
            <div className="products-container">
              {productsData.map((product) => (
                  <ProductCard
                      key={product.id}
                      name={product.name}
                      price={product.price}
                      imageUrl={product.imageUrl}
                      isSale={product.isSale}
                      sales={product.sales}
                      rating={product.rating}
                      productId={product.id}
                      productData={product}
                  />
              ))}
            </div>
        )}
      </div>
  );
};

export default Products;
