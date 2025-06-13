"use client"

import { useState } from "react"
import {
    Package,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Search,
    ArrowUpDown,
    Plus,
    Edit,
    Eye,
    Trash2,
    X,
    Upload,
    Image
} from "lucide-react"
import "../styles/inventory.css"

const InventoryContent = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState("asc")
    const [showAddModal, setShowAddModal] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [newProduct, setNewProduct] = useState({
        id: "",
        name: "",
        category: "Kính",
        quantity: 0,
        price: "",
        status: "active",
        statusText: "Còn hàng",
        supplier: "",
        description: ""
    })

    const products = [
        {
            id: "SP001",
            name: "Kính mát",
            category: "Kính",
            quantity: 150,
            price: 250000,
            status: "active",
            statusText: "Còn hàng",
            supplier: "Công ty TNHH",
            lastUpdated: "15/01/2024",
            image: "/placeholder.svg?height=50&width=50",
        },
        {
            id: "SP002",
            name: "Kính gọng tròn",
            category: "Kính",
            quantity: 25,
            price: 1500000,
            status: "active",
            statusText: "Còn hàng",
            supplier: "Công ty TNHH",
            lastUpdated: "12/01/2024",
            image: "/placeholder.svg?height=50&width=50",
        },
        {
            id: "SP003",
            name: "Thuốc nhỏ mắt",
            category: "Y tế",
            quantity: 5,
            price: 180000,
            status: "warning",
            statusText: "Sắp hết",
            supplier: "Công ty Dược phẩm",
            lastUpdated: "10/01/2024",
            image: "/placeholder.svg?height=50&width=50",
        },
        {
            id: "SP004",
            name: "Máy mát sa mắt",
            category: "Thiết bị",
            quantity: 0,
            price: 800000,
            status: "inactive",
            statusText: "Hết hàng",
            supplier: "Công ty TNHH",
            lastUpdated: "05/01/2024",
            image: "/placeholder.svg?height=50&width=50",
        },
        {
            id: "SP005",
            name: "Kính nhìn đêm",
            category: "Thiết bị",
            quantity: 12,
            price: 350000,
            status: "active",
            statusText: "Còn hàng",
            supplier: "Công ty",
            lastUpdated: "08/01/2024",
            image: "/placeholder.svg?height=50&width=50",
        },
        {
            id: "SP006",
            name: "Thực phẩm chức năng",
            category: "Thuốc",
            quantity: 200,
            price: 120000,
            status: "active",
            statusText: "Còn hàng",
            supplier: "Công ty TNHH",
            lastUpdated: "14/01/2024",
            image: "/placeholder.svg?height=50&width=50",
        },
    ]

    const categories = ["Thuốc", "Thiết bị", "Kính"]
    const statuses = ["Còn hàng", "Sắp hết", "Hết hàng"]

    const filteredProducts = products
        .filter(
            (product) =>
                (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (categoryFilter === "all" || product.category === categoryFilter) &&
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
                case "quantity":
                    comparison = a.quantity - b.quantity
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
        // Tạo mã sản phẩm mới dựa trên số lượng sản phẩm hiện có
        const newId = `SP${(products.length + 1).toString().padStart(3, '0')}`
        setNewProduct({
            id: newId,
            name: "",
            category: "Kính",
            quantity: 0,
            price: "",
            status: "active",
            statusText: "Còn hàng",
            supplier: "",
            description: ""
        })
        setImagePreview(null)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target

        if (name === "quantity") {
            // Đảm bảo giá trị là số nguyên không âm
            const numValue = parseInt(value) || 0
            setNewProduct(prev => ({
                ...prev,
                [name]: numValue < 0 ? 0 : numValue,
                // Tự động cập nhật trạng thái dựa trên số lượng
                status: numValue <= 0 ? "inactive" : numValue <= 5 ? "warning" : "active",
                statusText: numValue <= 0 ? "Hết hàng" : numValue <= 5 ? "Sắp hết" : "Còn hàng"
            }))
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
            price: formattedPrice ? parseInt(formattedPrice) : 0
        }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
    }

    const handleSubmit = () => {
        // Trong thực tế, đây là nơi bạn sẽ gửi dữ liệu đến API
        // Nhưng vì đây là demo, chúng ta sẽ chỉ log ra console
        console.log('Đã thêm sản phẩm mới:', newProduct)

        // Đóng modal
        setShowAddModal(false)
    }

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Tổng sản phẩm</span>
                        <Package size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">1,234</div>
                    <div className="stat-change positive">+45 sản phẩm mới</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Sắp hết hàng</span>
                        <AlertTriangle size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">23</div>
                    <div className="stat-change negative">Cần nhập thêm</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Giá trị kho</span>
                        <DollarSign size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">₫125M</div>
                    <div className="stat-change positive">+8% từ tháng trước</div>
                </div>

                <div className="stat-card">
                    <div className="stat-hdr">
                        <span className="stat-title">Xuất kho hôm nay</span>
                        <TrendingUp size={24} className="stat-icon" />
                    </div>
                    <div className="stat-value">89</div>
                    <div className="stat-change positive">+12 từ hôm qua</div>
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
                                <option value="quantity">Số lượng</option>
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
                                            <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-img" />
                                        </td>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>{product.quantity}</td>
                                        <td>₫{product.price.toLocaleString()}</td>
                                        <td>{product.supplier}</td>
                                        <td>{product.lastUpdated}</td>
                                        <td>
                                            <span className={`status ${product.status}`}>{product.statusText}</span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn btn-icon" title="Chỉnh sửa">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn btn-icon" title="Xem chi tiết">
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
                                        <label className="inventory-form-label">Mã sản phẩm</label>
                                        <input 
                                            type="text" 
                                            className="inventory-form-input" 
                                            name="id"
                                            value={newProduct.id} 
                                            readOnly
                                        />
                                    </div>
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
                                </div>
                                <div className="inventory-form-row">
                                    <div className="inventory-form-group">
                                        <label className="inventory-form-label">Danh mục</label>
                                        <select 
                                            className="inventory-form-select" 
                                            name="category"
                                            value={newProduct.category}
                                            onChange={handleInputChange}
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
                                            value={newProduct.supplier} 
                                            onChange={handleInputChange}
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
                                            name="quantity"
                                            value={newProduct.quantity} 
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
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
        </div>
    )
}

export default InventoryContent
