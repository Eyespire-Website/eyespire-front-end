"use client";
import React, { useState, useEffect } from "react";

import ShopHeader from "./ShopHeader";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/shop/ProductCard";
import FilterSidebar from "../../components/shop/FilterSidebar";
import productService from "../../services/productService";
import "./index.css";

const categories = [
  { id: "all", label: "Tất cả sản phẩm" },
  { id: "MEDICINE", label: "Thuốc nhỏ mắt" },
  { id: "EYEWEAR", label: "Kính mắt" },
];

export default function Shop() {
  // State management
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 9;
  const [showFilter, setShowFilter] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000000],
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let data;
        
        // Nếu đang lọc theo loại sản phẩm cụ thể
        if (activeCategory !== "all") {
          data = await productService.getProductsByType(activeCategory);
        } else {
          data = await productService.getAllProducts();
        }
        
        console.log("Dữ liệu sản phẩm từ API:", data);
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  // Error handling component
  if (error) {
    return (
      <div className="shop-page">
        <ShopHeader />
        <div className="main-content">
          <div className="container">
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <h2>Đã xảy ra lỗi</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="filter-toggle-btn"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Loading state component
  if (isLoading) {
    return (
      <div className="shop-page">
        <ShopHeader />
        <div className="main-content">
          <div className="container">
            <div className="loading-skeleton">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="product-skeleton" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Lọc theo giá
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    } else if (sortBy === "price-high") {
      return b.price - a.price;
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      // Default sorting (by id)
      return a.id - b.id;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    console.log("Thêm vào giỏ hàng:", product);
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    // Implement cart logic here
  };

  return (
    <div className="shop-page">
      <ShopHeader />

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Filter bar with overflow handling */}
          <div className="filter-bar-wrapper">
            <div className="filter-bar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`filter-item ${
                    activeCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setCurrentPage(1);
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          {/* Nút tắt/bật filter */}
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilter((v) => !v)}
            aria-label={showFilter ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
          >
            <span className="filter-icon">{showFilter ? "−" : "+"}</span>
            <span>{showFilter ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}</span>
          </button>
          <div className="shop-layout">
            <FilterSidebar
              className={showFilter ? "" : "filter-hidden"}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            {/* Product Grid */}
            <div className="product-section">
              {/* Sort Controls */}
              <div className="sort-controls">
                <p className="results-count">
                  Hiển thị {sortedProducts.length > 0 ? startIndex + 1 : 0}-
                  {Math.min(startIndex + itemsPerPage, sortedProducts.length)}{" "}
                  trong số {sortedProducts.length} kết quả
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                  aria-label="Sắp xếp sản phẩm"
                >
                  <option value="default">Sắp xếp mặc định</option>
                  <option value="price-low">Giá: Thấp đến cao</option>
                  <option value="price-high">Giá: Cao đến thấp</option>
                  <option value="name">Tên: A đến Z</option>
                </select>
              </div>

              {/* Products Grid */}
              <div className="products-grid">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                ) : (
                  <div className="no-products">
                    <div className="no-products-icon">🔍</div>
                    <h3>Không tìm thấy sản phẩm nào</h3>
                    <p>Vui lòng thử lại với bộ lọc khác</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  {/* Previous button */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="page-btn"
                      aria-label="Trang trước"
                    >
                      &laquo;
                    </button>
                  )}
                  
                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return pageNum;
                    }
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`page-btn ${
                        page === currentPage ? "active" : ""
                      }`}
                      aria-label={`Trang ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {/* Next button */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="page-btn"
                      aria-label="Trang sau"
                    >
                      &raquo;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
