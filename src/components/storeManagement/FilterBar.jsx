import React from 'react';
import './stmStyle/STM-FilterBar.css';

const FilterBar = ({ 
  categoryFilter, 
  onCategoryChange, 
  statusFilter, 
  onStatusChange,
  onAddProduct 
}) => {
  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'Thức ăn', label: 'Thức ăn' },
    { value: 'Thiết bị', label: 'Thiết bị' },
    { value: 'Thuốc', label: 'Thuốc' },
    { value: 'Phụ kiện', label: 'Phụ kiện' },
  ];

  const statuses = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Còn hàng' },
    { value: 'low', label: 'Sắp hết' },
    { value: 'out', label: 'Hết hàng' },
  ];

  return (
    <div className="stm-filter-bar">
      <div className="stm-filter-group">
        <select 
          className="stm-filter-select"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <select 
          className="stm-filter-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <button className="stm-btn stm-btn--primary" onClick={onAddProduct}>
        + Thêm sản phẩm mới
      </button>
    </div>
  );
};

export default FilterBar;
