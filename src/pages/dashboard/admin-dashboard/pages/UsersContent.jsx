"use client"

import { useState } from "react"
import {
    Users,
    Star,
    Activity,
    Lock,
    Search,
    Plus,
    UserCheck,
    UserX,
    UserCircle,
    Shield,
    Clock,
    X,
    Mail,
    Phone,
    MapPin
} from "lucide-react"
import { toast } from "react-toastify"
import "../styles/users.css"

const UsersContent = ({ selectedCustomer, setSelectedCustomer, showCustomerModal, setShowCustomerModal }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [roleFilter, setRoleFilter] = useState("all")
    const [showAddModal, setShowAddModal] = useState(false)
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@gmail.com",
            phone: "0901234567",
            role: "customer",
            roleText: "Khách hàng",
            status: "active",
            statusText: "Hoạt động",
            joinDate: "15/01/2024",
            lastLogin: "Hôm nay, 08:30",
            avatar: "/placeholder.svg?height=40&width=40",
            totalAppointments: 5,
            totalSpent: 2500000,
            address: "123 Đường Lê Hồng Phong, Quận 1, TP.HCM",
            dateOfBirth: "15/05/1985",
            gender: "Nam",
        },
        {
            id: 2,
            name: "BS. Trần Thị B",
            email: "tranthib@eyespire.com",
            phone: "0912345678",
            role: "doctor",
            roleText: "Bác sĩ",
            status: "active",
            statusText: "Hoạt động",
            joinDate: "12/01/2024",
            lastLogin: "Hôm qua, 15:20",
            avatar: "/placeholder.svg?height=40&width=40",
            totalAppointments: 45,
            totalSpent: 0,
            address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
            dateOfBirth: "22/08/1990",
            gender: "Nữ",
        },
        {
            id: 3,
            name: "Lê Văn C",
            email: "levanc@eyespire.com",
            phone: "0923456789",
            role: "receptionist",
            roleText: "Lễ tân",
            status: "active",
            statusText: "Hoạt động",
            joinDate: "08/01/2024",
            lastLogin: "3 ngày trước",
            avatar: "/placeholder.svg?height=40&width=40",
            totalAppointments: 0,
            totalSpent: 0,
            address: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
            dateOfBirth: "10/12/1988",
            gender: "Nam",
        },
        {
            id: 4,
            name: "Phạm Thị D",
            email: "phamthid@eyespire.com",
            phone: "0934567890",
            role: "pharmacist",
            roleText: "Dược sĩ",
            status: "active",
            statusText: "Hoạt động",
            joinDate: "05/01/2024",
            lastLogin: "Hôm nay, 10:15",
            avatar: "/placeholder.svg?height=40&width=40",
            totalAppointments: 0,
            totalSpent: 0,
            address: "321 Đường Võ Văn Tần, Quận 3, TP.HCM",
            dateOfBirth: "03/07/1992",
            gender: "Nữ",
        },
        {
            id: 5,
            name: "Hoàng Văn E",
            email: "hoangvane@gmail.com",
            phone: "0945678901",
            role: "customer",
            roleText: "Khách hàng",
            status: "active",
            statusText: "Hoạt động",
            joinDate: "01/01/2024",
            lastLogin: "Hôm nay, 07:45",
            avatar: "/placeholder.svg?height=40&width=40",
            totalAppointments: 4,
            totalSpent: 2000000,
            address: "654 Đường Pasteur, Quận 1, TP.HCM",
            dateOfBirth: "18/11/1987",
            gender: "Nam",
        },
        {
            id: 6,
            name: "Võ Thị F",
            email: "vothif@gmail.com",
            phone: "0956789012",
            role: "customer",
            roleText: "Khách hàng",
            status: "blocked",
            statusText: "Bị khóa",
            joinDate: "20/12/2023",
            lastLogin: "1 tuần trước",
            avatar: "/placeholder.svg?height=40&width=40",
            totalAppointments: 1,
            totalSpent: 500000,
            address: "987 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM",
            dateOfBirth: "25/02/1995",
            gender: "Nữ",
        },
    ])
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        roleText: 'Khách hàng',
        status: 'active',
        statusText: 'Hoạt động',
        address: '',
        dateOfBirth: '',
        gender: 'Nam'
    })

    const statuses = ["active", "inactive", "blocked"]
    const roles = ["customer", "doctor", "receptionist", "pharmacist"]

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        return matchesSearch && matchesStatus && matchesRole
    })

    const getStatusText = (status) => {
        switch (status) {
            case "active": return "Hoạt động"
            case "inactive": return "Không hoạt động"
            case "blocked": return "Bị khóa"
            default: return status
        }
    }

    const getRoleText = (role) => {
        switch (role) {
            case "customer": return "Khách hàng"
            case "doctor": return "Bác sĩ"
            case "receptionist": return "Lễ tân"
            case "pharmacist": return "Dược sĩ"
            default: return role
        }
    }

    const handleAddUser = () => {
        setShowAddModal(true)
        setNewUser({
            name: '',
            email: '',
            phone: '',
            role: 'customer',
            roleText: 'Khách hàng',
            status: 'active',
            statusText: 'Hoạt động',
            address: '',
            dateOfBirth: '',
            gender: 'Nam'
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === "role") {
            setNewUser(prev => ({
                ...prev,
                [name]: value,
                roleText: getRoleText(value)
            }))
        } else if (name === "status") {
            setNewUser(prev => ({
                ...prev,
                [name]: value,
                statusText: getStatusText(value)
            }))
        } else {
            setNewUser(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleSubmit = () => {
        if (!newUser.name || !newUser.email || !newUser.phone) {
            toast.error("Vui lòng điền đầy đủ họ tên, email và số điện thoại")
            return
        }
        if (!/^\d{10}$/.test(newUser.phone)) {
            toast.error("Số điện thoại phải có 10 chữ số")
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
            toast.error("Email không hợp lệ")
            return
        }

        const newUserData = {
            ...newUser,
            id: users.length + 1,
            joinDate: new Date().toLocaleDateString('vi-VN'),
            lastLogin: "Chưa đăng nhập",
            avatar: "/placeholder.svg?height=40&width=40",
            totalAppointments: 0,
            totalSpent: 0
        }

        setTimeout(() => {
            setUsers(prev => [...prev, newUserData])
            setShowAddModal(false)
            toast.success("Thêm người dùng thành công")
        }, 500)
    }

    const handleBlockUser = (userId) => {
        if (!window.confirm("Bạn có chắc muốn khóa người dùng này?")) return
        setTimeout(() => {
            setUsers(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, status: "blocked", statusText: "Bị khóa" }
                    : user
            ))
            toast.success("Khóa người dùng thành công")
        }, 500)
    }

    const handleUnblockUser = (userId) => {
        if (!window.confirm("Bạn có chắc muốn mở khóa người dùng này?")) return
        setTimeout(() => {
            setUsers(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, status: "active", statusText: "Hoạt động" }
                    : user
            ))
            toast.success("Mở khóa người dùng thành công")
        }, 500)
    }

    return (
        <div>
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Tổng người dùng</span>
                        <Users size={24} className="admin-stat-icon" />
                    </div>
                    <div className="admin-stat-value">{users.length}</div>
                    <div className="admin-stat-change admin-stat-positive">
                        +{users.filter(u => {
                        const joinDate = new Date(u.joinDate.split('/').reverse().join('-'));
                        const lastMonth = new Date();
                        lastMonth.setMonth(lastMonth.getMonth() - 1);
                        return joinDate > lastMonth;
                    }).length} người dùng mới
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Bác sĩ hoạt động</span>
                        <Star size={24} className="admin-stat-icon" />
                    </div>
                    <div className="admin-stat-value">{users.filter(u => u.role === "doctor" && u.status === "active").length}</div>
                    <div className="admin-stat-change admin-stat-positive">+0 từ tháng trước</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Lễ tân</span>
                        <Activity size={24} className="admin-stat-icon" />
                    </div>
                    <div className="admin-stat-value">{users.filter(u => u.role === "receptionist").length}</div>
                    <div className="admin-stat-change admin-stat-positive">+0% từ hôm qua</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Dược sĩ</span>
                        <Lock size={24} className="admin-stat-icon" />
                    </div>
                    <div className="admin-stat-value">{users.filter(u => u.role === "pharmacist").length}</div>
                    <div className="admin-stat-change admin-stat-negative">Cần xem xét</div>
                </div>
            </div>

            <div className="admin-users-card">
                <div className="admin-users-card-header">
                    <div className="admin-users-card-header-content">
                        <h3 className="admin-users-card-title">Quản lý người dùng</h3>
                        <div className="admin-users-search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="admin-users-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={16} className="admin-users-search-icon"/>
                        </div>
                    </div>
                </div>
                <div className="admin-users-card-content">
                    <div className="admin-users-filter-bar">
                        <div className="admin-users-filter-group">
                            <label>Trạng thái:</label>
                            <select className="admin-users-form-select" value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">Tất cả</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {getStatusText(status)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-users-filter-group">
                            <label>Vai trò:</label>
                            <select className="admin-users-form-select" value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="all">Tất cả</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {getRoleText(role)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="admin-users-btn admin-users-btn-primary" onClick={handleAddUser}>
                            <Plus size={16}/>
                            Thêm người dùng
                        </button>
                    </div>

                    <div className="admin-users-grid">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div key={user.id} className="admin-user-card">
                                    <div className="admin-user-header">
                                        <div className="admin-user-avatar-container">
                                            <img src={user.avatar || "/placeholder.svg"} alt="Avatar"
                                                 className="admin-user-avatar"/>
                                        </div>
                                        <span
                                            className={`admin-user-status admin-user-status-${user.status}`}>{user.statusText}</span>
                                    </div>
                                    <div className="user-info">
                                        <h4 className="user-name">{user.name}</h4>
                                        <p className="user-email">{user.email}</p>
                                        <p className="user-phone">{user.phone}</p>
                                        <span className={`user-role-badge ${user.role}`}>{user.roleText}</span>
                                    </div>
                                    <div className="user-stats">
                                        <div className="user-stat">
                                            <span className="stat-label">Tham gia:</span>
                                            <span className="stat-value">{user.joinDate}</span>
                                        </div>
                                        <div className="user-stat">
                                            <span className="stat-label">Lần cuối:</span>
                                            <span className="stat-value">{user.lastLogin}</span>
                                        </div>
                                        <div className="user-stat">
                                            <span className="stat-label">Cuộc hẹn:</span>
                                            <span className="stat-value">{user.totalAppointments}</span>
                                        </div>
                                        <div className="user-stat">
                                            <span className="stat-label">Chi tiêu:</span>
                                            <span className="stat-value">₫{user.totalSpent.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="user-actions">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setSelectedCustomer(user)
                                                setShowCustomerModal(true)
                                            }}
                                        >
                                            Chi tiết
                                        </button>
                                        {user.status === "blocked" ? (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleUnblockUser(user.id)}
                                            >
                                                <UserCheck size={16}/>
                                                Mở khóa
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-warning"
                                                onClick={() => handleBlockUser(user.id)}
                                            >
                                                <UserX size={16}/>
                                                Khóa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">Không tìm thấy người dùng nào phù hợp</div>
                        )}
                    </div>
                    <div className="pagination">
                        <button className="btn btn-secondary">Trước</button>
                        <div className="page-numbers">
                            <button className="btn btn-primary">1</button>
                            <button className="btn btn-secondary">2</button>
                            <button className="btn btn-secondary">3</button>
                            <span>...</span>
                            <button className="btn btn-secondary">8</button>
                        </div>
                        <button className="btn btn-secondary">Sau</button>
                    </div>
                </div>
            </div>

            {showCustomerModal && selectedCustomer && (
                <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
                    <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thông tin người dùng - {selectedCustomer.name}</h3>
                            <button className="modal-close" onClick={() => setShowCustomerModal(false)}>
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="appointment-detail-layout">
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <UserCircle size={18}/>
                                        Thông tin cá nhân
                                    </h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Họ tên:</span>
                                            <span className="detail-value">{selectedCustomer.name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{selectedCustomer.email}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Số điện thoại:</span>
                                            <span className="detail-value">{selectedCustomer.phone}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Ngày sinh:</span>
                                            <span className="detail-value">{selectedCustomer.dateOfBirth}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Giới tính:</span>
                                            <span className="detail-value">{selectedCustomer.gender}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Địa chỉ:</span>
                                            <span className="detail-value">{selectedCustomer.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <Shield size={18}/>
                                        Thông tin tài khoản
                                    </h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Ngày tham gia:</span>
                                            <span className="detail-value">{selectedCustomer.joinDate}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Lần đăng nhập cuối:</span>
                                            <span className="detail-value">{selectedCustomer.lastLogin}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Trạng thái:</span>
                                            <span
                                                className={`status ${selectedCustomer.status}`}>{selectedCustomer.statusText}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <Activity size={18}/>
                                        Thống kê hoạt động
                                    </h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Tổng cuộc hẹn:</span>
                                            <span className="detail-value">{selectedCustomer.totalAppointments}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Tổng chi tiêu:</span>
                                            <span
                                                className="detail-value">₫{selectedCustomer.totalSpent.toLocaleString()}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Chi tiêu trung bình:</span>
                                            <span className="detail-value">
                                                ₫{selectedCustomer.totalAppointments > 0
                                                ? Math.round(
                                                    selectedCustomer.totalSpent / selectedCustomer.totalAppointments,
                                                ).toLocaleString()
                                                : "0"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-section">
                                    <h4 className="detail-section-title">
                                        <Clock size={18}/>
                                        Hoạt động gần đây
                                    </h4>
                                    <div className="action-history">
                                        <div className="history-item">
                                            <div className="history-time">15/01/2024 - 08:30</div>
                                            <div className="history-action">Đăng nhập hệ thống</div>
                                            <div className="history-user">Từ: TP.HCM</div>
                                        </div>
                                        <div className="history-item">
                                            <div className="history-time">14/01/2024 - 14:00</div>
                                            <div className="history-action">Đặt lịch hẹn khám</div>
                                            <div className="history-user">Dịch vụ: Khám tổng quát</div>
                                        </div>
                                        <div className="history-item">
                                            <div className="history-time">12/01/2024 - 10:15</div>
                                            <div className="history-action">Cập nhật thông tin cá nhân</div>
                                            <div className="history-user">Thay đổi: Số điện thoại</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="admin-users-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="admin-users-modal-overlay">
                    <div className="admin-users-modal">
                        <div className="admin-users-modal-header">
                            <h3 className="admin-users-modal-title">Thêm người dùng mới</h3>
                            <button className="admin-users-modal-close"
                                    onClick={() => setShowAddModal(false)}>
                                <X size={18}/>
                            </button>
                        </div>
                        <div className="admin-users-modal-body">
                            <div className="admin-users-form">
                                <div className="admin-users-form-row">
                                    <div className="admin-users-form-group">
                                        <label className="admin-users-form-label">Họ và tên</label>
                                        <input
                                            type="text"
                                            className="admin-users-form-input"
                                            name="name"
                                            value={newUser.name}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div className="admin-users-form-group">
                                        <label className="admin-users-form-label">Email</label>
                                        <input
                                            type="email"
                                            className="admin-users-form-input"
                                            name="email"
                                            value={newUser.email}
                                            onChange={handleInputChange}
                                            placeholder="Nhập địa chỉ email"
                                        />
                                    </div>
                                </div>
                                <div className="admin-users-form-row">
                                    <div className="admin-users-form-group">
                                        <label className="admin-users-form-label">Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="admin-users-form-input"
                                            name="phone"
                                            value={newUser.phone}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div className="admin-users-form-group">
                                        <label className="admin-users-form-label">Vai trò</label>
                                        <select
                                            className="admin-users-form-select"
                                            name="role"
                                            value={newUser.role}
                                            onChange={handleInputChange}
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>{getRoleText(role)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="admin-users-form-row">
                                    <div className="admin-users-form-group">
                                        <label className="admin-users-form-label">Ngày sinh</label>
                                        <input
                                            type="date"
                                            className="admin-users-form-input"
                                            name="dateOfBirth"
                                            value={newUser.dateOfBirth}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="admin-users-form-group">
                                        <label className="admin-users-form-label">Giới tính</label>
                                        <select
                                            className="admin-users-form-select"
                                            name="gender"
                                            value={newUser.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="admin-users-form-group">
                                    <label className="admin-users-form-label">Địa chỉ</label>
                                    <textarea
                                        className="admin-users-form-textarea"
                                        name="address"
                                        value={newUser.address}
                                        onChange={handleInputChange}
                                        placeholder="Nhập địa chỉ đầy đủ"
                                    />
                                </div>
                                <div className="admin-users-form-group">
                                    <label className="admin-users-form-label">Trạng thái</label>
                                    <select
                                        className="admin-users-form-select"
                                        name="status"
                                        value={newUser.status}
                                        onChange={handleInputChange}
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{getStatusText(status)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="admin-users-modal-footer">
                            <button
                                className="admin-users-modal-cancel"
                                onClick={() => setShowAddModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="admin-users-modal-save"
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

export default UsersContent