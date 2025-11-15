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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "create") {
      setFormData({
        productName: "",
        price: "",
        sku: "",
        unit: "",
        categoryId: "",
        supplierId: "",
        description: "",
        imageUrl: "",
        imageFile: null,
        isActive: true,
      });
    } else if (product) {
      setFormData({
        productName: product.productName || "",
        price: product.price || "",
        sku: product.sku || "",
        unit: product.unit || "",
        categoryId: product.categoryId || "",
        supplierId: product.supplierId || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
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

  // Validate dữ liệu trước khi lưu
  const validate = () => {
    const newErrors = {};

    if (!formData.productName?.trim()) {
      newErrors.productName = "Tên sản phẩm không được để trống";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      newErrors.price = "Giá phải là số lớn hơn 0";
    }

    if (formData.sku && !/^[a-zA-Z0-9_-]+$/.test(formData.sku)) {
      newErrors.sku = "SKU chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang";
    }

    if (!formData.unit?.trim()) {
      newErrors.unit = "Đơn vị không được để trống";
    }

    if (
      formData.categoryId &&
      (isNaN(formData.categoryId) || Number(formData.categoryId) <= 0)
    ) {
      newErrors.categoryId = "Danh mục ID phải là số hợp lệ";
    }

    if (
      formData.supplierId &&
      (isNaN(formData.supplierId) || Number(formData.supplierId) <= 0)
    ) {
      newErrors.supplierId = "Nhà cung cấp ID phải là số hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    if (mode === "view") return;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async () => {
    if (mode === "view") return;
    if (!validate()) return;

    const saveData = {
      ...formData,
      price: Number(formData.price) || 0,
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
      supplierId: formData.supplierId ? Number(formData.supplierId) : null,
      ...(mode === "edit" && product?.id && { id: product.id }),
    };

    // Xử lý upload ảnh nếu có file
    if (formData.imageFile) {
      try {
        const imageUrl = await uploadImage(formData.imageFile);
        saveData.imageUrl = imageUrl;
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        alert("Lỗi upload ảnh. Vui lòng thử lại.");
        return;
      }
    }

    onSave?.(saveData, mode);
  };

  // Hàm upload ảnh (cần implement)
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.imageUrl;
  };

  const isEditing = mode === "edit" || mode === "create";
  const isView = mode === "view";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-md w-full max-w-4xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{modalTitle}</h3>
          {onDelete && mode !== "create" && (
            <button
              className="text-red-600 text-sm hover:text-red-800"
              onClick={onDelete}
            >
              Xóa
            </button>
          )}
        </div>

        <div className="flex gap-4">
          {/* --- CỘT TRÁI: ẢNH SẢN PHẨM --- */}
          <div className="w-1/3">
            <label className="text-xs text-gray-600 mb-2 block">
              Hình ảnh sản phẩm
            </label>
            {isView ? (
              <div className="border rounded bg-gray-50 aspect-square flex items-center justify-center">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt={formData.productName}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">Không có ảnh</div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border rounded bg-gray-50 aspect-square flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt={formData.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">Chưa có ảnh</div>
                  )}
                </div>
                {/* Input file ẩn */}
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Tạo URL tạm thời để preview
                      const imageUrl = URL.createObjectURL(file);
                      setFormData((prev) => ({
                        ...prev,
                        imageFile: file,
                        imageUrl: imageUrl,
                      }));
                    }
                  }}
                />
                {/* Button chọn ảnh */}
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("image-upload").click()
                  }
                  className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Chọn ảnh từ máy
                  </div>
                </button>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border px-2 py-1 rounded text-sm pr-20"
                    placeholder="Hoặc nhập URL ảnh..."
                    value={formData.imageUrl || ""}
                    onChange={(e) =>
                      handleFieldChange("imageUrl", e.target.value)
                    }
                  />
                  <div className="absolute right-1 top-1 text-xs text-gray-400">
                    URL
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Chọn ảnh từ máy hoặc nhập URL hình ảnh
                </p>
              </div>
            )}
          </div>
          <div className="w-2/3">
            <div className="grid grid-cols-2 gap-3">
              {/* --- TÊN SẢN PHẨM --- */}
              <div>
                <label className="text-xs text-gray-600">Tên sản phẩm *</label>
                {isView ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {formData.productName || "—"}
                  </div>
                ) : (
                  <>
                    <input
                      className={`w-full border px-2 py-1 rounded ${
                        errors.productName ? "border-red-500" : ""
                      }`}
                      value={formData.productName || ""}
                      onChange={(e) =>
                        handleFieldChange("productName", e.target.value)
                      }
                    />
                    {errors.productName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.productName}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* --- SKU --- */}
              <div>
                <label className="text-xs text-gray-600">SKU</label>
                {isView ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {formData.sku}
                  </div>
                ) : (
                  <>
                    <input
                      className={`w-full border px-2 py-1 rounded ${
                        errors.sku ? "border-red-500" : ""
                      }`}
                      value={formData.sku}
                      onChange={(e) => handleFieldChange("sku", e.target.value)}
                    />
                    {errors.sku && (
                      <p className="text-xs text-red-500 mt-1">{errors.sku}</p>
                    )}
                  </>
                )}
              </div>

              {/* --- GIÁ --- */}
              <div>
                <label className="text-xs text-gray-600">Giá *</label>
                {isView ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {formatPrice(formData.price) || "—"}
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      className={`w-full border px-2 py-1 rounded ${
                        errors.price ? "border-red-500" : ""
                      }`}
                      value={formData.price || ""}
                      onChange={(e) =>
                        handleFieldChange("price", e.target.value)
                      }
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.price}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* --- ĐƠN VỊ --- */}
              <div>
                <label className="text-xs text-gray-600">Đơn vị *</label>
                {isView ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {formData.unit}
                  </div>
                ) : (
                  <>
                    <input
                      className={`w-full border px-2 py-1 rounded ${
                        errors.unit ? "border-red-500" : ""
                      }`}
                      value={formData.unit || ""}
                      onChange={(e) =>
                        handleFieldChange("unit", e.target.value)
                      }
                    />
                    {errors.unit && (
                      <p className="text-xs text-red-500 mt-1">{errors.unit}</p>
                    )}
                  </>
                )}
              </div>

              {/* --- NHÀ CUNG CẤP ID --- */}
              <div>
                <label className="text-xs text-gray-600">
                  Nhà cung cấp (ID)
                </label>
                {isView ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {formData.supplierId}
                  </div>
                ) : (
                  <>
                    <input
                      className={`w-full border px-2 py-1 rounded ${
                        errors.supplierId ? "border-red-500" : ""
                      }`}
                      value={formData.supplierId ?? ""}
                      onChange={(e) =>
                        handleFieldChange("supplierId", e.target.value)
                      }
                    />
                    {errors.supplierId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.supplierId}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* --- DANH MỤC ID --- */}
              <div>
                <label className="text-xs text-gray-600">Danh mục (ID)</label>
                {isView ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {formData.categoryId}
                  </div>
                ) : (
                  <>
                    <input
                      className={`w-full border px-2 py-1 rounded ${
                        errors.categoryId ? "border-red-500" : ""
                      }`}
                      value={formData.categoryId ?? ""}
                      onChange={(e) =>
                        handleFieldChange("categoryId", e.target.value)
                      }
                    />
                    {errors.categoryId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.categoryId}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* --- MÔ TẢ --- */}
              <div>
                <label className="text-xs text-gray-600">Mô tả</label>
                {isView ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {formData.description || "Không có mô tả"}
                  </div>
                ) : (
                  <textarea
                    className="w-full border px-2 py-1 rounded"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    rows={3}
                  />
                )}
              </div>

              {/* --- CHECKBOX ĐANG HOẠT ĐỘNG --- */}
              <div>
                <label className="text-xs text-gray-600">
                  Trạng thái hoạt động
                </label>
                {isView ? (
                  <div className="flex items-center gap-2 p-2 py-2.5 border rounded bg-gray-50">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        formData.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm">
                      {formData.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={(e) =>
                        handleFieldChange("isActive", e.target.checked)
                      }
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Đang hoạt động
                    </span>
                  </label>
                )}
              </div>

              {/* --- BUTTONS --- */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button className="px-3 py-1 rounded border" onClick={onCancel}>
                  Hủy
                </button>
                {!isView && (
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
                )}
              </div>
            </div>
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
