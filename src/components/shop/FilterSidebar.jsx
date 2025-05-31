"use client"

import "./FilterSidebar.css"

export default function FilterSidebar({ className, filters, onFilterChange }) {
  const categories = [
    { id: "aspheric", label: "Aspheric" },
    { id: "high-index-plastic", label: "High Index Plastic" },
    { id: "photochromic", label: "Photochromic" },
  ]

  const colors = [
    { id: "black", label: "Black" },
    { id: "blue", label: "Blue" },
    { id: "white", label: "White" },
    { id: "brown", label: "Brown" },
    { id: "green", label: "Green" },
    { id: "pink", label: "Pink" },
  ]

  const genders = [
    { id: "men", label: "Men" },
    { id: "unisex", label: "Unisex" },
    { id: "women", label: "Women" },
  ]

  const frameShapes = [
    { id: "hexagonal", label: "Hexagonal" },
    { id: "rectangle", label: "Rectangle" },
    { id: "square", label: "Square" },
    { id: "oval", label: "Oval" },
  ]

  const frameWidths = [
    { id: "narrow", label: "Narrow" },
    { id: "medium", label: "Medium" },
    { id: "wide", label: "Wide" },
  ]

  const tags = ["Contact lens", "Help", "Optometric", "Metal", "Gradient", "Diamond", "Professional"]

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = filters[filterType]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]
    onFilterChange(filterType, newValues)
  }

  const handlePriceChange = (e) => {
    const value = Number.parseInt(e.target.value)
    const newRange = e.target.name === "min" ? [value, filters.priceRange[1]] : [filters.priceRange[0], value]
    onFilterChange("priceRange", newRange)
  }

  return (
    <div className={`filter-sidebar ${className || ""}`}>
      {/* Categories */}
      <div className="filter-section">
        <h3>Categories</h3>
        {categories.map((category) => (
          <label key={category.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.categories.includes(category.id)}
              onChange={() => handleCheckboxChange("categories", category.id)}
            />
            {category.label}
          </label>
        ))}
      </div>

      {/* Colors */}
      <div className="filter-section">
        <h3>Colours</h3>
        <div className="color-filters">
          {colors.map((color) => (
            <button
              key={color.id}
              className={`color-filter ${filters.colors.includes(color.id) ? "selected" : ""}`}
              onClick={() => handleCheckboxChange("colors", color.id)}
              title={color.label}
            >
              <div className={`color-dot color-${color.id}`} />
            </button>
          ))}
        </div>
        <button className="clear-btn" onClick={() => onFilterChange("colors", [])}>
          Clear
        </button>
      </div>

      {/* Gender */}
      <div className="filter-section">
        <h3>Gender</h3>
        {genders.map((gender) => (
          <label key={gender.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.genders.includes(gender.id)}
              onChange={() => handleCheckboxChange("genders", gender.id)}
            />
            {gender.label}
          </label>
        ))}
      </div>

      {/* Frame Shapes */}
      <div className="filter-section">
        <h3>Frame Shapes</h3>
        {frameShapes.map((shape) => (
          <label key={shape.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.frameShapes ? filters.frameShapes.includes(shape.id) : false}
              onChange={() => handleCheckboxChange("frameShapes", shape.id)}
            />
            {shape.label}
          </label>
        ))}
      </div>

      {/* Frame Width */}
      <div className="filter-section">
        <h3>Frame Width</h3>
        {frameWidths.map((width) => (
          <label key={width.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.frameWidths ? filters.frameWidths.includes(width.id) : false}
              onChange={() => handleCheckboxChange("frameWidths", width.id)}
            />
            {width.label}
          </label>
        ))}
      </div>

      {/* Tags */}
      <div className="filter-section">
        <h3>Tags</h3>
        <div className="tags-container">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h3>Price range</h3>
        <div className="price-inputs">
          <div className="price-input-group">
            <span className="currency">$</span>
            <input
              type="number"
              name="min"
              value={filters.priceRange[0]}
              onChange={handlePriceChange}
              placeholder="Min"
              className="price-input"
            />
          </div>
          <div className="price-input-group">
            <span className="currency">$</span>
            <input
              type="number"
              name="max"
              value={filters.priceRange[1]}
              onChange={handlePriceChange}
              placeholder="Max"
              className="price-input"
            />
          </div>
        </div>
        <button className="apply-btn">Apply Filter</button>
      </div>
    </div>
  )
}
