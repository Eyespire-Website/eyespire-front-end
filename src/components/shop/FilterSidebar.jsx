"use client"

import "./FilterSidebar.css"

export default function FilterSidebar({ className, filters, onFilterChange }) {
  const categories = [
    { id: "MEDICINE", label: "Thuốc nhỏ mắt" },
    { id: "EYEWEAR", label: "Kính mắt" },
  ]

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]
    onFilterChange(filterType, newValues)
  }

  const handlePriceChange = (e) => {
    const value = Number.parseInt(e.target.value)
    const newRange = e.target.name === "min" ? [value, filters.priceRange ? filters.priceRange[1] : 0] : [filters.priceRange ? filters.priceRange[0] : 0, value]
    onFilterChange("priceRange", newRange)
  }

  return (
    <div className={`filter-sidebar ${className || ""}`}>
      {/* Categories */}
      <div className="filter-section">
        <h3>Loại sản phẩm</h3>
        {categories.map((category) => (
          <label key={category.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={(filters.categories || []).includes(category.id)}
              onChange={() => handleCheckboxChange("categories", category.id)}
            />
            {category.label}
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h3>Khoảng giá</h3>
        <div className="price-inputs">
          <div className="price-input-group">
            <span className="currency">₫</span>
            <input
              type="number"
              name="min"
              value={filters.priceRange ? filters.priceRange[0] : 0}
              onChange={handlePriceChange}
              placeholder="Min"
              className="price-input"
            />
          </div>
          <div className="price-input-group">
            <span className="currency">₫</span>
            <input
              type="number"
              name="max"
              value={filters.priceRange ? filters.priceRange[1] : 0}
              onChange={handlePriceChange}
              placeholder="Max"
              className="price-input"
            />
          </div>
        </div>
        <button className="apply-btn">Áp dụng bộ lọc</button>
      </div>
    </div>
  )
}
