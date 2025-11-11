import React, { useState, useEffect } from "react";

export default function DetailOrderForm({
  openProductModal,
  isCreateMode,
  listOrderProducts,
  setListOrderProducts,
  selectedProduct,
  setSelectedProduct,
}) {
  // -------------------------------
  // State lưu thông tin sản phẩm đang thao tác (trước khi thêm vào danh sách)
  // -------------------------------
  const [current, setCurrent] = useState({
    id: "",        // Mã sản phẩm
    product: "",   // Tên sản phẩm
    price: 0,      // Giá 1 sản phẩm
    qty: 1,        // Số lượng
    total: 0,      // Tổng tiền = price * qty
  });

  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [editIndex, setEditIndex] = useState(null); // Lưu index sản phẩm đang sửa

  // -------------------------------
  // Khi chọn sản phẩm từ ProductModal, cập nhật current
  // -------------------------------
  useEffect(() => {
    if (selectedProduct) {
      setCurrent({
        id: selectedProduct.id,
        product: selectedProduct.name,
        price: selectedProduct.price,
        qty: 1,
        total: selectedProduct.price,
      });
    }
  }, [selectedProduct]);

  // -------------------------------
  // Khi thay đổi qty hoặc price, cập nhật total tự động
  // -------------------------------
  useEffect(() => {
    setCurrent(prev => ({
      ...prev,
      total: prev.price * prev.qty
    }));
  }, [current.price, current.qty]);

  // -------------------------------
  // Thêm sản phẩm vào danh sách
  // -------------------------------
  const handleAdd = () => {
    if (!current.product) return; // Không thêm nếu chưa chọn sản phẩm
    setListOrderProducts([...listOrderProducts, current]);
    resetForm();
  };

  // -------------------------------
  // Lưu sản phẩm chỉnh sửa
  // -------------------------------
  const handleSaveEdit = () => {
    if (editIndex === null) return;
    const updatedList = [...listOrderProducts];
    updatedList[editIndex] = current;
    setListOrderProducts(updatedList);
    resetForm();
  };

  // -------------------------------
  // Xóa sản phẩm
  // -------------------------------
  const handleDelete = (index) => {
    const updatedList = listOrderProducts.filter((_, i) => i !== index);
    setListOrderProducts(updatedList);
    // Nếu đang sửa sản phẩm bị xóa, reset form
    if (editIndex === index) resetForm();
  };

  // -------------------------------
  // Sửa sản phẩm (đưa vào form)
  // -------------------------------
  const handleEdit = (index) => {
    setCurrent(listOrderProducts[index]);
    setMode("edit");
    setEditIndex(index);
  };

  // -------------------------------
  // Reset form
  // -------------------------------
  const resetForm = () => {
    setCurrent({ id: "", product: "", price: 0, qty: 1, total: 0 });
    setSelectedProduct(null);
    setMode("add");
    setEditIndex(null);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border-2 border-gray-400">
      <h4 className="text-xl font-bold text-gray-800 mb-4">CHI TIẾT ĐƠN HÀNG</h4>

      {/* Form chọn sản phẩm và nhập số lượng, giá */}
      {isCreateMode === "create" && (
        <div className="space-y-4 mb-4">
          {/* Chọn sản phẩm */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sản phẩm</label>
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
                Chọn
              </button>
            </div>
          </div>

          {/* Giá, số lượng, tổng tiền */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Giá</label>
              <input
                type="number"
                value={current.price}
                onChange={e =>
                  setCurrent({ ...current, price: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Số lượng</label>
              <input
                type="number"
                min="1"
                value={current.qty}
                onChange={e =>
                  setCurrent({ ...current, qty: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tổng tiền</label>
              <input
                type="text"
                readOnly
                value={current.total.toLocaleString()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-medium"
              />
            </div>
          </div>

          {/* Nút Thêm / Lưu / Hủy */}
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
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Lưu chỉnh sửa
                </button>
                <button
                  onClick={resetForm}
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
        <h4 className="text-xl font-bold text-gray-800 mb-3">DANH SÁCH SẢN PHẨM</h4>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-bold">Mã SP</th>
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
              {listOrderProducts.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">{item.id}</td>
                  <td className="px-5 py-3">{item.product}</td>
                  <td className="px-5 py-3 text-center">{item.qty}</td>
                  <td className="px-5 py-3 text-right">{Number(item.price).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-bold text-blue-600">{Number(item.total).toLocaleString()}</td>
                  {isCreateMode === "create" && (
                    <td className="px-5 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(index)}
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
              {listOrderProducts.length === 0 && (
                <tr>
                  <td colSpan={isCreateMode === "create" ? 6 : 5} className="text-center py-4 text-gray-500 italic">
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
