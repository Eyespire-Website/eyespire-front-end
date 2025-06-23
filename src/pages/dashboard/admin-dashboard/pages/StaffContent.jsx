import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Plus, X, AlertCircle } from 'lucide-react';
import '../styles/staff.css';
import staffService, { getAvailablePositions } from '../../../../services/staffService';
import emailService from '../../../../services/emailService';
import { useNavigate } from 'react-router-dom';

// Giả lập thư viện thông báo
const toast = {
  success: (msg) => console.log(`Success: ${msg}`),
  error: (msg) => console.log(`Error: ${msg}`),
};

const StaffContent = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [newStaff, setNewStaff] = useState({
    id: '',
    name: '',
    position: 'DOCTOR',
    email: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0], 
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showLoginInfo, setShowLoginInfo] = useState({ 
    show: false, 
    username: '', 
    password: '',
    email: '',
    name: '',
    sending: false
  });

  // Lấy danh sách chức vụ từ UserRole enum (ngoại trừ ADMIN và PATIENT)
  const positions = getAvailablePositions();

  // Hàm chuyển đổi mã chức vụ sang tên hiển thị
  const getPositionDisplayName = (positionCode) => {
    switch (positionCode) {
      case 'DOCTOR':
        return 'Bác sĩ';
      case 'RECEPTIONIST':
        return 'Lễ tân';
      case 'STORE_MANAGER':
        return 'Quản lý cửa hàng';
      default:
        return 'Không xác định';
    }
  };

  // Lấy danh sách nhân viên từ API
  const fetchStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffService.getAllStaff();
      setStaffData(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách nhân viên:", err);
      setError("Không thể tải danh sách nhân viên. Vui lòng thử lại sau.");
      // Nếu API chưa được triển khai, sử dụng dữ liệu mẫu
      const initialData = [
        {
          id: 'NV001',
          name: 'Nguyễn Văn An',
          position: 'DOCTOR',
          email: 'an.nguyen@eyespire.com',
          phone: '0901234567',
          startDate: '2023-01-15', 
        },
        {
          id: 'NV002',
          name: 'Trần Thị Bình',
          position: 'RECEPTIONIST',
          email: 'binh.tran@eyespire.com',
          phone: '0912345678',
          startDate: '2023-02-20', 
        },
        {
          id: 'NV003',
          name: 'Lê Văn Cường',
          position: 'STORE_MANAGER',
          email: 'cuong.le@eyespire.com',
          phone: '0923456789',
          startDate: '2023-03-10', 
        },
      ];
      setStaffData(initialData);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component được mount
  useEffect(() => {
    fetchStaffData();
  }, []);

  // Hàm định dạng ngày từ YYYY-MM-DD sang DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const validateForm = () => {
    const { isValid, errors } = staffService.validateStaffData(newStaff);
    setValidationErrors(errors);
    return isValid;
  };

  const handleAddStaff = () => {
    setNewStaff({
      name: '',
      position: 'DOCTOR',
      email: '',
      phone: '',
      startDate: new Date().toISOString().split('T')[0], 
    });
    setValidationErrors([]);
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditStaff = (staff) => {
    // Đảm bảo startDate luôn có giá trị
    const formattedStaff = {
      ...staff,
      startDate: staff.startDate || new Date().toISOString().split('T')[0]
    };
    setNewStaff(formattedStaff);
    setValidationErrors([]);
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
    
    setLoading(true);
    try {
      await staffService.deleteStaff(id);
      setStaffData(staffData.filter(staff => staff.id !== id));
      toast.success('Xóa nhân viên thành công');
    } catch (err) {
      console.error("Lỗi khi xóa nhân viên:", err);
      toast.error('Xóa nhân viên thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStaff = async (staff) => {
    setLoading(true);
    try {
      // Lấy thông tin chi tiết nhân viên từ API
      const staffDetail = await staffService.getStaffById(staff.id);
      setSelectedStaff(staffDetail);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin chi tiết nhân viên:", err);
      // Nếu API chưa được triển khai, sử dụng dữ liệu từ danh sách
      setSelectedStaff(staff);
    } finally {
      setLoading(false);
      setShowViewModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formattedData = staffService.formatStaffData(newStaff);
      
      if (editMode) {
        // Cập nhật nhân viên
        const updatedStaff = await staffService.updateStaff(formattedData.id, formattedData);
        setStaffData(staffData.map(staff =>
          staff.id === updatedStaff.id ? updatedStaff : staff
        ));
        toast.success('Cập nhật nhân viên thành công');
      } else {
        // Thêm nhân viên mới - loại bỏ ID khi gửi lên server
        const dataToSend = { ...formattedData };
        delete dataToSend.id; // Loại bỏ ID khi thêm nhân viên mới
        
        const createdStaff = await staffService.createStaff(dataToSend);
        setStaffData([...staffData, createdStaff]);
        toast.success('Thêm nhân viên thành công');
        
        // Hiển thị thông tin đăng nhập cho nhân viên mới
        setShowLoginInfo({
          show: true,
          username: formattedData.username,
          password: formattedData.password,
          email: formattedData.email,
          name: formattedData.name,
          sending: false
        });
      }
      
      setShowAddModal(false);
    } catch (err) {
      console.error("Lỗi khi lưu nhân viên:", err);
      toast.error('Lưu thông tin nhân viên thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewStaff({
      id: '',
      name: '',
      position: 'DOCTOR',
      email: '',
      phone: '',
      startDate: new Date().toISOString().split('T')[0], 
    });
    setValidationErrors([]);
    setEditMode(false);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedStaff(null);
  };

  // Lọc danh sách nhân viên theo từ khóa tìm kiếm và chức vụ
  const filteredStaff = staffData.filter(staff => {
    // Lọc theo từ khóa tìm kiếm
    const searchMatch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm);
    
    // Lọc theo chức vụ
    const staffPosition = staff.position || staff.role;
    const positionMatch = positionFilter === 'all' || staffPosition === positionFilter;
    
    return searchMatch && positionMatch;
  });

  // Hàm xử lý khi thay đổi bộ lọc chức vụ
  const handlePositionFilterChange = (e) => {
    setPositionFilter(e.target.value);
  };

  // Hàm xử lý khi thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Hàm gửi thông tin đăng nhập qua email
  const handleSendLoginEmail = async () => {
    if (!showLoginInfo.email) {
      toast.error('Không có địa chỉ email để gửi thông tin đăng nhập');
      return;
    }
    
    setShowLoginInfo(prev => ({ ...prev, sending: true }));
    
    try {
      const result = await emailService.sendLoginCredentials({
        email: showLoginInfo.email,
        name: showLoginInfo.name,
        username: showLoginInfo.username,
        password: showLoginInfo.password
      });
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      toast.error('Gửi email thất bại. Vui lòng thử lại sau.');
    } finally {
      setShowLoginInfo(prev => ({ ...prev, sending: false }));
    }
  };

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
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  disabled={loading}
              >
                <option value="all">Tất cả chức vụ</option>
                {positions.map(position => (
                    <option key={position} value={position}>{getPositionDisplayName(position)}</option>
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
                    <th>Ngày bắt đầu</th> 
                    <th>Thao tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredStaff.length > 0 ? (
                      filteredStaff.map(staff => (
                        <tr key={staff.id}>
                        <td>{staff.id}</td>
                        <td>{staff.name}</td>
                        <td>{getPositionDisplayName(staff.position || staff.role)}</td>
                        <td>{staff.email}</td>
                        <td>{staff.phone}</td>
                        <td>{formatDate(staff.startDate)}</td> 
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
                  {validationErrors.length > 0 && (
                    <div className="staff-validation-errors">
                      <div className="error-header">
                        <AlertCircle size={16} />
                        <span>Vui lòng sửa các lỗi sau:</span>
                      </div>
                      <ul>
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="staff-form">
                    <div className="staff-form-row">
                      {editMode && (
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
                      )}
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
                              <option key={position} value={position}>{getPositionDisplayName(position)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Ngày bắt đầu</label> 
                        <input
                            type="date"
                            className="staff-form-input"
                            name="startDate"
                            value={newStaff.startDate}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
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
                        <p className="staff-form-text">{getPositionDisplayName(selectedStaff.position)}</p>
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Ngày bắt đầu</label> 
                        <p className="staff-form-text">{formatDate(selectedStaff.startDate)}</p> 
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

        {/* Modal hiển thị thông tin đăng nhập */}
        {showLoginInfo.show && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2>Thông tin đăng nhập</h2>
                <button className="close-button" onClick={() => setShowLoginInfo({ show: false, username: '', password: '', email: '', name: '', sending: false })}>×</button>
              </div>
              <div className="modal-body">
                <p>Nhân viên mới có thể đăng nhập với thông tin sau:</p>
                <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', margin: '10px 0', border: '1px solid #ddd' }}>
                  <p><strong>Tên đăng nhập:</strong> {showLoginInfo.username}</p>
                  <p><strong>Mật khẩu:</strong> {showLoginInfo.password}</p>
                </div>
                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#ff6b6b' }}><strong>Lưu ý:</strong></p>
                  <ul style={{ color: '#555', paddingLeft: '20px' }}>
                    <li>Hãy cung cấp thông tin này cho nhân viên mới.</li>
                    <li>Nhân viên nên đổi mật khẩu sau lần đăng nhập đầu tiên.</li>
                    <li>Nếu quên mật khẩu, nhân viên có thể sử dụng chức năng "Quên mật khẩu" với email đã đăng ký.</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  className="staff-button secondary"
                  onClick={handleSendLoginEmail}
                  disabled={showLoginInfo.sending}
                >
                  {showLoginInfo.sending ? 'Đang gửi...' : 'Gửi qua email'}
                </button>
                <button 
                  className="staff-button primary"
                  onClick={() => setShowLoginInfo({ show: false, username: '', password: '', email: '', name: '', sending: false })}
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