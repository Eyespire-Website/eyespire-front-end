import { useState, useEffect, useRef } from 'react';
import { Search, Edit, Trash2, Eye, Plus, CheckCircle, Clock, AlertTriangle, Star, X, Upload } from 'lucide-react';
import '../styles/services.css';
import medicalServiceService from '../../../../services/medicalServiceService';

// Giả lập thư viện thông báo
const toast = {
  success: (msg) => console.log(`Success: ${msg}`),
  error: (msg) => console.log(`Error: ${msg}`),
};

const ServicesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
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
    imageUrl: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Lấy danh sách dịch vụ từ API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await medicalServiceService.getAllMedicalServices();
        
        // Xử lý URL hình ảnh: thêm URL cơ sở nếu URL là đường dẫn tương đối
        const processedData = data.map(service => {
          if (service.imageUrl && service.imageUrl.startsWith('/')) {
            return {
              ...service,
              imageUrl: `http://localhost:8080${service.imageUrl}`
            };
          }
          return service;
        });
        
        // Chuyển đổi định dạng dữ liệu từ API để hiển thị
        const formattedData = processedData.map(service => ({
          id: service.id.toString(),
          name: service.name,
          description: service.description,
          imageUrl: service.imageUrl,
          price: service.price.toLocaleString('vi-VN'),
          duration: service.duration,
        }));
        setServicesData(formattedData);
      } catch (error) {
        console.error('Lỗi khi tải danh sách dịch vụ:', error);
        setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const validateForm = () => {
    if (!newService.name.trim()) return 'Tên dịch vụ là bắt buộc';
    if (!newService.description.trim()) return 'Mô tả là bắt buộc';
    if (!newService.price || !/^\d{1,3}(,\d{3})*$/.test(newService.price)) return 'Giá không hợp lệ';
    if (newService.duration < 15) return 'Thời gian phải lớn hơn hoặc bằng 15 phút';
    return null;
  };

  const handleAddService = () => {
    // ID sẽ được tạo bởi backend
    setNewService({
      id: '',
      name: '',
      description: '',
      price: '',
      duration: 60,
      imageUrl: '',
    });
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditService = (service) => {
    setNewService({ ...service });
    setPreviewImage(service.imageUrl); // Hiển thị ảnh hiện tại nếu có
    setSelectedImageFile(null); // Reset file ảnh đã chọn
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    
    setLoading(true);
    try {
      await medicalServiceService.deleteMedicalService(id);
      setServicesData(servicesData.filter(service => service.id !== id));
      toast.success('Xóa dịch vụ thành công');
    } catch (err) {
      console.error('Lỗi khi xóa dịch vụ:', err);
      toast.error('Không thể xóa dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setShowViewModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      return;
    }

    // Kiểm tra loại file
    if (!file.type.match('image.*')) {
      toast.error('Vui lòng chọn file hình ảnh.');
      return;
    }

    // Lưu file để sau này upload
    setSelectedImageFile(file);
    
    // Tạo URL tạm thởi để hiển thị preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setSelectedImageFile(null);
    setNewService({
      ...newService,
      imageUrl: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatPrice = (value) => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^\d]/g, '');
    // Định dạng số với dấu phẩy ngăn cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    setNewService({
      ...newService,
      price: formatPrice(value),
    });
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      // Chuyển đổi dữ liệu để gửi lên API
      const serviceData = {
        name: newService.name,
        description: newService.description,
        price: parseInt(newService.price.replace(/,/g, ''), 10),
        duration: parseInt(newService.duration, 10),
        imageUrl: newService.imageUrl, // Giữ lại URL ảnh hiện tại nếu không có file mới
      };
      
      let result;
      if (editMode) {
        // Cập nhật dịch vụ với file ảnh (nếu có)
        result = await medicalServiceService.updateMedicalService(
          newService.id, 
          serviceData, 
          selectedImageFile
        );
        
        // Xử lý URL ảnh tương đối trước khi cập nhật vào state
        let processedResult = { ...result };
        if (processedResult.imageUrl && processedResult.imageUrl.startsWith('/')) {
          processedResult.imageUrl = `http://localhost:8080${processedResult.imageUrl}`;
        }
        
        setServicesData(servicesData.map(service =>
          service.id === newService.id ? {
            ...processedResult,
            id: processedResult.id.toString(),
            price: processedResult.price.toLocaleString('vi-VN'),
          } : service
        ));
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        // Tạo dịch vụ mới với file ảnh (nếu có)
        result = await medicalServiceService.createMedicalService(
          serviceData, 
          selectedImageFile
        );
        
        // Xử lý URL ảnh tương đối trước khi thêm vào state
        let processedResult = { ...result };
        if (processedResult.imageUrl && processedResult.imageUrl.startsWith('/')) {
          processedResult.imageUrl = `http://localhost:8080${processedResult.imageUrl}`;
        }
        
        setServicesData([
          {
            ...processedResult,
            id: processedResult.id.toString(),
            price: processedResult.price.toLocaleString('vi-VN'),
          },
          ...servicesData
        ]);
        toast.success('Thêm dịch vụ mới thành công');
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Lỗi khi lưu dịch vụ:', err);
      toast.error('Không thể lưu dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (loading) return;
    
    if (showAddModal && (newService.name || newService.description || newService.price || previewImage)) {
      if (!window.confirm('Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.')) {
        return;
      }
    }
    
    setShowAddModal(false);
    setShowViewModal(false);
    setPreviewImage(null);
    setSelectedImageFile(null);
    setNewService({
      id: '',
      name: '',
      description: '',
      price: '',
      duration: 60,
      imageUrl: '',
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
    return matchesSearch;
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
                                {service.duration} phút
                              </div>
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
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
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
                    <div className="services-form-group">
                      <label className="services-form-label">Hình ảnh dịch vụ</label>
                      <div className="services-image-upload">
                        <input
                          type="file"
                          id="service-image"
                          ref={fileInputRef}
                          className="services-file-input"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={loading}
                        />
                        <label htmlFor="service-image" className="services-file-label">
                          <Upload size={16} />
                          <span>Chọn ảnh</span>
                        </label>
                        {previewImage || newService.imageUrl ? (
                          <div className="services-image-preview-container">
                            <img
                              src={previewImage || newService.imageUrl}
                              alt="Preview"
                              className="services-image-preview"
                            />
                            <button
                              type="button"
                              className="services-remove-image"
                              onClick={handleRemoveImage}
                              disabled={loading}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="services-no-image">Chưa có ảnh</span>
                        )}
                      </div>
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
                    <div className="services-form-group">
                      <label className="services-form-label">Hình ảnh dịch vụ</label>
                      {selectedService.imageUrl ? (
                        <div className="services-image-view">
                          <img
                            src={selectedService.imageUrl}
                            alt={selectedService.name}
                            className="services-detail-image"
                            onError={(e) => {
                              console.error("Lỗi tải hình ảnh:", selectedService.imageUrl);
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.png"; // Hình ảnh thay thế khi lỗi
                            }}
                          />
                        </div>
                      ) : (
                        <p className="services-form-text services-no-image">Không có ảnh</p>
                      )}
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