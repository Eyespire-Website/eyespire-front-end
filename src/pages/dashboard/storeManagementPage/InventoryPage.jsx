"use client";

import { useState, useCallback } from "react";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import FilterBar from "../../../components/storeManagement/FilterBar";
import Pagination from "../../../components/storeManagement/Pagination";
import ProductDetailModal from "../../../components/storeManagement/ProductDetailModal";
import AddProductPage from "./AddProductPage";
import EditProductPage from "./EditProductPage";
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Mở rộng dữ liệu mẫu với thêm thông tin chi tiết
  const [products, setProducts] = useState([
    {
      id: "SP001",
      name: "Thức ăn cá Koi cao cấp",
      category: "Thức ăn",
      quantity: 150,
      price: 250000,
      status: "active",
      statusText: "Còn hàng",
      supplier: "Công ty TNHH Thức ăn Thủy sản",
      lastUpdated: "15/01/2024",
      image: "/placeholder.svg?height=50&width=50",
      description:
        "Thức ăn cao cấp cho cá Koi giúp tăng cường màu sắc và hỗ trợ hệ miễn dịch. Thức ăn được nhập khẩu từ Nhật Bản, đảm bảo chất lượng tốt nhất cho cá của bạn.",
      rating: 4.8,
      totalReviews: 124,
      sales: 1240,
      tags: ["Thức ăn cá", "Koi", "Cao cấp", "Nhập khẩu"],
      gallery: [
        "/placeholder.svg?height=80&width=80&text=Mặt+trước",
        "/placeholder.svg?height=80&width=80&text=Mặt+sau",
        "/placeholder.svg?height=80&width=80&text=Thành+phần",
      ],
      feedbacks: [
        {
          id: "f1",
          customerName: "Nguyễn Văn A",
          verified: true,
          rating: 5,
          date: "12/01/2024",
          comment:
            "Cá của tôi rất thích thức ăn này. Lông cá mượt và màu sắc rực rỡ hơn.",
        },
        {
          id: "f2",
          customerName: "Trần Thị B",
          verified: true,
          rating: 4,
          date: "10/01/2024",
          comment:
            "Chất lượng tốt, giá hơi cao nhưng xứng đáng với chất lượng.",
        },
      ],
    },
    {
      id: "SP002",
      name: "Máy lọc nước hồ cá",
      category: "Thiết bị",
      quantity: 25,
      price: 1500000,
      status: "active",
      statusText: "Còn hàng",
      supplier: "Công ty CP Thiết bị Thủy sinh",
      lastUpdated: "12/01/2024",
      image: "/placeholder.svg?height=50&width=50",
      description:
        "Máy lọc nước cao cấp dành cho hồ cá cảnh với công suất lọc mạnh mẽ. Dễ dàng lắp đặt và bảo trì, đảm bảo nước hồ cá luôn trong sạch.",
      rating: 4.5,
      totalReviews: 85,
      sales: 320,
      tags: ["Máy lọc", "Thiết bị hồ cá", "Lọc nước"],
      gallery: [
        "/placeholder.svg?height=80&width=80&text=Tổng+quan",
        "/placeholder.svg?height=80&width=80&text=Bộ+lọc",
        "/placeholder.svg?height=80&width=80&text=Sử+dụng",
      ],
      feedbacks: [
        {
          id: "f3",
          customerName: "Lê Văn C",
          verified: true,
          rating: 5,
          date: "11/01/2024",
          comment: "Máy hoạt động rất tốt, nước hồ trong vắt sau khi lắp đặt.",
        },
      ],
    },
    {
      id: "SP003",
      name: "Thuốc trị bệnh cho cá",
      category: "Y tế",
      quantity: 5,
      price: 180000,
      status: "warning",
      statusText: "Sắp hết",
      supplier: "Công ty Dược phẩm Thủy sản",
      lastUpdated: "10/01/2024",
      image: "/placeholder.svg?height=50&width=50",
      description:
        "Thuốc trị bệnh đốm trắng và nấm cho cá cảnh. Công thức độc quyền an toàn cho cá và không gây hại cho hệ sinh thái hồ.",
      rating: 4.2,
      totalReviews: 56,
      sales: 210,
      tags: ["Thuốc", "Y tế", "Trị bệnh cá"],
      gallery: [
        "/placeholder.svg?height=80&width=80&text=Sản+phẩm",
        "/placeholder.svg?height=80&width=80&text=Hướng+dẫn",
      ],
      feedbacks: [
        {
          id: "f4",
          customerName: "Phạm Văn D",
          verified: false,
          rating: 4,
          date: "08/01/2024",
          comment:
            "Thuốc hiệu quả nhưng cần tuân thủ liều lượng để tránh ảnh hưởng đến cá khỏe mạnh.",
        },
      ],
    },
    {
      id: "SP004",
      name: "Đèn LED chiếu sáng hồ",
      category: "Thiết bị",
      quantity: 0,
      price: 800000,
      status: "inactive",
      statusText: "Hết hàng",
      supplier: "Công ty TNHH Ánh sáng Thủy sinh",
      lastUpdated: "05/01/2024",
      image: "/placeholder.svg?height=50&width=50",
      description:
        "Đèn LED chuyên dụng cho hồ cá cảnh với nhiều chế độ màu sắc và cường độ ánh sáng. Thiết kế chống nước và tiết kiệm điện năng.",
      rating: 4.7,
      totalReviews: 92,
      sales: 450,
      tags: ["Đèn LED", "Thiết bị hồ cá", "Chiếu sáng"],
      gallery: [
        "/placeholder.svg?height=80&width=80&text=Sản+phẩm",
        "/placeholder.svg?height=80&width=80&text=Màu+sắc",
        "/placeholder.svg?height=80&width=80&text=Lắp+đặt",
      ],
      feedbacks: [
        {
          id: "f5",
          customerName: "Hoàng Thị E",
          verified: true,
          rating: 5,
          date: "04/01/2024",
          comment:
            "Đèn rất đẹp và dễ điều chỉnh. Cá của tôi có vẻ thích nghi tốt với ánh sáng.",
        },
      ],
    },
  ]);

  const categories = ["Thức ăn", "Thiết bị", "Y tế"];
  const statuses = ["Còn hàng", "Sắp hết", "Hết hàng"];

  // Tính toán thống kê
  const calculateStats = useCallback(() => {
    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.status === "warning").length;
    const outOfStockCount = products.filter(
      (p) => p.status === "inactive"
    ).length;
    const inventoryValue = products.reduce(
      (total, p) => total + p.price * p.quantity,
      0
    );

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
    };
  }, [products]);

  const stats = calculateStats();

  const filteredProducts = products
    .filter(
      (product) =>
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.supplier.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === "all" || product.category === categoryFilter) &&
        (statusFilter === "all" || product.statusText === statusFilter)
    )
    .sort((a, b) => {
      let comparison = 0;
      comparison = a.name.localeCompare(b.name);
      return comparison;
    });

  const handleEditProduct = (productId) => {
    console.log("Editing product:", productId);
    setEditingProductId(productId);
  };

  const handleViewProduct = (productId) => {
    console.log("Viewing product:", productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDetailModalOpen(true);
    }
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setIsConfirmDeleteOpen(true);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      // Xóa sản phẩm khỏi state
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productToDelete.id)
      );

      // Reset các state liên quan
      setProductToDelete(null);
      setIsConfirmDeleteOpen(false);

      // Thông báo xóa thành công
      alert(`Đã xóa sản phẩm ${productToDelete.name} thành công`);
    }
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

  if (showAddProduct) {
    return <AddProductPage onBack={() => setShowAddProduct(false)} />;
  }

  if (editingProductId) {
    return (
      <EditProductPage
        productId={editingProductId}
        onBack={() => setEditingProductId(null)}
      />
    );
  }

  return (
    <div>
      <div className="stats-grid">
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts.toString()}
          change={`${stats.outOfStockCount} sản phẩm hết hàng`}
          icon={<Package size={24} />}
          changeType={stats.outOfStockCount > 0 ? "negative" : "positive"}
        />
        <StatCard
          title="Sắp hết hàng"
          value={stats.lowStockCount}
          change="Cần nhập thêm"
          icon={<AlertTriangle size={24} />}
          changeType="warning"
        />
        <StatCard
          title="Giá trị kho"
          value={`₫${stats.inventoryValue.toLocaleString()}`}
          change="+8% từ tháng trước"
          icon={<DollarSign size={24} />}
          changeType="positive"
        />
        <StatCard
          title="Xuất kho hôm nay"
          value={89}
          change="+12 từ hôm qua"
          icon={<TrendingUp size={24} />}
          changeType="positive"
        />
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-hdr-content">
            <h3 className="card-title">Quản lý kho hàng</h3>
            <SearchBox value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
        <div className="card-content">
          <FilterBar
            filters={filterOptions}
            onAddNew={() => setShowAddProduct(true)}
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
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Nhà cung cấp</th>
                  <th>Cập nhật</th>
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
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.quantity}</td>
                      <td>₫{product.price.toLocaleString()}</td>
                      <td>{product.supplier}</td>
                      <td>{product.lastUpdated}</td>
                      <td>
                        <span className={`status ${product.status}`}>
                          {product.statusText}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-icon"
                            title="Chỉnh sửa"
                            onClick={() => handleEditProduct(product.id)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Xem chi tiết"
                            onClick={() => handleViewProduct(product.id)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Xóa"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="no-results">
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

      {/* Modal xem chi tiết sản phẩm */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Modal xác nhận xóa sản phẩm */}
      {isConfirmDeleteOpen && (
        <div className="stm-modal-overlay">
          <div className="stm-modal-content stm-confirm-modal">
            <div className="stm-modal-header">
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="stm-modal-body">
              <p>
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <strong>{productToDelete?.name}</strong>?
              </p>
              <p className="stm-warning-text">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="stm-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsConfirmDeleteOpen(false)}
              >
                Hủy
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
