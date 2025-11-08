import React from "react";
import DetailOrderForm from "./DetailOrderForm";
import PromotionSection from "./PromotionSection";

export default function OrdersForm({ onClose ,openCustomerModal, openProductModal}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} 
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 mb-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            TẠO / CHI TIẾT ĐƠN HÀNG
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="space-y-5 mb-6">
          {/* Mã đơn hàng */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Mã đơn hàng
            </label>
            <input
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"
            />
          </div>

          {/* Khách hàng */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Khách hàng
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                placeholder="Chưa chọn khách..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"
              />
              <button className="px-3 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300" onClick={openCustomerModal}>
                {/* Nút mở modal khách hàng */}
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

          {/* Nhân viên */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nhân viên
            </label>
            <input
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"
            />
          </div>

          {/* Ngày lập phiếu */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Ngày lập phiếu
            </label>
            <input
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"
            />
          </div>

          {/* Ngày chỉnh sửa */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Ngày chỉnh sửa
            </label>
            <input
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"
            />
          </div>

          {/* Trạng thái đơn */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Trạng thái đơn
            </label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-bold">
              <option>Chưa xử lý</option>
              <option>Đã thanh toán</option>
              <option>Hoàn thành</option>
              <option>Đã hủy</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              rows="2"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            ></textarea>
          </div>

          {/* Chi tiết đơn hàng */}
          <DetailOrderForm openProductModal={openProductModal}/>

          {/* Khuyến mãi */}
          <PromotionSection />

          {/* Tổng tiền */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-xl mb-6 font-bold text-lg">
            <div className="flex justify-between mb-2">
              <span>Tổng trước giảm:</span> <span>0₫</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Giảm giá:</span>{" "}
              <span className="text-green-600">0₫</span>
            </div>
            <div className="flex justify-between text-xl text-blue-600">
              <span>Phải trả:</span> <span>0₫</span>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Phương thức
              </label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-medium">
                <option>Tiền mặt</option>
                <option>MoMo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Mã GD
              </label>
              <input
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
              />
              <label className="block text-sm font-bold text-gray-700 mb-1 mt-3">
                Trạng thái
              </label>
              <input
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-wrap gap-4 justify-end">
            <button className="px-7 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg">
              Tạo Đơn Hàng
            </button>
            <button className="px-7 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg">
              Xử Lý
            </button>
            <button className="px-7 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg">
              Hủy Đơn
            </button>
            <button className="px-7 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 shadow-lg">
              In Hóa Đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
