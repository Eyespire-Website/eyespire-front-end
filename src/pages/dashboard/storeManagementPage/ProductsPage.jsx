"use client";

import { useState } from "react";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import FilterBar from "../../../components/storeManagement/FilterBar";
import Pagination from "../../../components/storeManagement/Pagination";
import ProductDetailModal from "../../../components/storeManagement/ProductDetailModal";
import {
  Star,
  TrendingUp,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);

  const products = [
    {
      id: "SP001",
      name: "Thức ăn cá Koi cao cấp",
      category: "Thức ăn",
      price: 250000,
      rating: 4.8,
      totalReviews: 156,
      sales: 1250,
      status: "active",
      statusText: "Đang bán",
      image: "/placeholder.svg?height=60&width=60",
      description:
        "Thức ăn cao cấp dành cho cá Koi với công thức dinh dưỡng đặc biệt",
      gallery: [
        "/placeholder.svg?height=80&width=80",
        "/placeholder.svg?height=80&width=80",
        "/placeholder.svg?height=80&width=80",
      ],
      supplier: "Công ty TNHH Thức ăn Thủy sản",
      lastUpdated: "15/01/2024",
      tags: ["thức ăn", "koi", "cao cấp", "dinh dưỡng"],
      feedbacks: [
        {
          id: "1",
          customerName: "Nguyễn Văn A",
          rating: 5,
          comment: "Sản phẩm rất tốt, cá ăn ngon và phát triển khỏe mạnh",
          date: "15/01/2024",
          verified: true,
        },
        {
          id: "2",
          customerName: "Trần Thị B",
          rating: 4,
          comment: "Chất lượng ổn, giá hơi cao nhưng đáng tiền",
          date: "12/01/2024",
          verified: true,
        },
        {
          id: "3",
          customerName: "Lê Văn C",
          rating: 5,
          comment: "Cá nhà tôi rất thích, sẽ mua lại",
          date: "10/01/2024",
          verified: false,
        },
      ],
    },
    {
      id: "SP002",
      name: "Máy lọc nước hồ cá",
      category: "Thiết bị",
      price: 1500000,
      rating: 4.5,
      totalReviews: 89,
      sales: 450,
      status: "active",
      statusText: "Đang bán",
      image: "/placeholder.svg?height=60&width=60",
      description: "Máy lọc nước hiệu suất cao cho hồ cá Koi",
      gallery: [
        "/placeholder.svg?height=80&width=80",
        "/placeholder.svg?height=80&width=80",
      ],
      supplier: "Công ty CP Thiết bị Thủy sinh",
      lastUpdated: "12/01/2024",
      tags: ["máy lọc", "thiết bị", "hồ cá"],
      feedbacks: [
        {
          id: "4",
          customerName: "Phạm Thị D",
          rating: 4,
          comment: "Máy hoạt động tốt, nước trong hơn hẳn",
          date: "14/01/2024",
          verified: true,
        },
        {
          id: "5",
          customerName: "Hoàng Văn E",
          rating: 5,
          comment: "Rất hài lòng với sản phẩm này",
          date: "11/01/2024",
          verified: true,
        },
      ],
    },
    {
      id: "SP003",
      name: "Thuốc trị bệnh cho cá",
      category: "Y tế",
      price: 180000,
      rating: 4.2,
      totalReviews: 67,
      sales: 320,
      status: "active",
      statusText: "Đang bán",
      image: "/placeholder.svg?height=60&width=60",
      description: "Thuốc điều trị các bệnh thường gặp ở cá Koi",
      gallery: ["/placeholder.svg?height=80&width=80"],
      supplier: "Công ty Dược phẩm Thủy sản",
      lastUpdated: "10/01/2024",
      tags: ["thuốc", "y tế", "điều trị"],
      feedbacks: [
        {
          id: "6",
          customerName: "Võ Thị F",
          rating: 4,
          comment: "Hiệu quả tốt, cá khỏi bệnh nhanh",
          date: "13/01/2024",
          verified: true,
        },
      ],
    },
    {
      id: "SP004",
      name: "Đèn LED chiếu sáng hồ",
      category: "Thiết bị",
      price: 800000,
      rating: 4.6,
      totalReviews: 124,
      sales: 680,
      status: "inactive",
      statusText: "Ngừng bán",
      image: "/placeholder.svg?height=60&width=60",
      description: "Đèn LED chuyên dụng cho hồ cá với nhiều chế độ ánh sáng",
      gallery: [
        "/placeholder.svg?height=80&width=80",
        "/placeholder.svg?height=80&width=80",
        "/placeholder.svg?height=80&width=80",
        "/placeholder.svg?height=80&width=80",
      ],
      supplier: "Công ty TNHH Ánh sáng Thủy sinh",
      lastUpdated: "05/01/2024",
      tags: ["đèn led", "chiếu sáng", "tiết kiệm"],
      feedbacks: [
        {
          id: "7",
          customerName: "Đặng Văn G",
          rating: 5,
          comment: "Ánh sáng đẹp, làm nổi bật màu sắc của cá",
          date: "09/01/2024",
          verified: true,
        },
      ],
    },
  ];

  const categories = ["Thức ăn", "Thiết bị", "Y tế"];
  const statuses = ["Đang bán", "Ngừng bán", "Bản nháp"];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || product.statusText === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewFeedbacks = (product) => {
    setSelectedProduct(product);
    setShowFeedbacks(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

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

  const filterOptions = [
    {
      label: "Danh mục",
      value: categoryFilter,
      options: [
        { value: "all", label: "Tất cả" },
        ...categories.map((cat) => ({ value: cat, label: cat })),
      ],
      onChange: setCategoryFilter,
    },
    {
      label: "Trạng thái",
      value: statusFilter,
      options: [
        { value: "all", label: "Tất cả" },
        ...statuses.map((status) => ({ value: status, label: status })),
      ],
      onChange: setStatusFilter,
    },
  ];

  return (
    <div>
      <div className="stats-grid">
        <StatCard
          title="Tổng sản phẩm"
          value="1,234"
          change="+45 sản phẩm mới"
          icon={<Star size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Đánh giá trung bình"
          value="4.6"
          change="+0.2 từ tháng trước"
          icon={<Star size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Tổng đánh giá"
          value="2,456"
          change="+156 đánh giá mới"
          icon={<MessageSquare size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Sản phẩm bán chạy"
          value={89}
          change="+12 từ tuần trước"
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
          <FilterBar
            filters={filterOptions}
            onAddNew={() => console.log("Add new product")}
            addButtonText="Thêm sản phẩm"
          />

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
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="product-img"
                        />
                      </td>
                      <td>{product.id}</td>
                      <td>
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">
                            {product.description}
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>₫{product.price.toLocaleString()}</td>
                      <td>
                        <div className="rating-info">
                          <div className="stars">
                            {renderStars(product.rating)}
                          </div>
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
                          <button className="btn btn-icon" title="Chỉnh sửa">
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Xem chi tiết"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-icon" title="Xóa">
                            <Trash2 size={16} />
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
            totalPages={10}
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
              <button
                className="btn btn-icon"
                onClick={() => setShowFeedbacks(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="stm-modal-body">
              <div className="stm-feedback-summary">
                <div className="stm-rating-overview">
                  <div className="stm-overall-rating">
                    <span className="stm-rating-number">
                      {selectedProduct.rating}
                    </span>
                    <div className="stm-stars-large">
                      {renderStars(selectedProduct.rating)}
                    </div>
                    <span className="stm-total-reviews">
                      {selectedProduct.totalReviews} đánh giá
                    </span>
                  </div>
                </div>
              </div>

              <div className="stm-feedback-list">
                <h3>Đánh giá từ khách hàng</h3>
                {selectedProduct.feedbacks.map((feedback) => (
                  <div key={feedback.id} className="stm-feedback-item">
                    <div className="stm-feedback-header">
                      <div className="stm-customer-info">
                        <span className="stm-customer-name">
                          {feedback.customerName}
                        </span>
                        {feedback.verified && (
                          <span className="stm-verified-badge">Đã xác minh</span>
                        )}
                      </div>
                      <div className="stm-feedback-meta">
                        <div className="stars">
                          {renderStars(feedback.rating)}
                        </div>
                        <span className="stm-feedback-date">{feedback.date}</span>
                      </div>
                    </div>
                    <div className="stm-feedback-content">
                      <p>{feedback.comment}</p>
                    </div>
                    <div className="stm-feedback-actions">
                      <button className="btn btn-sm btn-secondary">
                        <ThumbsUp size={14} />
                        Hữu ích
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        <ThumbsDown size={14} />
                        Không hữu ích
                      </button>
                      <button className="btn btn-sm btn-primary">
                        Trả lời
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="stm-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowFeedbacks(false)}
              >
                Đóng
              </button>
              <button className="btn btn-primary">Xuất báo cáo</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductDetail}
        onClose={() => setShowProductDetail(false)}
      />
    </div>
  );
};

export default ProductsPage;
