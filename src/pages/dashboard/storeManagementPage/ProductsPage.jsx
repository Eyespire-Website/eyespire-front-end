"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import FilterBar from "../../../components/storeManagement/FilterBar";
import Pagination from "../../../components/storeManagement/Pagination";
import ProductDetailModal from "../../../components/storeManagement/ProductDetailModal";
import { Star, TrendingUp, MessageSquare, Eye, X } from "lucide-react";
import productService from "../../../services/productService";
import feedbackService from "../../../services/feedbackService";

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  const fallbackImage = "https://placehold.co/50x50?text=Image";

  // Map backend ProductType to frontend category labels
  const mapProductTypeToCategory = (type) => {
    const categoryMap = {
      MEDICINE: "Y tế",
      EYEWEAR: "Thiết bị",
    };
    return categoryMap[type] || "Thiết bị";
  };

  // Normalize image URL
  const getFullUrl = (url) => {
    if (!url || url.trim() === "") {
      console.log("Image URL is null or empty, using fallback:", fallbackImage);
      return fallbackImage;
    }
    return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.warn(`Failed to load image: ${e.target.src}`);
    e.target.src = fallbackImage;
  };

  // Fetch products and feedback
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      const mappedProducts = await Promise.all(
          data.map(async (product) => {
            const imageUrl = getFullUrl(product.imageUrl);
            const feedbacks = await feedbackService.getFeedbackByProductId(product.id);
            const averageRating = feedbacks.length
                ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                : 0;

            return {
              id: product.id.toString(),
              name: product.name || "Không có tên",
              category: mapProductTypeToCategory(product.type),
              price: Number(product.price) || 0,
              rating: parseFloat(averageRating) || 0,
              totalReviews: feedbacks.length,
              sales: Number(product.sales) || 0,
              status: product.stockQuantity === 0 ? "inactive" : product.stockQuantity <= 5 ? "warning" : "active",
              statusText: product.stockQuantity === 0 ? "Hết hàng" : product.stockQuantity <= 5 ? "Sắp hết" : "Còn hàng",
              image: imageUrl,
              description: product.description || "Không có mô tả",
              gallery: [imageUrl],
              supplier: "N/A",
              lastUpdated: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString("vi-VN") : "N/A",
              tags: [mapProductTypeToCategory(product.type)],
              feedbacks: feedbacks.map((f) => ({
                id: f.id.toString(),
                customerName: f.patientName || "Khách hàng ẩn danh",
                rating: f.rating || 0,
                comment: f.comment || "Không có bình luận",
                date: f.createdAt ? new Date(f.createdAt).toLocaleDateString("vi-VN") : "N/A",
                verified: f.verified || false,
              })),
              quantity: product.stockQuantity || 0,
            };
          })
      );

      setProducts(mappedProducts);
      const uniqueCategories = [...new Set(mappedProducts.map((p) => p.category))];
      setCategories(uniqueCategories.length > 0 ? uniqueCategories : ["Thiết bị"]);
      setError(null);
    } catch (err) {
      const errorMessage =
          err.response?.status === 404
              ? "Không tìm thấy sản phẩm"
              : err.response?.status === 500
                  ? "Lỗi server, vui lòng thử lại sau"
                  : "Không thể tải dữ liệu sản phẩm";
      setError(errorMessage);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Calculate stats with memoization
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const averageRating = products.length
        ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
        : 0;
    const totalReviews = products.reduce((sum, p) => sum + p.totalReviews, 0);
    const topSellingProducts = products.filter((p) => p.sales > 0).length;

    return {
      totalProducts,
      averageRating,
      totalReviews,
      topSellingProducts,
    };
  }, [products]);

  // Filter products
  const filteredProducts = products
      .filter(
          (product) =>
              (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (categoryFilter === "all" || product.category === categoryFilter)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // Handle view product
  const handleViewProduct = (productId) => {
    console.log("Viewing product:", productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductDetail(true);
    }
  };

  // Handle view feedbacks
  const handleViewFeedbacks = (product) => {
    setSelectedProduct(product);
    setShowFeedbacks(true);
  };

  // Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
        <Star
            key={index}
            size={14}
            className={index < Math.floor(rating) ? "star-filled" : "star-empty"}
            fill={index < Math.floor(rating) ? "#fbbf24" : "none"}
            color="#fbbf24"
        />
    ));
  };

  // Filter options
  const filterOptions = [
    {
      label: "Danh mục",
      value: categoryFilter,
      options: [
        { value: "all", label: "Tất cả" },
        { value: "Y tế", label: "Y tế" },
        { value: "Thiết bị", label: "Thiết bị" },
      ],
      onChange: setCategoryFilter,
    },
  ];

  if (loading) {
    return (
        <div className="inventory-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="inventory-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchProducts}>
            Thử lại
          </button>
        </div>
    );
  }

  return (
      <div className="inventory-container">
        <div className="stats-grid">
          <StatCard
              title="Tổng sản phẩm"
              value={stats.totalProducts.toString()}
              change={`${stats.totalProducts} sản phẩm`}
              icon={<Star size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Đánh giá trung bình"
              value={stats.averageRating}
              change="Từ tất cả sản phẩm"
              icon={<Star size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Tổng đánh giá"
              value={stats.totalReviews.toString()}
              change="Từ khách hàng"
              icon={<MessageSquare size={24} />}
              changeType="positive"
          />
          <StatCard
              title="Sản phẩm bán chạy"
              value={stats.topSellingProducts.toString()}
              change="Dựa trên doanh số"
              icon={<TrendingUp size={24} />}
              changeType="positive"
          />
        </div>

        <div className="card">
          <div className="card-hdr">
            <div className="card-hdr-content">
              <h3 className="card-title">Quản lý sản phẩm & Feedback</h3>
              <SearchBox value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>
          <div className="card-content">
            <FilterBar filters={filterOptions} />

            <div className="tbl-container">
              <table className="tbl">
                <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Đánh giá</th>
                  <th>Đã bán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <img
                                src={getFullUrl(product.image)}
                                alt={product.name}
                                className="product-img"
                                onError={handleImageError}
                            />
                          </td>
                          <td>{product.id}</td>
                          <td>
                            <div className="product-info">
                              <div className="product-name">{product.name}</div>
                              <div className="product-description">{product.description}</div>
                            </div>
                          </td>
                          <td>{product.category}</td>
                          <td>₫{product.price.toLocaleString()}</td>
                          <td>
                            <div className="rating-info">
                              <div className="stars">{renderStars(product.rating)}</div>
                              <div className="rating-text">
                                {product.rating} ({product.totalReviews} đánh giá)
                              </div>
                            </div>
                          </td>
                          <td>{product.sales}</td>
                          <td>
                        <span className={`status ${product.status}`}>
                          {product.statusText}
                        </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                  className="btn btn-icon"
                                  title="Xem feedback"
                                  onClick={() => handleViewFeedbacks(product)}
                              >
                                <MessageSquare size={16} />
                              </button>
                              <button
                                  className="btn btn-icon"
                                  title="Xem chi tiết"
                                  onClick={() => handleViewProduct(product.id)}
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan={9} className="no-results">
                        Không tìm thấy sản phẩm nào phù hợp
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {showFeedbacks && selectedProduct && (
            <div className="stm-modal-overlay" onClick={() => setShowFeedbacks(false)}>
              <div
                  className="stm-modal-content stm-feedback-modal"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="stm-modal-header">
                  <h2>Feedback - {selectedProduct.name}</h2>
                  <button className="btn btn-icon" onClick={() => setShowFeedbacks(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="stm-modal-body">
                  <div className="stm-feedback-summary">
                    <div className="stm-rating-overview">
                      <div className="stm-overall-rating">
                        <span className="stm-rating-number">{selectedProduct.rating}</span>
                        <div className="stm-stars-large">{renderStars(selectedProduct.rating)}</div>
                        <span className="stm-total-reviews">
                      {selectedProduct.totalReviews} đánh giá
                    </span>
                      </div>
                    </div>
                  </div>

                  <div className="stm-feedback-list">
                    <h3>Đánh giá từ khách hàng</h3>
                    {selectedProduct.feedbacks.length > 0 ? (
                        selectedProduct.feedbacks.map((feedback) => (
                            <div key={feedback.id} className="stm-feedback-item">
                              <div className="stm-feedback-header">
                                <div className="stm-customer-info">
                                  <span className="stm-customer-name">{feedback.customerName}</span>
                                </div>
                                <div className="stm-feedback-meta">
                                  <div className="stars">{renderStars(feedback.rating)}</div>
                                  <span className="stm-feedback-date">{feedback.date}</span>
                                </div>
                              </div>
                              <div className="stm-feedback-content">
                                <p>{feedback.comment}</p>
                              </div>
                            </div>
                        ))
                    ) : (
                        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                    )}
                  </div>
                </div>

                <div className="stm-modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowFeedbacks(false)}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
        )}

        <ProductDetailModal
            product={selectedProduct}
            isOpen={showProductDetail}
            onClose={() => setShowProductDetail(false)}
        />
      </div>
  );
};

export default ProductsPage;