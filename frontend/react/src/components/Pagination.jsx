import React from "react";

export default function Pagination({ page, pageSize, total, onPageChange, className = "" }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  // Show up to 5 page numbers, centered on current page
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, page + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(5, totalPages);
    if (end === totalPages) start = Math.max(1, totalPages - 4);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className={`flex items-center justify-center space-x-1 mt-6 ${className}`}>
      <button
        className="px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>
      {start > 1 && <span className="px-2">...</span>}
      {pages.map((p) => (
        <button
          key={p}
          className={`px-3 py-1 rounded-lg font-medium ${p === page ? "bg-cyan-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
          onClick={() => onPageChange(p)}
          disabled={p === page}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-2">...</span>}
      <button
        className="px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
} 