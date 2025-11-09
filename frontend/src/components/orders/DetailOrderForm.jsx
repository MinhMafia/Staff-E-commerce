import React, { useState } from "react";

export default function DetailOrderForm({ openProductModal, isCreateMode }) {
  // "add" = thêm mới, "edit" = đang chỉnh sửa
  const [mode, setMode] = useState("add");
  const [details, setDetails] = useState([]);
  const [current, setCurrent] = useState({
    index: null,
    code: "",
    product: "",
    price: 0,
    qty: 1,
    total: 0,
  });

  // Thêm mới
  const handleAdd = () => {
    if (!current.product || !current.qty || !current.price) return;
    const total = Number(current.qty) * Number(current.price);
    const newDetail = { ...current, total };
    setDetails([...details, newDetail]);
    setCurrent({ index: null, code: "", product: "", price: 0, qty: 1, total: 0 });
  };

  // Sửa
  const handleEditClick = (item, index) => {
    setCurrent({ ...item, index });
    setMode("edit");
  };

  const handleEditSave = () => {
    const updated = details.map((d, i) =>
      i === current.index ? { ...current, total: Number(current.qty) * Number(current.price) } : d
    );
    setDetails(updated);
    setMode("add");
    setCurrent({ index: null, code: "", product: "", price: 0, qty: 1, total: 0 });
  };

  const handleCancel = () => {
    setMode("add");
    setCurrent({ index: null, code: "", product: "", price: 0, qty: 1, total: 0 });
  };

  const handleDelete = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6  border-2 border-gray-400">
      <h4 className="text-xl font-bold text-gray-800 mb-4">CHI TIẾT ĐƠN HÀNG</h4>

      {isCreateMode === "create" && (
        <div className="space-y-4 mb-4">
          {/* Form nhập chi tiết sản phẩm */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Sản phẩm
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                placeholder="Chưa chọn sản phẩm..."
                value={current.product}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-medium"
              />
              <button
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={openProductModal}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Giá
              </label>
              <input
                type="number"
                value={current.price}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    price: Number(e.target.value),
                    total: Number(e.target.value) * current.qty,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Số lượng
              </label>
              <input
                type="number"
                min="1"
                value={current.qty}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    qty: Number(e.target.value),
                    total: Number(e.target.value) * current.price,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tổng tiền
              </label>
              <input
                type="text"
                readOnly
                value={current.total}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {mode === "add" ? (
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                Thêm chi tiết
              </button>
            ) : (
              <>
                <button
                  onClick={handleEditSave}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Lưu chỉnh sửa
                </button>
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bảng danh sách sản phẩm */}
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-800 mb-3">
          DANH SÁCH SẢN PHẨM
        </h4>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-bold">Tên SP</th>
                <th className="px-5 py-3 text-center font-bold">SL</th>
                <th className="px-5 py-3 text-right font-bold">Giá</th>
                <th className="px-5 py-3 text-right font-bold">Tổng</th>
                {isCreateMode === "create" && (
                  <th className="px-5 py-3 text-center font-bold">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {details.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">{item.product}</td>
                  <td className="px-5 py-3 text-center">{item.qty}</td>
                  <td className="px-5 py-3 text-right">{Number(item.price).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-bold text-blue-600">{Number(item.total).toLocaleString()}</td>
                  {isCreateMode === "create" && (
                    <td className="px-5 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEditClick(item, index)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {details.length === 0 && (
                <tr>
                  <td colSpan={isCreateMode === "create" ? 5 : 4} className="text-center py-4 text-gray-500 italic">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
