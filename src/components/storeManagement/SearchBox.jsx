"use client"

import { Search } from "lucide-react"
import "./stmStyle/STM-SearchBox.css"

const SearchBox = ({ value, onChange, placeholder = "Tìm kiếm..." }) => {
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder={placeholder}
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Search size={16} className="search-icon" />
    </div>
  )
}

export default SearchBox
