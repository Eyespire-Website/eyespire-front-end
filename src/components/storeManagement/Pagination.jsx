import React from 'react';
import './stmStyle/STM-Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Tạo mảng các trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Nếu tổng số trang ít hơn hoặc bằng số trang tối đa cần hiển thị
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu tổng số trang nhiều hơn số trang tối đa cần hiển thị
      if (currentPage <= 3) {
        // Nếu trang hiện tại gần đầu
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Nếu trang hiện tại gần cuối
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Nếu trang hiện tại ở giữa
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  // Always show pagination when there is data
  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="stm-pagination">
      <button 
        className="stm-pagination-btn" 
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        «
      </button>
      
      {getPageNumbers().map(pageNumber => (
        <button
          key={pageNumber}
          className={`stm-pagination-btn ${currentPage === pageNumber ? 'stm-pagination-btn--active' : ''}`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      
      <button 
        className="stm-pagination-btn" 
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        »
      </button>
    </div>
  );
};

export default Pagination;