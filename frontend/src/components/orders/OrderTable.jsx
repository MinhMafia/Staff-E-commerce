import React from "react";


export default function OrderTable({openOrderModal}) {

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-gray-100 to-gray-200">
        <h3 className="text-2xl font-bold text-gray-800">DANH SÁCH ĐƠN HÀNG</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold">Mã đơn</th>
              <th className="px-6 py-4 text-left font-bold">Khách</th>
              <th className="px-6 py-4 text-left font-bold">NV</th>
              <th className="px-6 py-4 text-right font-bold">Tiền</th>
              <th className="px-6 py-4 text-center font-bold">Trạng thái</th>
              <th className="px-6 py-4 text-center font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Dòng 3 */}
            <tr className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-bold">DH003</td>
              <td className="px-6 py-4">Lê Văn C</td>
              <td className="px-6 py-4">Nhân viên 3</td>
              <td className="px-6 py-4 text-right font-bold text-blue-600">540.000 ₫</td>
              <td className="px-6 py-4 text-center text-blue-600 font-bold">Hoàn thành</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700" onClick={() => openOrderModal("detail")}>Xem</button>
              </td>
            </tr>
            {/* Dòng 3 */}
            <tr className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-bold">DH003</td>
              <td className="px-6 py-4">Lê Văn C</td>
              <td className="px-6 py-4">Nhân viên 3</td>
              <td className="px-6 py-4 text-right font-bold text-blue-600">540.000 ₫</td>
              <td className="px-6 py-4 text-center text-blue-600 font-bold">Hoàn thành</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"  onClick={() => openOrderModal("detail")}>Xem</button>
              </td>
            </tr>

            {/* Dòng 3 */}
            <tr className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-bold">DH003</td>
              <td className="px-6 py-4">Lê Văn C</td>
              <td className="px-6 py-4">Nhân viên 3</td>
              <td className="px-6 py-4 text-right font-bold text-blue-600">540.000 ₫</td>
              <td className="px-6 py-4 text-center text-blue-600 font-bold">Hoàn thành</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700" onClick={() => openOrderModal("detail")}>Xem</button>
              </td>
            </tr>

            {/* Dòng 3 */}
            <tr className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-bold">DH003</td>
              <td className="px-6 py-4">Lê Văn C</td>
              <td className="px-6 py-4">Nhân viên 3</td>
              <td className="px-6 py-4 text-right font-bold text-blue-600">540.000 ₫</td>
              <td className="px-6 py-4 text-center text-blue-600 font-bold">Hoàn thành</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700" onClick={() => openOrderModal("detail")}>Xem</button>
              </td>
            </tr>

            {/* Dòng 3 */}
            <tr className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-bold">DH003</td>
              <td className="px-6 py-4">Lê Văn C</td>
              <td className="px-6 py-4">Nhân viên 3</td>
              <td className="px-6 py-4 text-right font-bold text-blue-600">540.000 ₫</td>
              <td className="px-6 py-4 text-center text-blue-600 font-bold">Hoàn thành</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700" onClick={() => openOrderModal("detail")}>Xem</button>
              </td>
            </tr>

            {/* Dòng 3 */}
            <tr className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-bold">DH003</td>
              <td className="px-6 py-4">Lê Văn C</td>
              <td className="px-6 py-4">Nhân viên 3</td>
              <td className="px-6 py-4 text-right font-bold text-blue-600">540.000 ₫</td>
              <td className="px-6 py-4 text-center text-blue-600 font-bold">Hoàn thành</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700" onClick={() => openOrderModal("detail")}>Xem</button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-5 border-t bg-gray-50">
        <button className="px-6 py-3 border rounded-lg disabled:opacity-50 font-bold">Trước</button>
        <span className="text-sm font-bold">Trang <strong>1</strong> / <strong>3</strong></span>
        <button className="px-6 py-3 border rounded-lg disabled:opacity-50 font-bold">Sau</button>
      </div>
    </div>
  );
}
