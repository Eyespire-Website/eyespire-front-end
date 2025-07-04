"use client"

import "./stmStyle/STM-Pagination.css"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={`btn ${currentPage === i ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </button>,
        )
      }
    } else {
      pages.push(
        <button
          key={1}
          className={`btn ${currentPage === 1 ? "btn-primary" : "btn-secondary"}`}
          onClick={() => onPageChange(1)}
        >
          1
        </button>,
      )

      if (currentPage > 3) {
        pages.push(<span key="ellipsis1">...</span>)
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            className={`btn ${currentPage === i ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </button>,
        )
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="ellipsis2">...</span>)
      }

      if (totalPages > 1) {
        pages.push(
          <button
            key={totalPages}
            className={`btn ${currentPage === totalPages ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>,
        )
      }
    }

    return pages
  }

  return (
    <div className="pagination">
      <button className="btn btn-secondary" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Trước
      </button>
      <div className="page-numbers">{renderPageNumbers()}</div>
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Sau
      </button>
    </div>
  )
}

export default Pagination
