import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Plus, CheckCircle, Clock, AlertTriangle, Star, X } from 'lucide-react';
import '../styles/services.css';

// Giả lập thư viện thông báo
const toast = {
  success: (msg) => console.log(`Success: ${msg}`),
  error: (msg) => console.log(`Error: ${msg}`),
};

const ServicesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [newService, setNewService] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    duration: 60,
    status: 'active',
    category: 'Khám tổng quát',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Khám tổng quát', 'Điều trị', 'Tư vấn', 'Phẫu thuật', 'Theo dõi'];

  // Giả lập API với dữ liệu ban đầu
  useEffect(() => {
    setLoading(true);
    const initialData = [
      {
        id: 'DV001',
        name: 'Khám tổng quát mắt',
        description: 'Kiểm tra sức khỏe mắt toàn diện',
        price: '500,000',
        duration: 60,
        status: 'active',
        category: 'Khám tổng quát',
      },
      {
        id: 'DV002',
        name: 'Điều trị bệnh viêm giác mạc',
        description: 'Chẩn đoán và điều trị các bệnh viêm giác mạc theo phương pháp tiên tiến',
        price: '800,000',
        duration: 90,
        status: 'active',
        category: 'Điều trị',
      },
      {
        id: 'DV003',
        name: 'Tư vấn phẫu thuật',
        description: 'Tư vấn các phương pháp phẫu thuật phù hợp với tình trạng bệnh',
        price: '1,200,000',
        duration: 120,
        status: 'active',
        category: 'Tư vấn',
      },
    ];
    setTimeout(() => {
      setServicesData(initialData);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'featured': return 'Nổi bật';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} />;
      case 'inactive': return <AlertTriangle size={14} />;
      case 'featured': return <Star size={14} />;
      default: return null;
    }
  };

  const validateForm = () => {
    if (!newService.name.trim()) return 'Tên dịch vụ là bắt buộc';
    if (!newService.description.trim()) return 'Mô tả là bắt buộc';
    if (!newService.price || !/^\d{1,3}(,\d{3})*$/.test(newService.price)) return 'Giá không hợp lệ';
    if (newService.duration < 15) return 'Thời gian phải lớn hơn hoặc bằng 15 phút';
    return null;
  };

  const handleAddService = () => {
    const newId = `DV${(servicesData.length + 1).toString().padStart(3, '0')}`;
    setNewService({
      id: newId,
      name: '',
      description: '',
      price: '',
      duration: 60,
      status: 'active',
      category: 'Khám tổng quát',
    });
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditService = (service) => {
    setNewService({ ...service });
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleDeleteService = (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    setLoading(true);
    setTimeout(() => {
      setServicesData(servicesData.filter(service => service.id !== id));
      setLoading(false);
      toast.success('Xóa dịch vụ thành công');
    }, 500);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setShowViewModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatPrice = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return '';
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNewService(prev => ({
      ...prev,
      price: formatPrice(value),
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
        setServicesData(servicesData.map(service =>
            service.id === newService.id ? newService : service
        ));
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        setServicesData([...servicesData, newService]);
        toast.success('Thêm dịch vụ thành công');
      }
      setShowAddModal(false);
      setLoading(false);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewService({
      id: '',
      name: '',
      description: '',
      price: '',
      duration: 60,
      status: 'active',
      category: 'Khám tổng quát',
    });
    setEditMode(false);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedService(null);
  };

  const filteredServices = servicesData.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (error) return <div className="error-message">{error}</div>;

  return (
      <div className="card services-container">
        <div className="card-hdr">
          <div className="card-hdr-content">
            <h3 className="card-title">Danh sách dịch vụ</h3>
            <button className="services-add-btn" onClick={handleAddService} disabled={loading}>
              <Plus size={16} />
              Thêm dịch vụ
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="services-filter-bar">
            <div className="services-search">
              <Search size={16} className="services-search-icon" />
              <input
                  type="text"
                  className="services-search-input"
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
              />
            </div>
            <div className="services-filters">
              <select
                  className="services-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={loading}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="featured">Nổi bật</option>
              </select>
              <select
                  className="services-filter-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  disabled={loading}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tbl-container services-table-container">
            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : (
                <table className="tbl services-table">
                  <thead>
                  <tr>
                    <th>Mã DV</th>
                    <th>Tên dịch vụ</th>
                    <th>Mô tả</th>
                    <th>Giá</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredServices.length > 0 ? (
                      filteredServices.map(service => (
                          <tr key={service.id}>
                            <td>{service.id}</td>
                            <td>{service.name}</td>
                            <td>{service.description}</td>
                            <td className="service-price">₫{service.price}</td>
                            <td>
                              <div className="service-duration">
                                <Clock size={14} />
                                {service.duration} phút
                              </div>
                            </td>
                            <td>
                        <span className={`service-badge ${service.status}`}>
                          {getStatusIcon(service.status)}
                          {getStatusLabel(service.status)}
                        </span>
                            </td>
                            <td>
                              <div className="service-actions">
                                <button
                                    className="btn btn-info service-action-btn"
                                    onClick={() => handleViewService(service)}
                                    aria-label="Xem chi tiết dịch vụ"
                                    disabled={loading}
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                    className="btn btn-success service-action-btn"
                                    onClick={() => handleEditService(service)}
                                    aria-label="Chỉnh sửa dịch vụ"
                                    disabled={loading}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                    className="btn btn-warning service-action-btn"
                                    onClick={() => handleDeleteService(service.id)}
                                    aria-label="Xóa dịch vụ"
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
                          Không tìm thấy dịch vụ nào phù hợp với bộ lọc
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
            )}
          </div>
        </div>

        {/* Modal thêm/chỉnh sửa dịch vụ */}
        {showAddModal && (
            <div className="services-modal-overlay" role="dialog" aria-modal="true">
              <div className="services-modal">
                <div className="services-modal-header">
                  <h3 className="services-modal-title">{editMode ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                  <button
                      className="services-modal-close"
                      onClick={handleCloseModal}
                      aria-label="Đóng modal"
                      disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="services-modal-body">
                  <div className="services-form">
                    <div className="services-form-row">
                      <div className="services-form-group">
                        <label className="services-form-label">Mã dịch vụ</label>
                        <input
                            type="text"
                            className="services-form-input"
                            name="id"
                            value={newService.id}
                            readOnly
                        />
                      </div>
                      <div className="services-form-group">
                        <label className="services-form-label">Tên dịch vụ</label>
                        <input
                            type="text"
                            className="services-form-input"
                            name="name"
                            value={newService.name}
                            onChange={handleInputChange}
                            placeholder="Nhập tên dịch vụ"
                            disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="services-form-group">
                      <label className="services-form-label">Mô tả</label>
                      <textarea
                          className="services-form-textarea"
                          name="description"
                          value={newService.description}
                          onChange={handleInputChange}
                          placeholder="Mô tả chi tiết về dịch vụ"
                          disabled={loading}
                      />
                    </div>
                    <div className="services-form-row">
                      <div className="services-form-group">
                        <label className="services-form-label">Giá (₫)</label>
                        <input
                            type="text"
                            className="services-form-input"
                            name="price"
                            value={newService.price}
                            onChange={handlePriceChange}
                            placeholder="VD: 500,000"
                            disabled={loading}
                        />
                      </div>
                      <div className="services-form-group">
                        <label className="services-form-label">Thời gian (phút)</label>
                        <input
                            type="number"
                            className="services-form-input"
                            name="duration"
                            value={newService.duration}
                            onChange={handleInputChange}
                            min="15"
                            step="15"
                            disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="services-form-row">
                      <div className="services-form-group">
                        <label className="services-form-label">Danh mục</label>
                        <select
                            className="services-form-select"
                            name="category"
                            value={newService.category}
                            onChange={handleInputChange}
                            disabled={loading}
                        >
                          {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div className="services-form-group">
                        <label className="services-form-label">Trạng thái</label>
                        <select
                            className="services-form-select"
                            name="status"
                            value={newService.status}
                            onChange={handleInputChange}
                            disabled={loading}
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Không hoạt động</option>
                          <option value="featured">Nổi bật</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="services-modal-footer">
                  <button
                      className="services-modal-cancel"
                      onClick={handleCloseModal}
                      disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                      className="services-modal-save"
                      onClick={handleSubmit}
                      disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Modal xem chi tiết dịch vụ */}
        {showViewModal && selectedService && (
            <div className="services-modal-overlay" role="dialog" aria-modal="true">
              <div className="services-modal">
                <div className="services-modal-header">
                  <h3 className="services-modal-title">Chi tiết dịch vụ</h3>
                  <button
                      className="services-modal-close"
                      onClick={handleCloseViewModal}
                      aria-label="Đóng modal"
                      disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="services-modal-body">
                  <div className="services-form">
                    <div className="services-form-group">
                      <label className="services-form-label">Mã dịch vụ</label>
                      <p className="services-form-text">{selectedService.id}</p>
                    </div>
                    <div className="services-form-group">
                      <label className="services-form-label">Tên dịch vụ</label>
                      <p className="services-form-text">{selectedService.name}</p>
                    </div>
                    <div className="services-form-group">
                      <label className="services-form-label">Mô tả</label>
                      <p className="services-form-text">{selectedService.description}</p>
                    </div>
                    <div className="services-form-row">
                      <div className="services-form-group">
                        <label className="services-form-label">Giá (₫)</label>
                        <p className="services-form-text">₫{selectedService.price}</p>
                      </div>
                      <div className="services-form-group">
                        <label className="services-form-label">Thời gian (phút)</label>
                        <p className="services-form-text">{selectedService.duration} phút</p>
                      </div>
                    </div>
                    <div className="services-form-row">
                      <div className="services-form-group">
                        <label className="services-form-label">Danh mục</label>
                        <p className="services-form-text">{selectedService.category}</p>
                      </div>
                      <div className="services-form-group">
                        <label className="services-form-label">Trạng thái</label>
                        <p className="services-form-text">
                      <span className={`service-badge ${selectedService.status}`}>
                        {getStatusIcon(selectedService.status)}
                        {getStatusLabel(selectedService.status)}
                      </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="services-modal-footer">
                  <button
                      className="services-modal-cancel"
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

export default ServicesContent;