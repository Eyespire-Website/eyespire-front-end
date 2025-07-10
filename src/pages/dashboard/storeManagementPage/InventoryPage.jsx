"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Edit,
  Eye,
  Trash2,
  ZoomIn,
  ZoomOut,
  X,
  TrendingUp, // Added for topSellingProducts StatCard
} from "lucide-react";
import productService from "../../../services/productService";

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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageContainerRef = useRef(null);

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

  // Handle image click to open modal
  const handleImageClick = (url) => {
    setSelectedImage(url);
    setZoomLevel(1);
  };

  // Close image modal
  const handleCloseModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
    };

    const imageContainer = imageContainerRef.current;
    if (selectedImage && imageContainer) {
      imageContainer.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (imageContainer) {
        imageContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, [selectedImage]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      const mappedProducts = data.map((product) => {
        const imageUrl = getFullUrl(product.imageUrl);
        return {
          id: product.id.toString(),
          name: product.name || "Không có tên",
          category: mapProductTypeToCategory(product.type),
          quantity: product.stockQuantity || 0,
          price: Number(product.price) || 0,
          sales: Number(product.sales) || 0, // Use sales from ProductDTO
          status: product.stockQuantity === 0 ? "inactive" : product.stockQuantity <= 5 ? "warning" : "active",
          statusText: product.stockQuantity === 0 ? "Hết hàng" : product.stockQuantity <= 5 ? "Sắp hết" : "Còn hàng",
          lastUpdated: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString("vi-VN") : "N/A",
          image: imageUrl,
          description: product.description || "Không có mô tả",
          rating: 4.5, // Placeholder, as feedback isn't fetched here
          totalReviews: 0, // Placeholder
          tags: [mapProductTypeToCategory(product.type)],
          gallery: [imageUrl],
          feedbacks: [], // Placeholder
        };
      });
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
    const lowStockCount = products.filter((p) => p.status === "warning").length;
    const outOfStockCount = products.filter((p) => p.status === "inactive").length;
    const inventoryValue = products.reduce(
        (total, p) => total + p.price * p.quantity,
        0
    );
    const topSellingProducts = products.filter((p) => p.sales > 0).length;

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
      topSellingProducts,
    };
  }, [products]);

  // Filter products
  const filteredProducts = products
      .filter(
          (product) =>
              (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (categoryFilter === "all" || product.category === categoryFilter) &&
              (statusFilter === "all" || product.status === statusFilter)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // Handle edit product
  const handleEditProduct = (productId) => {
    console.log("Editing product:", productId);
    setEditingProductId(productId);
  };

  // Handle view product
  const handleViewProduct = (productId) => {
    console.log("Viewing product:", productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDetailModalOpen(true);
    }
  };

  // Handle delete product
  const handleDeleteProduct = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setIsConfirmDeleteOpen(true);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await productService.deleteProduct(productToDelete.id);
        setProducts((prevProducts) =>
            prevProducts.filter((p) => p.id !== productToDelete.id)
        );
        alert(`Đã xóa sản phẩm ${productToDelete.name} thành công`);
        fetchProducts();
      } catch (err) {
        alert("Không thể xóa sản phẩm");
        console.error(err);
      } finally {
        setProductToDelete(null);
        setIsConfirmDeleteOpen(false);
      }
    }
  };

  // Filter options
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
        { value: "active", label: "Còn hàng" },
        { value: "warning", label: "Sắp hết" },
        { value: "inactive", label: "Hết hàng" },
      ],
      onChange: setStatusFilter,
    },
  ];

  if (showAddProduct) {
    return (
        <AddProductPage
            onBack={() => setShowAddProduct(false)}
            onAddSuccess={fetchProducts}
        />
    );
  }

  if (editingProductId) {
    return (
        <EditProductPage
            productId={editingProductId}
            onBack={() => setEditingProductId(null)}
            onEditSuccess={fetchProducts}
        />
    );
  }

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
              icon={<DollarSign size={24} />}
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
                  <th>Đã bán</th>
                  <th>Cập nhật</th>
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
                                onClick={() => handleImageClick(getFullUrl(product.image))}
                                style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td>{product.id}</td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>{product.quantity}</td>
                          <td>₫{product.price.toLocaleString()}</td>
                          <td>{product.sales}</td>
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
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <ProductDetailModal
            product={selectedProduct}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
        />

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

        {selectedImage && (
            <div className="image-modal-overlay" onClick={handleCloseModal}>
              <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={handleCloseModal}>
                  <X size={24} />
                </button>
                <div className="image-modal-content" ref={imageContainerRef}>
                  <img
                      src={selectedImage}
                      alt="Zoomed product"
                      style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s" }}
                  />
                </div>
                <div className="image-modal-controls">
                  <button onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                    <ZoomIn size={20} />
                  </button>
                  <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                    <ZoomOut size={20} />
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default InventoryPage;