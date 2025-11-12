// src/pages/products/ProductList.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getProductsPaginated, request } from "../../api/apiClient";
import { formatPrice } from "../../utils/formatPrice";
import ProductModal from "../../components/products/ProductModal";

export default function ProductList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // modal state - thay thế editing, viewing bằng 1 state duy nhất
  const [modalState, setModalState] = useState({
    open: false,
    mode: null, // 'view' | 'edit' | 'create'
    product: null,
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // debounce search
  const searchRef = useRef(null);
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, pageSize, search);
    }, 450);
    return () => clearTimeout(searchRef.current);
  }, [search, pageSize]);

  useEffect(() => {
    fetchProducts(page, pageSize, search);
  }, [page, pageSize, search]);

  async function fetchProducts(p = 1, ps = 12, q = "") {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductsPaginated(p, ps, q);
      const itemsArr = data.items ?? [];
      setItems(itemsArr);
      setMeta({
        totalItems: data.totalItems ?? itemsArr.length,
        currentPage: data.currentPage ?? p,
        pageSize: data.pageSize ?? ps,
        totalPages: data.totalPages ?? 1,
        hasNext: !!data.hasNext,
        hasPrevious: !!data.hasPrevious,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }

  // Mở modal với các chế độ khác nhau
  const openModal = useCallback((mode, product = null) => {
    setModalState({
      open: true,
      mode,
      product: product || {},
    });
  }, []);

  // Đóng modal
  const closeModal = useCallback(() => {
    setModalState({
      open: false,
      mode: null,
      product: null,
    });
  }, []);

  // Xử lý xóa sản phẩm
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      setLoading(true);
      await request(`/products/${id}`, { method: "DELETE" });
      setNotification({ type: "success", message: "Xóa sản phẩm thành công" });
      await fetchProducts(page, pageSize, search);
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: "Xóa không thành công: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lưu (cho cả create và edit)
  const handleSave = async (productData, mode) => {
    setSaving(true);
    setNotification(null);
    try {
      if (mode === "create") {
        // Tạo mới sản phẩm
        await request(`/products`, {
          method: "POST",
          body: JSON.stringify(productData),
        });
        setNotification({
          type: "success",
          message: "Thêm sản phẩm thành công",
        });
      } else {
        // Cập nhật sản phẩm
        const payload = {
          id: productData.id,
          productName: productData.productName,
          price: Number(productData.price ?? 0),
          sku: productData.sku,
          // barcode: productData.barcode,
          unit: productData.unit,
          categoryId: productData.categoryId,
          supplierId: productData.supplierId,
          isActive: !!productData.isActive,
          description: productData.description,
        };

        await request(`/products/${productData.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotification({
          type: "success",
          message: "Cập nhật sản phẩm thành công",
        });
      }

      closeModal();
      await fetchProducts(page, pageSize, search);
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message:
          `${mode === "create" ? "Thêm" : "Cập nhật"} thất bại: ` + err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const getName = (p) => p.productName;
  const getPrice = (p) => p.price;
  const getQty = (p) => {
    return p.inventory?.quantity ?? 0;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Danh sách sản phẩm
          </h1>

          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
            />
            <button
              className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => {
                setPage(1);
                fetchProducts(1, pageSize, search);
              }}
            >
              Tìm kiếm
            </button>
            <button
              className="px-3 py-2 rounded-md bg-green-500 text-white hover:bg-green-700"
              onClick={() => openModal("create")}
            >
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {notification && (
          <div
            className={`mb-3 p-2 rounded ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Id
                </th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  SKU
                </th> */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Tên
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                  Giá
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                  ĐVT
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                  Tồn
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Nhà cung cấp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Danh mục
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-500">
                    Không có sản phẩm
                  </td>
                </tr>
              ) : (
                items.map((p, idx) => (
                  <tr key={p.id ?? idx}>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(meta.currentPage - 1) * meta.pageSize + idx + 1}
                    </td>
                    {/* <td className="px-4 py-3 text-sm text-gray-700">
                      {p.sku ?? p.barcode}
                    </td> */}
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {getName(p)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-indigo-600 font-semibold">
                      {formatPrice(getPrice(p))}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {p.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {getQty(p) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {p.supplier?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {p.category?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {p.isActive ? (
                        <span className="text-green-600">Hoạt động</span>
                      ) : (
                        <span className="text-red-500">Vô hiệu</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal("view", p)}
                          className="px-2 py-1 bg-blue-100 rounded text-blue-800 hover:bg-blue-200"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => openModal("edit", p)}
                          className="px-2 py-1 bg-yellow-100 rounded text-yellow-800 hover:bg-yellow-200"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-2 py-1 bg-red-100 rounded text-red-800 hover:bg-red-200"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị{" "}
            <strong>
              {(meta.currentPage - 1) * meta.pageSize + 1} -{" "}
              {Math.min(meta.currentPage * meta.pageSize, meta.totalItems)}
            </strong>{" "}
            / {meta.totalItems} sản phẩm
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={meta.currentPage === 1}
            >
              First
            </button>
            <button
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setPage(Math.max(1, meta.currentPage - 1))}
              disabled={!meta.hasPrevious}
            >
              Prev
            </button>

            <span className="px-3 py-1 rounded-md bg-white border">
              {meta.currentPage} / {meta.totalPages}
            </span>

            <button
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() =>
                setPage(Math.min(meta.totalPages, meta.currentPage + 1))
              }
              disabled={!meta.hasNext}
            >
              Next
            </button>
            <button
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setPage(meta.totalPages)}
              disabled={meta.currentPage === meta.totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Universal Modal */}
      {modalState.open && (
        <ProductModal
          mode={modalState.mode}
          product={modalState.product}
          onSave={handleSave}
          onCancel={closeModal}
          onDelete={() => {
            if (modalState.product?.id) {
              handleDelete(modalState.product.id);
              closeModal();
            }
          }}
          saving={saving}
        />
      )}
    </div>
  );
}
