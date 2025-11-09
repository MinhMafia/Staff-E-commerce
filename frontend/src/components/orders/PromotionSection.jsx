import React from "react";

export default function PromotionSectionStatic({isCreateMode}) {
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-gray-400">
      <h4 className="text-xl font-bold text-gray-800 mb-3">PHIẾU GIẢM GIÁ</h4>

      {isCreateMode === "create" && (
        <div>
          {/* Tìm phiếu */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Tìm mã phiếu..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
              value="NEWYEAR10"
              readOnly
            />
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              Tìm Phiếu
            </button>
          </div>
        </div>
      )}


      {/* Danh sách phiếu giảm giá */}
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {/* Phiếu 1 */}
        <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary hover:shadow">
          <div>
            <div className="font-bold text-primary text-lg">NEWYEAR10</div>
            <div className="text-sm text-gray-600">
              Giảm <strong>10%</strong>
            </div>
          </div>
          <input type="radio" name="voucher" className="form-radio h-5 w-5 text-green-600" defaultChecked />
        </label>

        {/* Phiếu 2 */}
        <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary hover:shadow">
          <div>
            <div className="font-bold text-primary text-lg">SALE50K</div>
            <div className="text-sm text-gray-600">
              Giảm <strong>50.000₫</strong> • Tối thiểu <strong>200.000₫</strong>
            </div>
          </div>
          <input type="radio" name="voucher" className="form-radio h-5 w-5 text-green-600" />
        </label>

        {/* Phiếu 3 */}
        <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary hover:shadow">
          <div>
            <div className="font-bold text-primary text-lg">BLACKFRIDAY</div>
            <div className="text-sm text-gray-600">
              Giảm <strong>20%</strong> • Tối thiểu <strong>500.000₫</strong>
            </div>
          </div>
          <input type="radio" name="voucher" className="form-radio h-5 w-5 text-green-600" />
        </label>
      </div>

      {isCreateMode === "create" && (
        <div className="text-right">
            {/* Nút chọn phiếu */}
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              Chọn Phiếu
            </button>
          </div>
      )}

       </div>
 
  );
}
