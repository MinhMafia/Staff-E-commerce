// src/pages/products/ProductList.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getProductsPaginated, request } from "../../api/apiClient";
import { formatPrice } from "../../utils/formatPrice";
import ProductModal from "../../components/products/ProductModal";
import ImportModal from "../../components/import/ImportModal";

export default function ProductList() {
  // --- state
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // modal state
  const [modalState, setModalState] = useState({
    open: false,
    mode: null, // 'view' | 'edit' | 'create'
    product: null,
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);

  // --- debounce search: chỉ cập nhật debouncedSearch (reset page về 1)
  useEffect(() => {
    const t = setTimeout(() => {
      // khi debounce hoàn tất, đặt debouncedSearch và reset page 1
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 450);

    return () => clearTimeout(t);
  }, [search]);

  // --- fetchProducts: stable function, nhận params (p, ps, q)
  const fetchProducts = useCallback(
    async (p = 1, ps = pageSize, q = "") => {
      // small UX: show loader only if request > 150ms to avoid flicker
      let showLoader = true;
      const loaderTimer = setTimeout(() => {
        if (showLoader) setLoading(true);
      }, 150);

      setError(null);
      try {
        const data = await getProductsPaginated(p, ps, q);
        const itemsArr = data.items ?? data.Items ?? [];
        setItems(itemsArr);
        setMeta({
          totalItems: data.totalItems ?? data.TotalItems ?? itemsArr.length,
          currentPage: data.currentPage ?? data.CurrentPage ?? p,
          pageSize: data.pageSize ?? data.PageSize ?? ps,
          totalPages: data.totalPages ?? data.TotalPages ?? 1,
          hasNext: !!(data.hasNext ?? data.HasNext),
          hasPrevious: !!(data.hasPrevious ?? data.HasPrevious),
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi khi tải sản phẩm");
      } finally {
        showLoader = false;
        clearTimeout(loaderTimer);
        setLoading(false);
      }
    },
    [pageSize]
  );

  // --- gọi fetch chỉ 1 chỗ: khi page / pageSize / debouncedSearch thay đổi
  useEffect(() => {
    fetchProducts(page, pageSize, debouncedSearch);
  }, [page, pageSize, debouncedSearch, fetchProducts]);

  // --- Mở modal
  const openModal = useCallback((mode, product = null) => {
    setModalState({
      open: true,
      mode,
      product: product || {},
    });
  }, []);

  // --- Đóng modal
  const closeModal = useCallback(() => {
    setModalState({
      open: false,
      mode: null,
      product: null,
    });
  }, []);

  // --- Xóa (sử dụng debouncedSearch để refresh consistent)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      setLoading(true);
      await request(`/products/${id}`, { method: "DELETE" });
      setNotification({ type: "success", message: "Xóa sản phẩm thành công" });
      await fetchProducts(page, pageSize, debouncedSearch);
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

  // --- Lưu (create / edit)
  const handleSave = async (productData, mode) => {
    setSaving(true);
    setNotification(null);
    try {
      if (mode === "create") {
        await request(`/products`, {
          method: "POST",
          body: JSON.stringify(productData),
        });
        setNotification({
          type: "success",
          message: "Thêm sản phẩm thành công",
        });
      } else {
        const payload = {
          id: productData.id,
          productName: productData.productName,
          price: Number(productData.price ?? 0),
          sku: productData.sku,
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
      await fetchProducts(page, pageSize, debouncedSearch);
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

  // --- helpers
  const getName = (p) => p.productName ?? p.product_name ?? p.model ?? "—";
  const getPrice = (p) => p.price ?? p.Price ?? 0;
  const getQty = (p) => p.inventory?.quantity ?? p.Quantity ?? 0;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Danh sách sản phẩm
          </h1>

          <div className="flex items-center gap-3">
            <input
              type="  "
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
              className="px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700"
              onClick={() => setImportModalOpen(true)}
            >
              Import
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

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          // Refresh product list after successful import
          fetchProducts(page, pageSize, debouncedSearch);
          setNotification({
            type: "success",
            message: "Import sản phẩm thành công",
          });
        }}
        type="products"
      />
    </div>
  );
}
