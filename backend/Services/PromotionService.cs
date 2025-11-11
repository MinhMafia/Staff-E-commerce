using backend.Models;
using backend.Repository;

namespace backend.Services
{
    public class PromotionService
    {
        private readonly PromotionRepository _promotionRepository;

        public PromotionService(PromotionRepository promotionRepository)
        {
            _promotionRepository = promotionRepository;
        }

        /// <summary>
        /// Lấy danh sách khuyến mãi cho khách hàng
        /// customerId = 0 hoặc null => khách vãng lai
        /// customerId > 0 => khách thân quen, lọc khuyến mãi chưa dùng
        /// </summary>
        public async Task<List<Promotion>> GetPromotionsForCustomerAsync(int? customerId = null)
        {
            var promotions = await _promotionRepository.GetActivePromotionsAsync(customerId);
            return promotions;
        }

        /// <summary>
        /// Áp dụng khuyến mãi cho đơn hàng đã tạo
        /// </summary>
        public async Task ApplyPromotionAsync(Order order)
        {
            if (!order.PromotionId.HasValue) return; // không có khuyến mãi thì thôi

            try
            {
                await _promotionRepository.ApplyPromotionAsync(order);
            }
            catch (Exception ex)
            {
                // có thể log lỗi nếu muốn
                throw new Exception($"Áp dụng khuyến mãi thất bại: {ex.Message}");
            }
        }
    }
}
