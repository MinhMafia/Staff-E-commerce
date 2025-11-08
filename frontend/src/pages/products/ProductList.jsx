// src/pages/products/ProductList.jsx
import React, { useState } from "react";
import useProducts from "../../hook/useProducts";
import ProductCard from "../../components/products/ProductCard";
import Pagination from "../../components/ui/Pagination";

export default function ProductList() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState("");
  // Set usePaginationEndpoint true if backend supports /paginated
  const { items, loading, error, meta } = useProducts({
    page,
    pageSize,
    search,
    usePaginationEndpoint: true,
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Danh sách sản phẩm
          </h1>

          <div className="flex items-center space-x-2">
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        )}

        {error && <div className="text-red-500">Có lỗi: {error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="text-gray-500">Không có sản phẩm nào.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((p) => (
                <ProductCard key={p.id ?? p.Id ?? p.productId} product={p} />
              ))}
            </div>

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
          </>
        )}
      </div>
    </div>
  );
}