import React from "react";

export default function AuditTable({ openAuditDetailModal   }) {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="px-5 py-3 text-left font-bold">Thời gian</th>
              <th className="px-5 py-3 text-left font-bold">Nhân viên</th>
              <th className="px-5 py-3 text-left font-bold">Hành động</th>
              <th className="px-5 py-3 text-left font-bold">Đối tượng</th>
              <th className="px-5 py-3 text-left font-bold">Chi tiết</th>
              <th className="px-5 py-3 text-left font-bold">IP</th>
              <th className="px-5 py-3 text-left font-bold">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">

            <tr className="hover:bg-gray-50 transition cursor-pointer">
              <td className="px-5 py-3 text-xs font-medium">2025-11-11 01:00</td>
              <td className="px-5 py-3 font-medium">Nguyen Van A</td>
              <td className="px-5 py-3">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Thêm
                </span>
              </td>
              <td className="px-5 py-3 font-medium">Customer #KH001</td>
              <td
                className="px-5 py-3 text-xs text-gray-600 truncate max-w-xs"
                title="Thêm khách hàng mới"
              >
                Thêm khách hàng mới
              </td>
              <td className="px-5 py-3 text-xs text-gray-500">192.168.1.10</td>
              <td className="px-5 py-3">
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition" onClick={openAuditDetailModal}>
                  Xem
                </button>
              </td>
            </tr>

            <tr className="hover:bg-gray-50 transition cursor-pointer">
              <td className="px-5 py-3 text-xs font-medium">2025-11-11 02:30</td>
              <td className="px-5 py-3 font-medium">Tran Thi B</td>
              <td className="px-5 py-3">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  Cập nhật
                </span>
              </td>
              <td className="px-5 py-3 font-medium">Order #DH002</td>
              <td
                className="px-5 py-3 text-xs text-gray-600 truncate max-w-xs"
                title="Cập nhật trạng thái đơn hàng"
              >
                Cập nhật trạng thái đơn hàng
              </td>
              <td className="px-5 py-3 text-xs text-gray-500">192.168.1.11</td>
              <td className="px-5 py-3">
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition" onClick={openAuditDetailModal}>
                  Xem
                </button>
              </td>
            </tr>

            <tr className="hover:bg-gray-50 transition cursor-pointer">
              <td className="px-5 py-3 text-xs font-medium">2025-11-11 03:15</td>
              <td className="px-5 py-3 font-medium">Le Van C</td>
              <td className="px-5 py-3">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  Xóa
                </span>
              </td>
              <td className="px-5 py-3 font-medium">Product #SP005</td>
              <td
                className="px-5 py-3 text-xs text-gray-600 truncate max-w-xs"
                title="Xóa sản phẩm lỗi"
              >
                Xóa sản phẩm lỗi
              </td>
              <td className="px-5 py-3 text-xs text-gray-500">192.168.1.12</td>
              <td className="px-5 py-3">
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition" onClick={openAuditDetailModal}>
                  Xem
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <button className="px-5 py-2 border rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-blue-100">
          Prev
        </button>
        <span className="text-sm font-medium">
          Trang <strong>1</strong> / <strong>3</strong>
        </span>
        <button className="px-5 py-2 border rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-blue-100">
          Next
        </button>
      </div>
    </div>
  );
}
