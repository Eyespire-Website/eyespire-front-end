"use client";

import { useState, useEffect } from "react";
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
    MapPin,
    Eye,
    Unlock
} from "lucide-react";
import { toast } from "react-toastify";
import userService from "../../../../services/userService";
import "../styles/users.css";
import "../styles/users-unified.css";

const UsersContent = () => {
    // State cho tìm kiếm và filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    // Estados relacionados à adição de usuário foram removidos

    const statuses = ["active", "inactive", "blocked"];
    const roles = ["DOCTOR", "RECEPTIONIST", "PATIENT", "STORE_MANAGER"];

    // Hàm helper để chuyển đổi trạng thái thành văn bản
    const getStatusText = (status) => {
        switch (status) {
            case "active": return "Hoạt động";
            case "inactive": return "Không hoạt động";
            case "blocked": return "Bị khóa";
            default: return status;
        }
    };

    // Hàm helper để chuyển đổi vai trò thành văn bản
    const getRoleText = (role) => {
        if (!role) return "Không xác định";
        
        // Chuyển về chữ thường để so sánh
        const roleLower = role.toLowerCase();
        
        switch (roleLower) {
            case "doctor": return "Bác sĩ";
            case "receptionist": return "Lễ tân";
            case "patient": return "Bệnh Nhân";
            case "store_manager": return "Quản lý cửa hàng";
            default: return role;
        }
    };

    // Lưu trữ tất cả người dùng để lọc client-side
    const [allUsers, setAllUsers] = useState([]);
    
    // Fetch users khi component mount và khi các dependency phân trang thay đổi
    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, sortBy, sortDir]);

    // Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Reset về trang đầu tiên khi tìm kiếm
        setCurrentPage(0);
    };

    // Hàm xử lý thay đổi filter
    const handleFilterChange = (type, value, event) => {
        if (event) {
            event.preventDefault(); // Ngăn chặn hành vi mặc định
        }
        
        if (type === 'status') {
            setStatusFilter(value);
        } else if (type === 'role') {
            setRoleFilter(value);
        }
        // Reset về trang đầu tiên khi thay đổi filter
        setCurrentPage(0);
    };

    // Hàm fetch users từ API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Chuẩn bị tham số cho API call - chỉ bao gồm phân trang và sắp xếp
            const params = {
                page: currentPage,
                size: pageSize,
                sortBy: sortBy,
                sortDir: sortDir,
                excludeAdmin: true // Thêm tham số để loại trừ admin từ API
            };

            // Gọi API
            const response = await userService.getUsersWithPagination(params);
            console.log("API response:", response);
            
            // Kiểm tra và cập nhật state với dữ liệu từ API
            if (response && response.users) {
                // Lọc bỏ tài khoản admin từ danh sách (phòng trường hợp API không hỗ trợ excludeAdmin)
                const filteredUsers = response.users.filter(user => 
                    user.role !== "ADMIN" && user.role !== "admin"
                );
                
                setAllUsers(filteredUsers);
                setTotalPages(response.totalPages || 0);
                setTotalItems(response.totalItems || 0); // Sử dụng totalItems từ API
                setError(null);
            } else {
                console.error("Invalid response format:", response);
                setAllUsers([]);
                setTotalPages(0);
                setTotalItems(0);
                setError("Định dạng dữ liệu không hợp lệ");
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setAllUsers([]);
            setError("Có lỗi xảy ra khi tải dữ liệu người dùng. Vui lòng thử lại sau.");
            toast.error("Có lỗi xảy ra khi tải dữ liệu người dùng");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi trang
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Funções relacionadas à adição de usuário foram removidas

    // Xử lý khóa người dùng
    const handleBlockUser = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn khóa người dùng này?")) return;
        
        try {
            setLoading(true);
            
            // Gọi API để khóa người dùng
            await userService.toggleUserStatus(userId, "blocked");
            
            // Cập nhật UI - sử dụng allUsers thay vì users
            setAllUsers(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, status: "blocked" }
                    : user
            ));
            
            toast.success("Khóa người dùng thành công");
        } catch (err) {
            console.error("Error blocking user:", err);
            toast.error("Có lỗi xảy ra khi khóa người dùng");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý mở khóa người dùng
    const handleUnblockUser = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn mở khóa người dùng này?")) return;
        
        try {
            setLoading(true);
            
            // Gọi API để mở khóa người dùng
            await userService.toggleUserStatus(userId, "active");
            
            // Cập nhật UI - sử dụng allUsers thay vì users
            setAllUsers(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, status: "active" }
                    : user
            ));
            
            toast.success("Mở khóa người dùng thành công");
        } catch (err) {
            console.error("Error unblocking user:", err);
            toast.error("Có lỗi xảy ra khi mở khóa người dùng");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý hiển thị chi tiết người dùng
    const handleViewUserDetails = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    // Função de adicionar usuário foi removida

    // Tạo mảng các số trang để hiển thị phân trang
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxPagesToShow
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Luôn hiển thị trang đầu tiên
            pageNumbers.push(0);
            
            // Tính toán phạm vi trang cần hiển thị
            let startPage = Math.max(1, currentPage - 1);
            let endPage = Math.min(totalPages - 2, currentPage + 1);
            
            // Đảm bảo luôn hiển thị đủ số trang
            if (endPage - startPage + 1 < maxPagesToShow - 2) {
                if (currentPage < totalPages / 2) {
                    endPage = Math.min(totalPages - 2, startPage + maxPagesToShow - 3);
                } else {
                    startPage = Math.max(1, endPage - (maxPagesToShow - 3));
                }
            }
            
            // Thêm dấu ... nếu cần
            if (startPage > 1) {
                pageNumbers.push('...');
            }
            
            // Thêm các trang ở giữa
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            // Thêm dấu ... nếu cần
            if (endPage < totalPages - 2) {
                pageNumbers.push('...');
            }
            
            // Luôn hiển thị trang cuối cùng
            pageNumbers.push(totalPages - 1);
        }
        
        return pageNumbers;
    };

    // Lọc người dùng client-side dựa trên searchTerm, statusFilter, roleFilter
    const filteredUsers = allUsers.filter(user => {
        // Lọc theo từ khóa tìm kiếm
        const searchMatch = 
            !searchTerm || 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);
        
        // Lọc theo trạng thái
        const statusMatch = statusFilter === 'all' || user.status === statusFilter;
        
        // Lọc theo vai trò (xử lý cả chữ hoa và chữ thường)
        const roleMatch = roleFilter === 'all' || 
                         user.role?.toLowerCase() === roleFilter.toLowerCase() ||
                         user.role === roleFilter;
        
        return searchMatch && statusMatch && roleMatch;
    });
    
    // Client-side pagination logic
    const itemsPerPage = 10;
    const totalPagesCalculated = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Hiển thị thông báo khi không có kết quả tìm kiếm
    useEffect(() => {
        if (filteredUsers.length === 0 && allUsers.length > 0 && (searchTerm || statusFilter !== 'all' || roleFilter !== 'all')) {
            toast.info('Không tìm thấy người dùng phù hợp với điều kiện tìm kiếm');
        }
    }, [filteredUsers.length, allUsers.length, searchTerm, statusFilter, roleFilter]);

    // Render UI
    return (
        <div className="users-content">
            {/* Header với thống kê và tìm kiếm */}
            <div className="users-header">
                <div className="users-stats">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>{allUsers && allUsers.filter(user => user.status === "active").length || 0}</h3>
                            <p>Đang hoạt động</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <UserCheck size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>{allUsers && allUsers.filter(user => user.status === "active").length || 0}</h3>
                            <p>Đang hoạt động</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <UserX size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>{allUsers && allUsers.filter(user => user.status === "blocked").length || 0}</h3>
                            <p>Bị khóa</p>
                        </div>
                    </div>
                </div>

                <div className="users-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm người dùng..." 
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    {/* Botão de adicionar usuário foi removido */}
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="users-filters">
                <div className="filter-group">
                    <label>Trạng thái:</label>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => handleFilterChange('status', e.target.value, e)}
                    >
                        <option value="all">Tất cả</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {getStatusText(status)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Vai trò:</label>
                    <select 
                        value={roleFilter} 
                        onChange={(e) => handleFilterChange('role', e.target.value, e)}
                    >
                        <option value="all">Tất cả</option>
                        {roles.map(role => (
                            <option key={role} value={role}>
                                {getRoleText(role)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && <div className="error-message">{error}</div>}

            {/* Danh sách người dùng */}
            {loading ? (
                <div className="users-content">
                    <div className="users-content__loading">
                        <div className="users-content__spinner"></div>
                        <p>Đang tải danh sách người dùng...</p>
                    </div>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="users-content">
                            <div className="users-content__error">
                                <p>{error}</p>
                                <button onClick={fetchUsers} className="users-content__retry-button">
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="users-content__table-container">
                        <div className="users-content__table-header">
                            <div className="users-content__table-header-content">
                                <Users className="users-content__table-header-icon" />
                                <span className="users-content__table-header-text">
                                    Danh sách người dùng ({filteredUsers.length} người dùng)
                                </span>
                            </div>
                        </div>

                        <div className="users-content__table-wrapper">
                            <table className="users-content__table">
                                <thead>
                                    <tr>
                                        <th className="users-content__table-head users-content__table-head--number">#</th>
                                        <th className="users-content__table-head">Tên tài khoản</th>
                                        <th className="users-content__table-head">Email</th>
                                        <th className="users-content__table-head">Họ và tên</th>
                                        <th className="users-content__table-head">Số điện thoại</th>
                                        <th className="users-content__table-head">Vai trò</th>
                                        <th className="users-content__table-head">Trạng thái</th>
                                        <th className="users-content__table-head">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="users-content__table-cell users-content__table-cell--empty">
                                                {filteredUsers.length === 0 ? "Không có người dùng nào" : "Không có dữ liệu cho trang này"}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentUsers.map((user, index) => (
                                            <tr key={user.id} className="users-content__table-row">
                                                <td className="users-content__table-cell">
                                                    {startIndex + index + 1}
                                                </td>
                                                <td className="users-content__table-cell">
                                                    <span className="users-content__username">@{user.username || "Chưa cập nhật"}</span>
                                                </td>
                                                <td className="users-content__table-cell">{user.email || "Chưa cập nhật"}</td>
                                                <td className="users-content__table-cell">{user.name || "Chưa cập nhật"}</td>
                                                <td className="users-content__table-cell">{user.phone || "Chưa cập nhật"}</td>
                                                <td className="users-content__table-cell">
                                                    <span className={`users-content__role-badge ${user.role?.toLowerCase()}`}>
                                                        {getRoleText(user.role)}
                                                    </span>
                                                </td>
                                                <td className="users-content__table-cell">
                                                    <span className={`users-content__status-badge ${user.status}`}>
                                                        {getStatusText(user.status)}
                                                    </span>
                                                </td>
                                                <td className="users-content__table-cell">
                                                    <div className="users-content__action-buttons">
                                                        <button 
                                                            className="users-content__detail-button"
                                                            onClick={() => handleViewUserDetails(user)}
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            className={`users-content__action-button ${user.status === 'blocked' ? 'users-content__action-button--unblock' : 'users-content__action-button--block'}`}
                                                            onClick={() => user.status === 'blocked' ? handleUnblockUser(user.id) : handleBlockUser(user.id)}
                                                            title={user.status === 'blocked' ? 'Mở khóa' : 'Khóa'}
                                                        >
                                                            {user.status === 'blocked' ? <Unlock size={16} /> : <Lock size={16} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Compact Pagination */}
                        {filteredUsers.length > 0 && (
                            <div className="users-content__pagination">
                                <button
                                    className="users-content__pagination-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                >
                                    «
                                </button>
                                {Array.from({ length: totalPagesCalculated }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`users-content__pagination-btn ${currentPage === i ? 'users-content__pagination-btn--active' : ''}`}
                                        onClick={() => handlePageChange(i)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="users-content__pagination-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPagesCalculated - 1}
                                >
                                    »
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modal thêm người dùng đã được xóa */}

            {/* Modal chi tiết người dùng */}
            {showUserModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Chi tiết người dùng</h2>
                            <button className="close-btn" onClick={() => setShowUserModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="user-details-content">
                            <div className="user-avatar-large">
                                {selectedUser.avatarUrl ? (
                                    <>
                                        <img 
                                            src={selectedUser.avatarUrl} 
                                            alt={selectedUser.name} 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                document.getElementById('fallback-avatar-icon').style.display = 'block';
                                            }} 
                                        />
                                        <UserCircle id="fallback-avatar-icon" size={80} style={{display: 'none'}} />
                                    </>
                                ) : (
                                    <UserCircle size={80} />
                                )}
                            </div>
                            <h3 className="user-name-large">{selectedUser.name}</h3>
                            <div className="user-role-badge">
                                <Shield size={16} />
                                {getRoleText(selectedUser.role)}
                            </div>
                            <div className="user-status-badge">
                                {selectedUser.status === "active" ? (
                                    <UserCheck size={16} />
                                ) : selectedUser.status === "blocked" ? (
                                    <Lock size={16} />
                                ) : (
                                    <Clock size={16} />
                                )}
                                {getStatusText(selectedUser.status)}
                            </div>
                            
                            <div className="user-info-grid">
                                <div className="info-item">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{selectedUser.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Số điện thoại</span>
                                    <span className="info-value">{selectedUser.phone || "Chưa cập nhật"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Tên tài khoản</span>
                                    <span className="info-value">{selectedUser.username}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Địa chỉ</span>
                                    <span className="info-value">{selectedUser.address || "Chưa cập nhật"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Ngày sinh</span>
                                    <span className="info-value">{selectedUser.dateOfBirth || "Chưa cập nhật"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Giới tính</span>
                                    <span className="info-value">{selectedUser.gender || "Chưa cập nhật"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Ngày tạo</span>
                                    <span className="info-value">
                                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : "Không có"}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Cập nhật lần cuối</span>
                                    <span className="info-value">
                                        {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('vi-VN') : "Không có"}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="cancel-btn" 
                                    onClick={() => setShowUserModal(false)}
                                >
                                    Đóng
                                </button>
                                {selectedUser.status === "blocked" ? (
                                    <button 
                                        className="submit-btn" 
                                        onClick={() => {
                                            handleUnblockUser(selectedUser.id);
                                            setShowUserModal(false);
                                        }}
                                    >
                                        <Unlock size={16} />
                                        Mở khóa người dùng
                                    </button>
                                ) : (
                                    <button 
                                        className="danger-btn" 
                                        onClick={() => {
                                            handleBlockUser(selectedUser.id);
                                            setShowUserModal(false);
                                        }}
                                    >
                                        <Lock size={16} />
                                        Khóa người dùng
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersContent;
