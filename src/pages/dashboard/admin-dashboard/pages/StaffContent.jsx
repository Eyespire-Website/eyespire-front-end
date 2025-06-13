import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Plus, X } from 'lucide-react';
import '../styles/staff.css';

// Giả lập thư viện thông báo
const toast = {
  success: (msg) => console.log(`Success: ${msg}`),
  error: (msg) => console.log(`Error: ${msg}`),
};

const StaffContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [newStaff, setNewStaff] = useState({
    id: '',
    name: '',
    position: 'Bác sĩ',
    email: '',
    phone: '',
    status: 'active',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const positions = ['Bác sĩ', 'Y tá', 'Dược sĩ', 'Lễ tân', 'Quản lý'];

  // Giả lập API với dữ liệu ban đầu
  useEffect(() => {
    setLoading(true);
    const initialData = [
      {
        id: 'NV001',
        name: 'Nguyễn Văn An',
        position: 'Bác sĩ',
        email: 'an.nguyen@eyespire.com',
        phone: '0901234567',
        status: 'active',
      },
      {
        id: 'NV002',
        name: 'Trần Thị Bình',
        position: 'Y tá',
        email: 'binh.tran@eyespire.com',
        phone: '0912345678',
        status: 'active',
      },
      {
        id: 'NV003',
        name: 'Lê Văn Cường',
        position: 'Dược sĩ',
        email: 'cuong.le@eyespire.com',
        phone: '0923456789',
        status: 'inactive',
      },
    ];
    setTimeout(() => {
      setStaffData(initialData);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Nghỉ phép';
      case 'suspended': return 'Tạm ngưng';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} />;
      case 'inactive': return <Clock size={14} />;
      case 'suspended': return <AlertTriangle size={14} />;
      default: return null;
    }
  };

  const validateForm = () => {
    if (!newStaff.name.trim()) return 'Họ tên là bắt buộc';
    if (!newStaff.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaff.email)) return 'Email không hợp lệ';
    if (!newStaff.phone || !/^\d{10}$/.test(newStaff.phone.replace(/\D/g, ''))) return 'Số điện thoại phải có 10 chữ số';
    return null;
  };

  const handleAddStaff = () => {
    const newId = `NV${(staffData.length + 1).toString().padStart(3, '0')}`;
    setNewStaff({
      id: newId,
      name: '',
      position: 'Bác sĩ',
      email: '',
      phone: '',
      status: 'active',
    });
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditStaff = (staff) => {
    setNewStaff({ ...staff });
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleDeleteStaff = (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
    setLoading(true);
    setTimeout(() => {
      setStaffData(staffData.filter(staff => staff.id !== id));
      setLoading(false);
      toast.success('Xóa nhân viên thành công');
    }, 500);
  };

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    setShowViewModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (editMode) {
        setStaffData(staffData.map(staff =>
            staff.id === newStaff.id ? newStaff : staff
        ));
        toast.success('Cập nhật nhân viên thành công');
      } else {
        setStaffData([...staffData, newStaff]);
        toast.success('Thêm nhân viên thành công');
      }
      setShowAddModal(false);
      setLoading(false);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewStaff({
      id: '',
      name: '',
      position: 'Bác sĩ',
      email: '',
      phone: '',
      status: 'active',
    });
    setEditMode(false);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedStaff(null);
  };

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || staff.position === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  if (error) return <div className="error-message">Lỗi: {error}</div>;

  return (
      <div className="card staff-container">
        <div className="card-hdr">
          <div className="card-hdr-content">
            <h3 className="card-title">Danh sách nhân viên</h3>
            <button className="staff-add-btn" onClick={handleAddStaff} disabled={loading}>
              <Plus size={16} />
              Thêm nhân viên
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="staff-filter-bar">
            <div className="staff-search">
              <Search size={16} className="staff-search-icon" />
              <input
                  type="text"
                  className="staff-search-input"
                  placeholder="Tìm kiếm theo tên, mã NV hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
              />
            </div>
            <div className="staff-filters">
              <select
                  className="staff-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={loading}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Nghỉ phép</option>
                <option value="suspended">Tạm ngưng</option>
              </select>
              <select
                  className="staff-filter-select"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  disabled={loading}
              >
                <option value="all">Tất cả chức vụ</option>
                {positions.map(position => (
                    <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tbl-container staff-table-container">
            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : (
                <table className="tbl">
                  <thead>
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ tên</th>
                    <th>Chức vụ</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredStaff.length > 0 ? (
                      filteredStaff.map(staff => (
                          <tr key={staff.id}>
                            <td>{staff.id}</td>
                            <td>{staff.name}</td>
                            <td>{staff.position}</td>
                            <td>{staff.email}</td>
                            <td>{staff.phone}</td>
                            <td>
                        <span className={`staff-badge ${staff.status}`}>
                          {getStatusIcon(staff.status)}
                          {getStatusLabel(staff.status)}
                        </span>
                            </td>
                            <td>
                              <div className="staff-actions">
                                <button
                                    className="btn btn-info staff-action-btn"
                                    onClick={() => handleViewStaff(staff)}
                                    aria-label="Xem chi tiết nhân viên"
                                    disabled={loading}
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                    className="btn btn-success staff-action-btn"
                                    onClick={() => handleEditStaff(staff)}
                                    aria-label="Chỉnh sửa nhân viên"
                                    disabled={loading}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                    className="btn btn-warning staff-action-btn"
                                    onClick={() => handleDeleteStaff(staff.id)}
                                    aria-label="Xóa nhân viên"
                                    disabled={loading}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                          Không tìm thấy nhân viên nào phù hợp với bộ lọc
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
            )}
          </div>
        </div>

        {/* Modal thêm/chỉnh sửa nhân viên */}
        {showAddModal && (
            <div className="staff-modal-overlay" role="dialog" aria-modal="true">
              <div className="staff-modal">
                <div className="staff-modal-header">
                  <h3 className="staff-modal-title">{editMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
                  <button
                      className="staff-modal-close"
                      onClick={handleCloseModal}
                      aria-label="Đóng modal"
                      disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="staff-modal-body">
                  <div className="staff-form">
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label className="staff-form-label">Mã nhân viên</label>
                        <input
                            type="text"
                            className="staff-form-input"
                            name="id"
                            value={newStaff.id}
                            readOnly
                        />
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Họ tên</label>
                        <input
                            type="text"
                            className="staff-form-input"
                            name="name"
                            value={newStaff.name}
                            onChange={handleInputChange}
                            placeholder="Nhập họ tên nhân viên"
                            disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label className="staff-form-label">Chức vụ</label>
                        <select
                            className="staff-form-select"
                            name="position"
                            value={newStaff.position}
                            onChange={handleInputChange}
                            disabled={loading}
                        >
                          {positions.map(position => (
                              <option key={position} value={position}>{position}</option>
                          ))}
                        </select>
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Trạng thái</label>
                        <select
                            className="staff-form-select"
                            name="status"
                            value={newStaff.status}
                            onChange={handleInputChange}
                            disabled={loading}
                        >
                          <option value="active">Đang hoạt động</option>
                          <option value="inactive">Nghỉ phép</option>
                          <option value="suspended">Tạm ngưng</option>
                        </select>
                      </div>
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label className="staff-form-label">Email</label>
                        <input
                            type="email"
                            className="staff-form-input"
                            name="email"
                            value={newStaff.email}
                            onChange={handleInputChange}
                            placeholder="example@eyespire.com"
                            disabled={loading}
                        />
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Số điện thoại</label>
                        <input
                            type="tel"
                            className="staff-form-input"
                            name="phone"
                            value={newStaff.phone}
                            onChange={handleInputChange}
                            placeholder="0901234567"
                            disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="staff-modal-footer">
                  <button
                      className="staff-modal-cancel"
                      onClick={handleCloseModal}
                      disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                      className="staff-modal-save"
                      onClick={handleSubmit}
                      disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Modal xem chi tiết nhân viên */}
        {showViewModal && selectedStaff && (
            <div className="staff-modal-overlay" role="dialog" aria-modal="true">
              <div className="staff-modal">
                <div className="staff-modal-header">
                  <h3 className="staff-modal-title">Chi tiết nhân viên</h3>
                  <button
                      className="staff-modal-close"
                      onClick={handleCloseViewModal}
                      aria-label="Đóng modal"
                      disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="staff-modal-body">
                  <div className="staff-form">
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label className="staff-form-label">Mã nhân viên</label>
                        <p className="staff-form-text">{selectedStaff.id}</p>
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Họ tên</label>
                        <p className="staff-form-text">{selectedStaff.name}</p>
                      </div>
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label className="staff-form-label">Chức vụ</label>
                        <p className="staff-form-text">{selectedStaff.position}</p>
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Trạng thái</label>
                        <p className="staff-form-text">
                      <span className={`staff-badge ${selectedStaff.status}`}>
                        {getStatusIcon(selectedStaff.status)}
                        {getStatusLabel(selectedStaff.status)}
                      </span>
                        </p>
                      </div>
                    </div>
                    <div className="staff-form-row">
                      <div className="staff-form-group">
                        <label className="staff-form-label">Email</label>
                        <p className="staff-form-text">{selectedStaff.email}</p>
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Số điện thoại</label>
                        <p className="staff-form-text">{selectedStaff.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="staff-modal-footer">
                  <button
                      className="staff-modal-cancel"
                      onClick={handleCloseViewModal}
                      disabled={loading}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default StaffContent;