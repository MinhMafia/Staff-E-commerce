// components/ProductEditModal.jsx
import React, { useEffect, useState } from "react";

const ProductModal = ({
  title = null,
  product = null,
  mode = "view",
  onSave,
  onCancel,
  onDelete,
  saving = false,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (mode === "create") {
      setFormData({
        productName: "",
        price: "",
        sku: "",
        // barcode: "",
        unit: "",
        categoryId: "",
        supplierId: "",
        description: "",
        isActive: true,
      });
    } else if (product) {
      setFormData({
        productName: product.productName || "",
        price: product.price || "",
        sku: product.sku || "",
        // barcode: product.barcode || "",
        unit: product.unit || "",
        categoryId: product.categoryId || "",
        supplierId: product.supplierId || "",
        description: product.description || "",
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    }
  }, [mode, product]);

  const modalTitle =
    title ||
    {
      create: "Thêm sản phẩm mới",
      edit: "Sửa sản phẩm",
      view: "Chi tiết sản phẩm",
    }[mode];

  const handleFieldChange = (field, value) => {
    if (mode === "view") return;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (mode === "view") return;

    const saveData = {
      ...formData,
      price: Number(formData.price) || 0,
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
      supplierId: formData.supplierId ? Number(formData.supplierId) : null,
      ...(mode === "edit" && product?.id && { id: product.id }),
    };

    onSave?.(saveData, mode);
  };

  const isEditing = mode === "edit" || mode === "create";
  const isView = mode === "view";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-md w-full max-w-lg p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold mb-3">{modalTitle}</h3>
          {onDelete && mode !== "create" && (
            <button
              className="text-red-600 text-sm hover:text-red-800"
              onClick={onDelete}
            >
              Xóa
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Tên sản phẩm */}
          <div>
            <label className="text-xs text-gray-600">Tên sản phẩm *</label>
            {isView ? (
              <div className="p-2 border rounded bg-gray-50">
                {formData.productName || "—"}
              </div>
            ) : (
              <input
                className="w-full border px-2 py-1 rounded"
                value={formData.productName || ""}
                onChange={(e) =>
                  handleFieldChange("productName", e.target.value)
                }
                disabled={!isEditing}
              />
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="text-xs text-gray-600">SKU</label>
            {isView ? (
              <div className="p-2 border rounded bg-gray-50">
                {formData.sku}
              </div>
            ) : (
              <input
                className="w-full border px-2 py-1 rounded"
                value={formData.sku}
                onChange={(e) => handleFieldChange("sku", e.target.value)}
                disabled={!isEditing}
              />
            )}
          </div>

          {/* Giá */}
          <div>
            <label className="text-xs text-gray-600">Giá *</label>
            {isView ? (
              <div className="p-2 border rounded bg-gray-50">
                {formatPrice(formData.price) || "—"}
              </div>
            ) : (
              <input
                type="number"
                className="w-full border px-2 py-1 rounded"
                value={formData.price || ""}
                onChange={(e) => handleFieldChange("price", e.target.value)}
                disabled={!isEditing}
              />
            )}
          </div>

          {/* Đơn vị */}
          <div>
            <label className="text-xs text-gray-600">Đơn vị</label>
            {isView ? (
              <div className="p-2 border rounded bg-gray-50">
                {formData.unit || "—"}
              </div>
            ) : (
              <input
                className="w-full border px-2 py-1 rounded"
                value={formData.unit || ""}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                disabled={!isEditing}
              />
            )}
          </div>

          {/* Nhà cung cấp */}
          <div>
            <label className="text-xs text-gray-600">Nhà cung cấp (id)</label>
            {isView ? (
              <div className="p-2 border rounded bg-gray-50">
                {formData.supplierId}
              </div>
            ) : (
              <input
                className="w-full border px-2 py-1 rounded"
                value={formData.supplierId ?? ""}
                onChange={(e) =>
                  handleFieldChange("supplierId", e.target.value)
                }
              />
            )}
          </div>

          {/* Danh mục */}
          <div>
            <label className="text-xs text-gray-600">Danh mục (id)</label>
            {isView ? (
              <div className="p-2 border rounded bg-gray-50">
                {formData.categoryId}
              </div>
            ) : (
              <input
                className="w-full border px-2 py-1 rounded"
                value={formData.categoryId ?? ""}
                onChange={(e) =>
                  handleFieldChange("categoryId", e.target.value)
                }
              />
            )}
          </div>

          {/* Mô tả */}
          <div className="col-span-2">
            <label className="text-xs text-gray-600">Mô tả</label>
            {isView ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[60px]">
                {formData.description || "Không có mô tả"}
              </div>
            ) : (
              <textarea
                className="w-full border px-2 py-1 rounded"
                value={formData?.description || ""}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                disabled={!isEditing}
                rows={3}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex items-center gap-2 justify-end">
            {isView ? (
              <>
                <button className="px-3 py-1 rounded border" onClick={onCancel}>
                  Đóng
                </button>
                <button
                  className="px-3 py-1 rounded bg-indigo-600 text-white"
                  onClick={() => onSave?.(formData, "edit")}
                >
                  Sửa
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-3 py-1 rounded border"
                  onClick={onCancel}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  className="px-3 py-1 rounded bg-indigo-600 text-white"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : mode === "create"
                    ? "Thêm mới"
                    : "Lưu"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatPrice = (v) => {
  if (v == null) return "—";
  try {
    return Intl.NumberFormat("vi-VN").format(Number(v)) + " ₫";
  } catch {
    return v;
  }
};

export default ProductModal;
