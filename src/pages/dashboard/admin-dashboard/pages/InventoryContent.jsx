import { useState, useEffect } from "react"
import {
    Package,
    AlertTriangle,
    Ban,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Search,
    Filter,
    ArrowUpDown as SortIcon,
    Trash2,
    Edit,
    Eye,
    Image,
    DollarSign,
    TrendingUp,
    Upload
} from "lucide-react"
import "../styles/inventory.css"
import productService from "../../../../services/productService"

const InventoryContent = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState("asc")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [editImagePreview, setEditImagePreview] = useState(null)
    const [editImageFile, setEditImageFile] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [newProduct, setNewProduct] = useState({
        name: "",
        type: "EYEWEAR",
        stockQuantity: "",
        price: "",
        description: "",
        supplier: ""
    })
    const [editingProduct, setEditingProduct] = useState({
        id: "",
        name: "",
        type: "EYEWEAR",
        stockQuantity: 0,
        price: "",
        description: "",
        imageUrl: "",
        supplier: ""
    })

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            
            // Xử lý URL hình ảnh: thêm URL cơ sở nếu URL là đường dẫn tương đối
            const processedData = data.map(product => {
                if (product.imageUrl && product.imageUrl.startsWith('/')) {
                    return {
                        ...product,
                        imageUrl: `http://localhost:8080${product.imageUrl}`
                    };
                }
                return product;
            });
            
            setProducts(processedData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setLoading(false);
        }
    };

    const categories = ["EYEWEAR", "MEDICINE"]
    const statuses = ["Còn hàng", "Sắp hết", "Hết hàng"]

    const filteredProducts = products
        .filter(
            (product) =>
                (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (categoryFilter === "all" || product.type === categoryFilter) &&
                (statusFilter === "all" || product.statusText === statusFilter),
        )
        .sort((a, b) => {
            let comparison = 0
            switch (sortBy) {
                case "name":
                    comparison = a.name.localeCompare(b.name)
                    break
                case "price":
                    comparison = a.price - b.price
                    break
                case "stockQuantity":
                    comparison = a.stockQuantity - b.stockQuantity
                    break
                default:
                    comparison = a.name.localeCompare(b.name)
            }
            return sortOrder === "asc" ? comparison : -comparison
        })

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    }

    // Xử lý thêm sản phẩm mới
    const handleAddProduct = () => {
        setShowAddModal(true)
        setNewProduct({
            name: "",
            type: "EYEWEAR",
            stockQuantity: "",
            price: "",
            description: "",
            supplier: ""
        })
        setImagePreview(null)
        setImageFile(null)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
    
        if (name === "stockQuantity") {
            // Cho phép trường rỗng hoặc giá trị số không âm
            if (value === "") {
                setNewProduct(prev => ({
                    ...prev,
                    [name]: "",
                    statusText: "Hết hàng"
                }))
            } else {
                // Đảm bảo giá trị là số nguyên không âm
                const numValue = parseInt(value) || 0
                setNewProduct(prev => ({
                    ...prev,
                    [name]: numValue < 0 ? 0 : numValue,
                    // Tự động cập nhật trạng thái dựa trên số lượng
                    statusText: numValue <= 0 ? "Hết hàng" : numValue <= 5 ? "Sắp hết" : "Còn hàng"
                }))
            }
        } else {
            setNewProduct(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const formatPrice = (value) => {
        // Loại bỏ tất cả các ký tự không phải số
        const numericValue = value.replace(/[^0-9]/g, '')
        return numericValue
    }

    const handlePriceChange = (e) => {
        const formattedPrice = formatPrice(e.target.value)
        setNewProduct(prev => ({
            ...prev,
            price: formattedPrice
        }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file) // Lưu file ảnh vào state
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        setImageFile(null) // Xóa file ảnh khỏi state
    }

    const handleSubmit = async () => {
        try {
            // Validate form
            if (!newProduct.name || !newProduct.type || newProduct.price === "") {
                alert("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            // Convert price to number and ensure all required fields are present
            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                stockQuantity: newProduct.stockQuantity === "" ? 0 : parseInt(newProduct.stockQuantity),
                type: newProduct.type,
                supplier: newProduct.supplier
            };

            // Remove any undefined or null values
            Object.keys(productData).forEach(key => {
                if (productData[key] === undefined || productData[key] === null) {
                    delete productData[key];
                }
            });

            console.log("Sending product data:", productData);

            // Upload ảnh trước nếu có
            let productDataWithImage = { ...productData };
            if (imageFile) {
                try {
                    const uploadResult = await productService.uploadProductImage(imageFile);
                    productDataWithImage.imageUrl = uploadResult.imageUrl;
                    console.log("Uploaded image URL:", uploadResult.imageUrl);
                } catch (uploadError) {
                    console.error("Error uploading image:", uploadError);
                    // Tiếp tục tạo sản phẩm mà không có ảnh nếu upload thất bại
                }
            }

            // Call API to add product
            const result = await productService.createProduct(productDataWithImage);
            
            // Xử lý URL ảnh tương đối trước khi thêm vào state
            let processedResult = { ...result };
            if (processedResult.imageUrl && processedResult.imageUrl.startsWith('/')) {
                processedResult.imageUrl = `http://localhost:8080${processedResult.imageUrl}`;
            }
            
            // Add product to products list
            setProducts([...products, processedResult]);

            setShowAddModal(false);
            alert("Thêm sản phẩm thành công!");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại sau.");
        }
    }

    const handleEditProduct = (product) => {
        setShowEditModal(true)
        setEditingProduct({
            id: product.id,
            name: product.name,
            type: product.type,
            stockQuantity: product.stockQuantity,
            price: product.price.toString(),
            description: product.description || "",
            imageUrl: product.imageUrl,
            supplier: product.supplier
        })
        setEditImagePreview(product.imageUrl)
        setEditImageFile(null)
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        
        if (name === "stockQuantity") {
            // Đảm bảo giá trị là số nguyên không âm
            const numValue = parseInt(value) || 0
            setEditingProduct(prev => ({
                ...prev,
                [name]: numValue < 0 ? 0 : numValue
            }))
        } else {
            setEditingProduct(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleEditImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setEditImageFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setEditImagePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeEditImage = () => {
        setEditImagePreview(null)
        setEditImageFile(null)
    }

    const handleUpdateProduct = async () => {
        try {
            // Validate form
            if (!editingProduct.name || !editingProduct.type || editingProduct.price === "") {
                alert("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            // Convert price to number
            const productData = {
                ...editingProduct,
                price: parseFloat(editingProduct.price) // Đơn giản hóa việc chuyển đổi giá
            };

            // Upload ảnh trước nếu có
            let productDataWithImage = { ...productData };
            if (editImageFile) {
                try {
                    const uploadResult = await productService.uploadProductImage(editImageFile);
                    productDataWithImage.imageUrl = uploadResult.imageUrl;
                    console.log("Uploaded image URL:", uploadResult.imageUrl);
                } catch (uploadError) {
                    console.error("Error uploading image:", uploadError);
                    // Tiếp tục cập nhật sản phẩm mà không có ảnh mới nếu upload thất bại
                }
            }

            // Call API to update product
            const result = await productService.updateProduct(editingProduct.id, productDataWithImage);
            
            // Xử lý URL ảnh tương đối trước khi cập nhật vào state
            let processedResult = { ...result };
            if (processedResult.imageUrl && processedResult.imageUrl.startsWith('/')) {
                processedResult.imageUrl = `http://localhost:8080${processedResult.imageUrl}`;
            }

            // Update products list
            setProducts(products.map(product => 
                product.id === editingProduct.id ? processedResult : product
            ));
            
            setShowEditModal(false);
            alert("Cập nhật sản phẩm thành công!");
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại sau.");
        }
    }

    const handleDeleteProduct = async (id) => {
        try {
            // Call API to delete product
            await productService.deleteProduct(id);

            // Remove product from products list
            setProducts(products.filter(product => product.id !== id));

            alert("Xóa sản phẩm thành công!");
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại sau.");
        }
    }

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Tổng sản phẩm</span>
                        <Package size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">{products.length}</div>
                    <div className="stat-change positive">{products.length > 0 ? `${products.length} sản phẩm trong kho` : 'Chưa có sản phẩm'}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Sắp hết hàng</span>
                        <AlertTriangle size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">{products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length}</div>
                    <div className="stat-change negative">Cần nhập thêm</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Giá trị kho</span>
                        <DollarSign size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0
                        }).format(products.reduce((sum, product) => {
                            // Chuyển đổi giá thành số và đảm bảo là số hợp lệ
                            const price = parseFloat(product.price) || 0;
                            const quantity = parseInt(product.stockQuantity) || 0;
                            return sum + (price * quantity);
                        }, 0))}
                    </div>
                    <div className="stat-change positive">Tổng giá trị hiện tại</div>
                </div>
            </div>

            <div className="card">
                <div className="card-hdr">
                    <div className="card-hdr-content">
                        <h3 className="card-title">Quản lý kho hàng</h3>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={16} className="search-icon" />
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="filter-bar">
                        <div className="filter-group">
                            <label>Danh mục:</label>
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Trạng thái:</label>
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">Tất cả</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Sắp xếp theo:</label>
                            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="name">Tên sản phẩm</option>
                                <option value="price">Giá</option>
                                <option value="stockQuantity">Số lượng</option>
                            </select>
                        </div>
                        <button className="btn btn-secondary" onClick={toggleSortOrder}>
                            <ArrowUpDown size={16} />
                        </button>
                        <button className="btn btn-primary" onClick={handleAddProduct}>
                            <Plus size={16} />
                            Thêm sản phẩm
                        </button>
                    </div>

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
                                <th>Thông tin</th>
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
                                                src={product.imageUrl || "/placeholder.svg"} 
                                                alt={product.name} 
                                                className="product-img"
                                                onError={(e) => {
                                                    console.error("Lỗi tải hình ảnh:", product.imageUrl);
                                                    e.target.onerror = null;
                                                    e.target.src = "/placeholder.svg";
                                                }}
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{product.type}</td>
                                        <td>{product.stockQuantity}</td>
                                        <td>₫{product.price.toLocaleString()}</td>
                                        <td>{product.description || "N/A"}</td>
                                        <td>{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "N/A"}</td>
                                        <td>
                                            <span className={`status ${product.status}`}>{product.status}</span>
                                        </td>
                                        <td className="action-buttons">
                                            <button className="btn-icon btn-view">
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                className="btn-icon btn-edit"
                                                onClick={() => handleEditProduct(product)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="no-results">
                                        Không tìm thấy sản phẩm nào phù hợp
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button className="btn btn-secondary">Trước</button>
                        <div className="page-numbers">
                            <button className="btn btn-primary">1</button>
                            <button className="btn btn-secondary">2</button>
                            <button className="btn btn-secondary">3</button>
                            <span>...</span>
                            <button className="btn btn-secondary">10</button>
                        </div>
                        <button className="btn btn-secondary">Sau</button>
                    </div>
                </div>
            </div>

            {/* Modal thêm sản phẩm */}
            {showAddModal && (
                <div className="inventory-modal-overlay">
                    <div className="inventory-modal">
                        <div className="inventory-modal-header">
                            <h3 className="inventory-modal-title">Thêm sản phẩm mới</h3>
                            <button className="inventory-modal-close" onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="inventory-modal-body">
                            <div className="inventory-form">
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Tên sản phẩm</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="name"
                                            value={newProduct.name} 
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên sản phẩm"
                                        />
                                    </div>
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Danh mục</label>
                                        <select 
                                            className="inventory-form-select" 
                                            name="type"
                                            value={newProduct.type}
                                            onChange={handleInputChange}
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Nhà cung cấp</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="supplier"
                                            value={newProduct.supplier} 
                                            onChange={handleInputChange}
                                            placeholder="Tên nhà cung cấp"
                                        />
                                    </div>
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Số lượng</label>
                                        <input 
                                            type="number" 
                                            className="inventory-form-input" 
                                            name="stockQuantity"
                                            value={newProduct.stockQuantity} 
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Giá (₫)</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="price"
                                            value={newProduct.price} 
                                            onChange={handlePriceChange}
                                            placeholder="VD: 250000"
                                        />
                                    </div>
                                </div>
                                <div className="inventory-form-group">
                                    <label className="inventory-form-label">Mô tả sản phẩm</label>
                                    <textarea 
                                        className="inventory-form-textarea" 
                                        name="description"
                                        value={newProduct.description} 
                                        onChange={handleInputChange}
                                        placeholder="Mô tả chi tiết về sản phẩm"
                                    />
                                </div>
                                <div className="inventory-form-group">
                                    <label className="inventory-form-label">Hình ảnh sản phẩm</label>
                                    <input 
                                        type="file" 
                                        id="product-image" 
                                        accept="image/*" 
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                    />
                                    {!imagePreview ? (
                                        <label htmlFor="product-image" className="image-upload">
                                            <Upload className="image-upload-icon" size={24} />
                                            <p className="image-upload-text">Nhấp để tải lên hoặc kéo thả file</p>
                                        </label>
                                    ) : (
                                        <div className="image-preview-container">
                                            <img src={imagePreview} alt="Preview" className="image-preview" />
                                            <button className="remove-image" onClick={removeImage}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Trạng thái</label>
                                        <select 
                                            className="inventory-form-select" 
                                            name="statusText"
                                            value={newProduct.statusText}
                                            disabled
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        <small style={{ marginTop: '4px', color: '#6b7280' }}>
                                            Trạng thái được tự động cập nhật dựa trên số lượng
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="inventory-modal-footer">
                            <button 
                                className="inventory-modal-cancel" 
                                onClick={() => setShowAddModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="inventory-modal-save" 
                                onClick={handleSubmit}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa sản phẩm */}
            {showEditModal && (
                <div className="inventory-modal-overlay">
                    <div className="inventory-modal">
                        <div className="inventory-modal-header">
                            <h3 className="inventory-modal-title">Chỉnh sửa sản phẩm</h3>
                            <button className="inventory-modal-close" onClick={() => setShowEditModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="inventory-modal-body">
                            <div className="inventory-form">
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Mã sản phẩm</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="id"
                                            value={editingProduct.id} 
                                            readOnly
                                        />
                                    </div>
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Tên sản phẩm</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="name"
                                            value={editingProduct.name} 
                                            onChange={handleEditInputChange}
                                            placeholder="Nhập tên sản phẩm"
                                        />
                                    </div>
                                </div>
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Danh mục</label>
                                        <select 
                                            className="inventory-form-select" 
                                            name="type"
                                            value={editingProduct.type}
                                            onChange={handleEditInputChange}
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Nhà cung cấp</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="supplier"
                                            value={editingProduct.supplier} 
                                            onChange={handleEditInputChange}
                                            placeholder="Tên nhà cung cấp"
                                        />
                                    </div>
                                </div>
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Số lượng</label>
                                        <input 
                                            type="number" 
                                            className="inventory-form-input" 
                                            name="stockQuantity"
                                            value={editingProduct.stockQuantity} 
                                            onChange={handleEditInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Giá (₫)</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="price"
                                            value={editingProduct.price} 
                                            onChange={(e) => {
                                                const formattedPrice = formatPrice(e.target.value)
                                                setEditingProduct(prev => ({
                                                    ...prev,
                                                    price: formattedPrice ? parseInt(formattedPrice) : 0
                                                }))
                                            }}
                                            placeholder="VD: 250000"
                                        />
                                    </div>
                                </div>
                                <div className="inventory-form-group">
                                    <label className="inventory-form-label">Mô tả sản phẩm</label>
                                    <textarea 
                                        className="inventory-form-textarea" 
                                        name="description"
                                        value={editingProduct.description} 
                                        onChange={handleEditInputChange}
                                        placeholder="Mô tả chi tiết về sản phẩm"
                                    />
                                </div>
                                <div className="inventory-form-group">
                                    <label className="inventory-form-label">Hình ảnh sản phẩm</label>
                                    <input 
                                        type="file" 
                                        id="product-image" 
                                        accept="image/*" 
                                        style={{ display: 'none' }}
                                        onChange={handleEditImageUpload}
                                    />
                                    {!editImagePreview ? (
                                        <label htmlFor="product-image" className="image-upload">
                                            <Upload className="image-upload-icon" size={24} />
                                            <p className="image-upload-text">Nhấp để tải lên hoặc kéo thả file</p>
                                        </label>
                                    ) : (
                                        <div className="image-preview-container">
                                            <img src={editImagePreview} alt="Preview" className="image-preview" />
                                            <button className="remove-image" onClick={removeEditImage}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Trạng thái</label>
                                        <select 
                                            className="inventory-form-select" 
                                            name="statusText"
                                            value={editingProduct.statusText}
                                            disabled
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        <small style={{ marginTop: '4px', color: '#6b7280' }}>
                                            Trạng thái được tự động cập nhật dựa trên số lượng
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="inventory-modal-footer">
                            <button 
                                className="inventory-modal-cancel" 
                                onClick={() => setShowEditModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="inventory-modal-save" 
                                onClick={handleUpdateProduct}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InventoryContent
