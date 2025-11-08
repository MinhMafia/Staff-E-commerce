import React from "react";


export default function DetailOrderForm({ openProductModal }) {
 
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
      <h4 className="text-xl font-bold text-gray-800 mb-4">CHI TIẾT ĐƠN HÀNG</h4>

      {/* Chọn sản phẩm */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Sản phẩm
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              placeholder="Chưa chọn sản phẩm..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-medium"
            />
            <button className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" onClick={openProductModal}>
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
              type="text"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              min="1"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
            Thêm chi tiết
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
            Lưu chỉnh sửa
          </button>
          <button className="px-5 py-2.5 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700">
            Hủy
          </button>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-800 mb-3">
          DANH SÁCH SẢN PHẨM
        </h4>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-bold">Mã SP</th>
                <th className="px-5 py-3 text-left font-bold">Tên SP</th>
                <th className="px-5 py-3 text-center font-bold">SL</th>
                <th className="px-5 py-3 text-right font-bold">Giá</th>
                <th className="px-5 py-3 text-right font-bold">Tổng</th>
                <th className="px-5 py-3 text-center font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-medium">SP001</td>
                <td className="px-5 py-3">Sản phẩm A</td>
                <td className="px-5 py-3 text-center">2</td>
                <td className="px-5 py-3 text-right">100.000</td>
                <td className="px-5 py-3 text-right font-bold text-blue-600">
                  200.000
                </td>
                <td className="px-5 py-3 text-center space-x-2">
                  <button className="text-xs text-blue-600 hover:underline font-medium">
                    Sửa
                  </button>
                  <button className="text-xs text-red-600 hover:underline font-medium">
                    Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
