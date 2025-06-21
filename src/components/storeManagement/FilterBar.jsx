"use client"

import { Plus } from "lucide-react"
import "./stmStyle/STM-FilterBar.css"

const FilterBar = ({ filters, onAddNew, addButtonText = "Thêm mới" }) => {
  return (
    <div className="filter-bar">
      {filters.map((filter, index) => (
        <div key={index} className="filter-group">
          <label>{filter.label}:</label>
          <select className="form-select" value={filter.value} onChange={(e) => filter.onChange(e.target.value)}>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {onAddNew && (
        <button className="btn btn-primary" onClick={onAddNew}>
          <Plus size={16} />
          {addButtonText}
        </button>
      )}
    </div>
  )
}

export default FilterBar
