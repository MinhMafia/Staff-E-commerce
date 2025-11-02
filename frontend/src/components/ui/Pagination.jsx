// src/components/ui/Pagination.jsx
import React from "react";

export default function Pagination({ meta, onPageChange }) {
  if (!meta) return null;

  const { currentPage, totalPages } = meta;
  const pagesToShow = 5;
  const start = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  const end = Math.min(totalPages, start + pagesToShow - 1);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <nav className="flex items-center justify-center space-x-2 mt-6">
      <button
        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        First
      </button>

      <button
        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-md ${
            p === currentPage ? "bg-indigo-600 text-white" : "bg-white border"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      <button
        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </nav>
  );
}
