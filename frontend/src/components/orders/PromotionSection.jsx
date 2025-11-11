import React, { useEffect, useState } from "react";

export default function PromotionSection({ isCreateMode, promotion, setPromotion, currentOrder, setCurrentOrder }) {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState(promotion?.id || null);

  // Fetch promotions khi tạo đơn
  useEffect(() => {
    if (isCreateMode === "create") {
      const customerId = currentOrder?.customer_id || 0;
      fetch(`http://localhost:5099/api/promotions/promotionforneworder?customerId=${customerId}`)
        .then((res) => res.json())
        .then((data) => {
          setPromotions(data);

          // Auto chọn voucher đầu tiên nếu chưa có promotion
          if (!promotion && data.length > 0) {
            handleSelect(data[0]);
          }
        })
        .catch((err) => console.error("Failed to fetch promotions:", err));
    } else {
      setSelectedPromotionId(promotion?.id || null);
    }
  }, [isCreateMode, currentOrder, promotion]);

  // Khi chọn promotion
  const handleSelect = (promo) => {
    setSelectedPromotionId(promo.id);
    setPromotion(promo);

    // Tính discount
    let discountAmount = 0;
    const subtotal = currentOrder?.subtotal || 0;

    if (promo.type === "percent") {
      discountAmount = Math.floor((subtotal * promo.value) / 100); // tròn xuống
    } else {
      discountAmount = promo.value;
    }

    // Nếu subtotal < minOrderAmount, không áp dụng
    if (promo.minOrderAmount > 0 && subtotal < promo.minOrderAmount) {
      discountAmount = 0;
    }

    // Cập nhật currentOrder
    setCurrentOrder(prev => ({
      ...prev,
      discount: discountAmount,
      total_amount: subtotal - discountAmount
    }));
  };

  const formatValue = (promo) => {
    if (promo.type === "percent") return `${promo.value}%`;
    return `${Number(promo.value).toLocaleString()}₫`;
  };

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-gray-400">
      <h4 className="text-xl font-bold text-gray-800 mb-3">PHIẾU GIẢM GIÁ</h4>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {isCreateMode === "create"
          ? promotions.map((promo) => (
              <label
                key={promo.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary hover:shadow ${
                  selectedPromotionId === promo.id ? "border-green-600 bg-green-50" : ""
                }`}
              >
                <div>
                  <div className="font-bold text-primary text-lg">{promo.code}</div>
                  <div className="text-sm text-gray-600">
                    Giảm {formatValue(promo)}
                    {promo.minOrderAmount > 0 && (
                      <> • Tối thiểu {Number(promo.minOrderAmount).toLocaleString()}₫</>
                    )}
                  </div>
                </div>
                <input
                  type="radio"
                  name="voucher"
                  className="form-radio h-5 w-5 text-green-600"
                  checked={selectedPromotionId === promo.id}
                  onChange={() => handleSelect(promo)}
                />
              </label>
            ))
          : promotion && (
              <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer bg-gray-100">
                <div>
                  <div className="font-bold text-primary text-lg">{promotion.code}</div>
                  <div className="text-sm text-gray-600">
                    Giảm {formatValue(promotion)}
                    {promotion.minOrderAmount > 0 && (
                      <> • Tối thiểu {Number(promotion.minOrderAmount).toLocaleString()}₫</>
                    )}
                  </div>
                </div>
                <input type="radio" name="voucher" className="form-radio h-5 w-5 text-green-600" checked readOnly />
              </label>
            )}
      </div>
    </div>
  );
}
