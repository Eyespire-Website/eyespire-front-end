import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Plus, X, AlertCircle } from 'lucide-react';
import '../styles/staff.css';
import staffService, { getAvailablePositions } from '../../../../services/staffService';
import emailService from '../../../../services/emailService';
import specialtyService from '../../../../services/specialtyService';
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
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' hoặc 'doctor'
  const [specialties, setSpecialties] = useState([]); // Danh sách chuyên khoa
  const [newStaff, setNewStaff] = useState({
    id: '',
    name: '',
    position: activeTab === 'doctor' ? 'DOCTOR' : 'RECEPTIONIST',
    email: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0], 
    // Thông tin chuyên môn của bác sĩ
    doctorInfo: {
      specialization: '',
      qualification: '',
      experience: '',
      description: '',
      specialtyId: ''
    }
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

  // Lọc danh sách chức vụ theo tab hiện tại
  const filteredPositions = positions.filter(position => {
    if (activeTab === 'doctor') {
      return position === 'DOCTOR';
    } else {
      return position === 'RECEPTIONIST' || position === 'STORE_MANAGER';
    }
  });

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

  // Lấy danh sách chuyên khoa từ API
  const fetchSpecialties = async () => {
    try {
      const data = await specialtyService.getAllSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", err);
      // Nếu API chưa được triển khai, sử dụng dữ liệu mẫu
      const initialSpecialties = [
        { id: 1, name: 'Nhãn khoa' },
        { id: 2, name: 'Giác mạc' },
        { id: 3, name: 'Đục thủy tinh thể' },
        { id: 4, name: 'Võng mạc' }
      ];
      setSpecialties(initialSpecialties);
    }
  };

  // Gọi API khi component được mount
  useEffect(() => {
    fetchStaffData();
    fetchSpecialties();
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
      position: activeTab === 'doctor' ? 'DOCTOR' : 'RECEPTIONIST',
      email: '',
      phone: '',
      startDate: new Date().toISOString().split('T')[0], 
      doctorInfo: {
        specialization: '',
        qualification: '',
        experience: '',
        description: '',
        specialtyId: ''
      }
    });
    setValidationErrors([]);
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditStaff = async (staff) => {
    try {
      // Lấy thông tin chi tiết của nhân viên từ API
      const staffDetail = await staffService.getStaffById(staff.id);
      
      // Đảm bảo startDate luôn có giá trị
      const formattedStaff = {
        ...staffDetail,
        startDate: staffDetail.startDate || new Date().toISOString().split('T')[0],
        // Đảm bảo doctorInfo luôn tồn tại
        doctorInfo: staffDetail.doctorInfo || {
          specialization: '',
          qualification: '',
          experience: '',
          description: '',
          specialtyId: ''
        }
      };
      
      setNewStaff(formattedStaff);
      setValidationErrors([]);
      setEditMode(true);
      setShowAddModal(true);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết nhân viên:", error);
      toast.error("Không thể lấy thông tin chi tiết nhân viên");
    }
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
    
    // Xử lý thông tin bác sĩ
    if (name.startsWith('doctor.')) {
      const doctorField = name.split('.')[1];
      setNewStaff(prev => ({
        ...prev,
        doctorInfo: {
          ...prev.doctorInfo,
          [doctorField]: value
        }
      }));
    } else {
      setNewStaff(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const dataToSend = { ...newStaff };
      
      // Loại bỏ ID khi thêm mới
      if (!editMode) {
        delete dataToSend.id;
      }
      
      // Tách thông tin bác sĩ ra khỏi dữ liệu gửi đi nếu không phải là bác sĩ
      if (dataToSend.position !== 'DOCTOR') {
        delete dataToSend.doctorInfo;
      }

      const result = editMode
        ? await staffService.updateStaff(dataToSend)
        : await staffService.createStaff(dataToSend);

      if (result) {
        toast.success(`${editMode ? 'Cập nhật' : 'Thêm'} nhân viên thành công!`);
        fetchStaffData();
        handleCloseModal();
        
        // Hiển thị thông tin đăng nhập nếu thêm mới
        if (!editMode) {
          setShowLoginInfo({
            show: true,
            username: dataToSend.email,
            password: '123456',
            email: dataToSend.email,
            name: dataToSend.name,
            sending: false
          });
        }
      }
    } catch (err) {
      console.error("Lỗi khi lưu nhân viên:", err);
      setError("Không thể lưu thông tin nhân viên. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewStaff({
      id: '',
      name: '',
      position: activeTab === 'doctor' ? 'DOCTOR' : 'RECEPTIONIST',
      email: '',
      phone: '',
      startDate: new Date().toISOString().split('T')[0], 
      doctorInfo: {
        specialization: '',
        qualification: '',
        experience: '',
        description: '',
        specialtyId: ''
      }
    });
    setValidationErrors([]);
    setEditMode(false);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedStaff(null);
  };

  // Lọc danh sách nhân viên theo từ khóa tìm kiếm, chức vụ và tab hiện tại
  const filteredStaff = staffData.filter(staff => {
    // Lọc theo từ khóa tìm kiếm
    const searchMatch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm);
    
    // Lọc theo chức vụ
    const staffPosition = staff.position || staff.role;
    const positionMatch = positionFilter === 'all' || staffPosition === positionFilter;
    
    // Lọc theo tab hiện tại
    const tabMatch = activeTab === 'doctor' 
      ? staffPosition === 'DOCTOR'
      : (staffPosition === 'RECEPTIONIST' || staffPosition === 'STORE_MANAGER');
    
    return searchMatch && positionMatch && tabMatch;
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

  // Hàm xử lý khi thay đổi tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPositionFilter('all');
  };

  // Hàm xử lý khi thay đổi chức vụ
  const handlePositionChange = (e) => {
    const { value } = e.target;
    // Nếu chức vụ là DOCTOR, đảm bảo doctorInfo được khởi tạo
    if (value === 'DOCTOR' && (!newStaff.doctorInfo || Object.keys(newStaff.doctorInfo).length === 0)) {
      setNewStaff(prev => ({
        ...prev,
        doctorInfo: {
          specialization: '',
          qualification: '',
          experience: '',
          description: '',
          specialtyId: ''
        }
      }));
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
              Thêm {activeTab === 'doctor' ? 'bác sĩ' : 'nhân viên'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="staff-tabs">
          <button 
            className={`staff-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => handleTabChange('staff')}
          >
            Nhân viên
          </button>
          <button 
            className={`staff-tab ${activeTab === 'doctor' ? 'active' : ''}`}
            onClick={() => handleTabChange('doctor')}
          >
            Bác sĩ
          </button>
        </div>

        <div className="card-content">
          <div className="staff-filter-bar">
            <div className="staff-search">
              <Search size={16} className="staff-search-icon" />
              <input
                  type="text"
                  className="staff-search-input"
                  placeholder={`Tìm kiếm ${activeTab === 'doctor' ? 'bác sĩ' : 'nhân viên'}...`}
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
                {filteredPositions.map(position => (
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
                    {activeTab === 'staff' && <th>Chức vụ</th>}
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
                        {activeTab === 'staff' && <td>{getPositionDisplayName(staff.position || staff.role)}</td>}
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
                        <td colSpan={activeTab === 'staff' ? "7" : "6"} style={{ textAlign: 'center', padding: '20px' }}>
                          Không tìm thấy {activeTab === 'doctor' ? 'bác sĩ' : 'nhân viên'} nào phù hợp với bộ lọc
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
                  <h3 className="staff-modal-title">
                    {editMode 
                      ? `Chỉnh sửa ${(newStaff.position === 'DOCTOR') ? 'bác sĩ' : 'nhân viên'}`
                      : `Thêm ${activeTab === 'doctor' ? 'bác sĩ' : 'nhân viên'} mới`}
                  </h3>
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
                            onChange={(e) => {
                              handleInputChange(e);
                              handlePositionChange(e);
                            }}
                            disabled={loading || (!editMode && activeTab === 'doctor')}
                        >
                          {(editMode ? positions : filteredPositions).map(position => (
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
                            placeholder="Nhập email nhân viên"
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
                            placeholder="Nhập số điện thoại"
                            disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Thông tin chuyên môn của bác sĩ */}
                    {newStaff.position === 'DOCTOR' && (
                      <>
                        <div className="staff-form-section">
                          <h4 className="staff-form-section-title">Thông tin chuyên môn</h4>
                        </div>
                        
                        <div className="staff-form-row">
                          <div className="staff-form-group">
                            <label className="staff-form-label">Chuyên khoa</label>
                            <select
                              className="staff-form-select"
                              name="doctor.specialtyId"
                              value={newStaff.doctorInfo.specialtyId || ''}
                              onChange={handleInputChange}
                              disabled={loading}
                            >
                              <option value="">-- Chọn chuyên khoa --</option>
                              {specialties.map(specialty => (
                                <option key={specialty.id} value={specialty.id}>
                                  {specialty.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="staff-form-group">
                            <label className="staff-form-label">Bằng cấp</label>
                            <input
                                type="text"
                                className="staff-form-input"
                                name="doctor.qualification"
                                value={newStaff.doctorInfo.qualification}
                                onChange={handleInputChange}
                                placeholder="Nhập bằng cấp"
                                disabled={loading}
                            />
                          </div>
                        </div>
                        
                        <div className="staff-form-row">
                          <div className="staff-form-group">
                            <label className="staff-form-label">Kinh nghiệm</label>
                            <input
                                type="text"
                                className="staff-form-input"
                                name="doctor.experience"
                                value={newStaff.doctorInfo.experience}
                                onChange={handleInputChange}
                                placeholder="Nhập số năm kinh nghiệm"
                                disabled={loading}
                            />
                          </div>
                        </div>
                        
                        <div className="staff-form-row">
                          <div className="staff-form-group" style={{ gridColumn: '1 / span 2' }}>
                            <label className="staff-form-label">Mô tả</label>
                            <textarea
                                className="staff-form-textarea"
                                name="doctor.description"
                                value={newStaff.doctorInfo.description}
                                onChange={handleInputChange}
                                placeholder="Nhập mô tả về bác sĩ"
                                rows={4}
                                disabled={loading}
                            />
                          </div>
                        </div>
                      </>
                    )}

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
                        <p className="staff-form-text">{getPositionDisplayName(selectedStaff.position || selectedStaff.role)}</p>
                      </div>
                      <div className="staff-form-group">
                        <label className="staff-form-label">Ngày bắt đầu</label> 
                        <p className="staff-form-text">{selectedStaff.startDate ? formatDate(selectedStaff.startDate) : 'Không có dữ liệu'}</p> 
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

                    {/* Thông tin chuyên môn của bác sĩ */}
                    {selectedStaff.position === 'DOCTOR' && (
                      <>
                        <div className="staff-form-section">
                          <h4 className="staff-form-section-title">Thông tin chuyên môn</h4>
                        </div>
                        
                        <div className="staff-form-row">
                          <div className="staff-form-group">
                            <label className="staff-form-label">Chuyên khoa</label>
                            <p className="staff-form-text">{selectedStaff.doctorInfo?.specialization || 'Không có thông tin'}</p>
                          </div>
                          <div className="staff-form-group">
                            <label className="staff-form-label">Bằng cấp</label>
                            <p className="staff-form-text">{selectedStaff.doctorInfo?.qualification || 'Không có thông tin'}</p>
                          </div>
                        </div>
                        
                        <div className="staff-form-row">
                          <div className="staff-form-group">
                            <label className="staff-form-label">Kinh nghiệm</label>
                            <p className="staff-form-text">{selectedStaff.doctorInfo?.experience || 'Không có thông tin'}</p>
                          </div>
                        </div>
                        
                        <div className="staff-form-row">
                          <div className="staff-form-group" style={{ gridColumn: '1 / span 2' }}>
                            <label className="staff-form-label">Mô tả</label>
                            <p className="staff-form-text">{selectedStaff.doctorInfo?.description || 'Không có thông tin'}</p>
                          </div>
                        </div>
                      </>
                    )}
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