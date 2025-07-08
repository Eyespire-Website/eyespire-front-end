import React from 'react';
import { Search } from 'lucide-react';
import './stmStyle/STM-SearchBox.css';

const SearchBox = ({ placeholder = "Tìm kiếm...", value, onChange }) => {
  return (
    <div className="stm-search-box">
      <Search size={18} className="stm-search-icon" />
      <input
        type="text"
        className="stm-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBox;