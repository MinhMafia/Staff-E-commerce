import React from "react";




export default function PromotionSectionStatic() {

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
      <h4 className="text-xl font-bold text-gray-800 mb-3">CHỌN PHIẾU GIẢM GIÁ</h4>

      {/* Tìm phiếu */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm mã phiếu..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
          value="NEWYEAR10" // dữ liệu giả
          readOnly
        />
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
          Tìm Phiếu
        </button>
      </div>

      {/* Danh sách phiếu giảm giá */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {/* Phiếu 1 */}
        <div className="p-4 border rounded-lg cursor-pointer transition hover:border-primary hover:shadow">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-primary text-lg">NEWYEAR10</div>
              <div className="text-sm text-gray-600">
                Giảm <strong>10%</strong>
              </div>
            </div>
            {/* Checkmark hiển thị phiếu đang dùng */}
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Phiếu 2 */}
        <div className="p-4 border rounded-lg cursor-pointer transition hover:border-primary hover:shadow">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-primary text-lg">SALE50K</div>
              <div className="text-sm text-gray-600">
                Giảm <strong>50.000₫</strong> • Tối thiểu <strong>200.000₫</strong>
              </div>
            </div>
            {/* Phiếu chưa dùng nên không hiện checkmark */}
          </div>
        </div>

        {/* Phiếu 3 */}
        <div className="p-4 border rounded-lg cursor-pointer transition hover:border-primary hover:shadow">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-primary text-lg">BLACKFRIDAY</div>
              <div className="text-sm text-gray-600">
                Giảm <strong>20%</strong> • Tối thiểu <strong>500.000₫</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
