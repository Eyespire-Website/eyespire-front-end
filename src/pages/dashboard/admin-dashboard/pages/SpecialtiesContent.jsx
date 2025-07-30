import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Plus, CheckCircle, X } from 'lucide-react';
import '../styles/services.css'; // Sử dụng lại CSS của trang dịch vụ
import '../styles/specialties-unified.css';
import specialtyService from '../../../../services/specialtyService';

// Giả lập thư viện thông báo
const toast = {
  success: (msg) => console.log(`Success: ${msg}`),
  error: (msg) => console.log(`Error: ${msg}`),
};

const SpecialtiesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Tải danh sách chuyên khoa
  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const data = await specialtyService.getAllSpecialties();
      setSpecialties(data);
    } catch (err) {
      setError('Không thể tải danh sách chuyên khoa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialty = () => {
    setNewSpecialty({
      name: '',
      description: '',
      imageUrl: '',
    });
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditSpecialty = (specialty) => {
    setNewSpecialty({ ...specialty });
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleDeleteSpecialty = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa chuyên khoa này?')) return;
    
    setLoading(true);
    try {
      await specialtyService.deleteSpecialty(id);
      setSpecialties(specialties.filter(specialty => specialty.id !== id));
      toast.success('Xóa chuyên khoa thành công');
    } catch (err) {
      toast.error('Không thể xóa chuyên khoa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSpecialty = (specialty) => {
    setSelectedSpecialty(specialty);
    setShowViewModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpecialty(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!newSpecialty.name.trim()) return 'Tên chuyên khoa là bắt buộc';
    if (!newSpecialty.description.trim()) return 'Mô tả là bắt buộc';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      if (editMode) {
        const updatedSpecialty = await specialtyService.updateSpecialty(newSpecialty.id, newSpecialty);
        setSpecialties(specialties.map(specialty =>
          specialty.id === updatedSpecialty.id ? updatedSpecialty : specialty
        ));
        toast.success('Cập nhật chuyên khoa thành công');
      } else {
        const createdSpecialty = await specialtyService.createSpecialty(newSpecialty);
        setSpecialties([...specialties, createdSpecialty]);
        toast.success('Thêm chuyên khoa thành công');
      }
      setShowAddModal(false);
    } catch (err) {
      toast.error(editMode ? 'Không thể cập nhật chuyên khoa' : 'Không thể thêm chuyên khoa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewSpecialty({
      name: '',
      description: '',
      imageUrl: '',
    });
    setEditMode(false);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedSpecialty(null);
  };

  const filteredSpecialties = specialties.filter(specialty => {
    const matchesSearch = specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSpecialties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpecialties = filteredSpecialties.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="card services-container">
      <div className="card-hdr">
        <div className="card-hdr-content">
          <h3 className="card-title">Danh sách chuyên khoa</h3>
          <button className="services-add-btn" onClick={handleAddSpecialty} disabled={loading}>
            <Plus size={16} />
            Thêm chuyên khoa
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
              placeholder="Tìm kiếm chuyên khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {loading ? (
            <div className="specialties-content">
                <div className="specialties-content__loading">
                    <div className="specialties-content__spinner"></div>
                    <p>Đang tải danh sách chuyên khoa...</p>
                </div>
            </div>
        ) : (
            <div className="specialties-content__table-container">
                <div className="specialties-content__table-header">
                    <div className="specialties-content__table-header-content">
                        <CheckCircle className="specialties-content__table-header-icon" />
                        <span className="specialties-content__table-header-text">
                            Danh sách chuyên khoa ({filteredSpecialties.length} chuyên khoa)
                        </span>
                    </div>
                </div>

                <div className="specialties-content__table-wrapper">
                    <table className="specialties-content__table">
                        <thead>
                            <tr>
                                <th className="specialties-content__table-head specialties-content__table-head--number">#</th>
                                <th className="specialties-content__table-head">ID</th>
                                <th className="specialties-content__table-head">Tên chuyên khoa</th>
                                <th className="specialties-content__table-head">Mô tả</th>
                                <th className="specialties-content__table-head">Hình ảnh</th>
                                <th className="specialties-content__table-head">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSpecialties.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-results-message">
                                        {searchTerm ? "Không tìm thấy chuyên khoa nào phù hợp" : "Chưa có chuyên khoa nào"}
                                    </td>
                                </tr>
                            ) : (
                                currentSpecialties.map((specialty, index) => (
                                    <tr key={specialty.id} className="specialties-content__table-row">
                                        <td className="specialties-content__table-cell">
                                            {index + 1}
                                        </td>
                                        <td className="specialties-content__table-cell">
                                            <span className="specialties-content__specialty-id">{specialty.id}</span>
                                        </td>
                                        <td className="specialties-content__table-cell">{specialty.name || "Chưa cập nhật"}</td>
                                        <td className="specialties-content__table-cell">
                                            <span className="specialties-content__description" title={specialty.description}>
                                                {specialty.description ? (specialty.description.length > 50 ? specialty.description.substring(0, 50) + '...' : specialty.description) : "Chưa cập nhật"}
                                            </span>
                                        </td>
                                        <td className="specialties-content__table-cell">
                                            {specialty.imageUrl ? (
                                                <img 
                                                    src={specialty.imageUrl} 
                                                    alt={specialty.name}
                                                    className="specialties-content__image"
                                                />
                                            ) : (
                                                <span className="specialties-content__no-image">Không có ảnh</span>
                                            )}
                                        </td>
                                        <td className="specialties-content__table-cell">
                                            <div className="specialties-content__action-buttons">
                                                <button
                                                    className="specialties-content__detail-button"
                                                    onClick={() => handleViewSpecialty(specialty)}
                                                    title="Xem chi tiết"
                                                    disabled={loading}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="specialties-content__action-button specialties-content__action-button--edit"
                                                    onClick={() => handleEditSpecialty(specialty)}
                                                    title="Chỉnh sửa"
                                                    disabled={loading}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="specialties-content__action-button specialties-content__action-button--delete"
                                                    onClick={() => handleDeleteSpecialty(specialty.id)}
                                                    title="Xóa"
                                                    disabled={loading}
                                                >
                                                    <Trash2 size={16} />
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
                {filteredSpecialties.length > 0 && (
                    <div className="specialties-content__pagination">
                        <button
                            className="specialties-content__pagination-btn"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`specialties-content__pagination-btn ${currentPage === i + 1 ? 'specialties-content__pagination-btn--active' : ''}`}
                                onClick={() => paginate(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="specialties-content__pagination-btn"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Modal thêm/chỉnh sửa chuyên khoa */}
      {showAddModal && (
        <div className="services-modal-overlay" role="dialog" aria-modal="true">
          <div className="services-modal">
            <div className="services-modal-header">
              <h3 className="services-modal-title">{editMode ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}</h3>
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
                  <label className="services-form-label">Tên chuyên khoa</label>
                  <input
                    type="text"
                    className="services-form-input"
                    name="name"
                    value={newSpecialty.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên chuyên khoa"
                    disabled={loading}
                  />
                </div>
                <div className="services-form-group">
                  <label className="services-form-label">Mô tả</label>
                  <textarea
                    className="services-form-textarea"
                    name="description"
                    value={newSpecialty.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về chuyên khoa"
                    disabled={loading}
                  />
                </div>
                <div className="services-form-group">
                  <label className="services-form-label">URL hình ảnh</label>
                  <input
                    type="text"
                    className="services-form-input"
                    name="imageUrl"
                    value={newSpecialty.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Nhập URL hình ảnh"
                    disabled={loading}
                  />
                </div>
                {newSpecialty.imageUrl && (
                  <div className="services-form-group">
                    <label className="services-form-label">Xem trước hình ảnh</label>
                    <img 
                      src={newSpecialty.imageUrl} 
                      alt="Xem trước" 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200x150?text=Hình+ảnh+không+hợp+lệ';
                      }}
                    />
                  </div>
                )}
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

      {/* Modal xem chi tiết chuyên khoa */}
      {showViewModal && selectedSpecialty && (
        <div className="services-modal-overlay" role="dialog" aria-modal="true">
          <div className="services-modal">
            <div className="services-modal-header">
              <h3 className="services-modal-title">Chi tiết chuyên khoa</h3>
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
                  <label className="services-form-label">ID</label>
                  <p className="services-form-text">{selectedSpecialty.id}</p>
                </div>
                <div className="services-form-group">
                  <label className="services-form-label">Tên chuyên khoa</label>
                  <p className="services-form-text">{selectedSpecialty.name}</p>
                </div>
                <div className="services-form-group">
                  <label className="services-form-label">Mô tả</label>
                  <p className="services-form-text">{selectedSpecialty.description}</p>
                </div>
                {selectedSpecialty.imageUrl && (
                  <div className="services-form-group">
                    <label className="services-form-label">Hình ảnh</label>
                    <img 
                      src={selectedSpecialty.imageUrl} 
                      alt={selectedSpecialty.name} 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200x150?text=Hình+ảnh+không+hợp+lệ';
                      }}
                    />
                  </div>
                )}
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

export default SpecialtiesContent;
