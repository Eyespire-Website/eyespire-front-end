"use client";
import React, { useState, useEffect } from "react";

import HeroBanner from "../../components/ProductShop/HeroBanner";
import Header from "../../components/shop/Header-shop";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/shop/ProductCard";
import FilterSidebar from "../../components/shop/FilterSidebar";
import "./index.css";
const categories = [
  { id: "all", label: "Shop All" },
  { id: "aspheric", label: "Aspheric" },
  { id: "high-index-plastic", label: "High Index Plastic" },
  { id: "photochromic", label: "Photochromic" },
];

const products = [
  {
    id: 1,
    name: "Glasses RWX 6442 (2502)",
    price: 135,
    colors: ["black", "brown", "green"],
    category: "aspheric",
    gender: "unisex",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Glasses 5368",
    price: 180,
    colors: ["pink", "white", "brown"],
    category: "photochromic",
    gender: "women",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Glasses RX (2669)",
    price: 190,
    colors: ["black", "white", "green"],
    category: "high-index-plastic",
    gender: "men",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Glasses RX 7065 (5068)",
    price: 130,
    colors: ["black", "brown", "green"],
    category: "aspheric",
    gender: "unisex",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Glasses RX 6307",
    price: 240,
    colors: ["black", "white", "brown"],
    category: "photochromic",
    gender: "men",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "Dynamics Colorwave",
    price: 220,
    colors: ["black", "white", "green"],
    category: "high-index-plastic",
    gender: "women",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 7,
    name: "Glasses RX 5965 (6447)",
    price: 160,
    colors: ["black", "brown", "green"],
    category: "aspheric",
    gender: "unisex",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 8,
    name: "Sunglasses JH 9778 (9987)",
    price: 150,
    colors: ["black", "white", "brown"],
    category: "photochromic",
    gender: "men",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 9,
    name: "Sunglasses RX 0967",
    price: 240,
    colors: ["black", "white", "green"],
    category: "high-index-plastic",
    gender: "women",
    image: "/placeholder.svg?height=200&width=200",
  },
];

export default function Shop() {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 9;
  const [showFilter, setShowFilter] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    genders: [],
    frameShapes: [],
    frameWidths: [],
    priceRange: [105, 390],
  });

  // Handle initial loading
  useEffect(() => {
    try {
      setIsLoading(true);
      // Simulate loading time
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Error handling component
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // Loading state component
  if (isLoading) {
    return (
      <div className="loading-skeleton">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="product-skeleton" />
        ))}
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (activeCategory !== "all" && product.category !== activeCategory)
      return false;
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    )
      return false;
    if (filters.colors.length > 0) {
      const hasMatchingColor = product.colors.some((color) =>
        filters.colors.includes(color)
      );
      if (!hasMatchingColor) return false;
    }
    if (filters.genders.length > 0 && !filters.genders.includes(product.gender))
      return false;
    if (
      product.price < filters.priceRange[0] ||
      product.price > filters.priceRange[1]
    )
      return false;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
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
    console.log("Adding to cart:", product);
    // Implement cart logic here
  };

  return (
    <div className="shop-page">
      <Header />

      <HeroBanner title="Shop" breadcrumb={["Home", "Shop"]} />

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
            aria-label={showFilter ? "Hide filters" : "Show filters"}
          >
            <span className="filter-icon">{showFilter ? "−" : "+"}</span>
            <span>{showFilter ? "Hide Filters" : "Show Filters"}</span>
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
                  Showing {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, sortedProducts.length)}{" "}
                  of {sortedProducts.length} results
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="default">Default Sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {/* Products Grid */}
              <div className="products-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                {Array.from(
                  { length: Math.min(totalPages, 3) },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`page-btn ${
                      page === currentPage ? "active" : ""
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
