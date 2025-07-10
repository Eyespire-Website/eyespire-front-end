import React from 'react';
import './stmStyle/STM-FilterBar.css';

const FilterBar = ({ filters, onAddNew, addButtonText }) => {
  return (
      <div className="stm-filter-bar">
        <div className="stm-filter-group">
          {filters.map((filter) => (
              <select
                  key={filter.label}
                  className="stm-filter-select"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
              >
                {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                ))}
              </select>
          ))}
        </div>
      </div>
  );
};

export default FilterBar;