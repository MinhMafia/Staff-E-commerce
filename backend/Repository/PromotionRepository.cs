using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class PromotionRepository
    {
        private readonly AppDbContext _context;

        public PromotionRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách khuyến mãi đang hoạt động.
        /// Nếu customerId > 0 => lọc khuyến mãi chưa dùng bởi khách này
        /// Nếu customerId = 0 hoặc null => khách vãng lai, show tất cả
        /// </summary>
        public async Task<List<Promotion>> GetActivePromotionsAsync(int? customerId = null)
        {
            var now = DateTime.UtcNow;

            var query = _context.Promotions
                .Where(p => p.Active &&
                            (!p.StartDate.HasValue || p.StartDate <= now) &&
                            (!p.EndDate.HasValue || p.EndDate >= now))
                .AsQueryable();

            if (customerId.HasValue && customerId.Value > 0)
            {
                query = query.Where(p =>
                    !_context.PromotionRedemptions
                        .Any(r => r.PromotionId == p.Id && r.CustomerId == customerId.Value)
                );
            }

            return await query
                .OrderBy(p => p.StartDate)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy khuyến mãi theo Id
        /// </summary>
        public async Task<Promotion?> GetByIdAsync(int promotionId)
        {
            return await _context.Promotions.FirstOrDefaultAsync(p => p.Id == promotionId);
        }

        /// <summary>
        /// Thêm bản ghi redemption
        /// </summary>
        public async Task AddRedemptionAsync(PromotionRedemption redemption)
        {
            await _context.PromotionRedemptions.AddAsync(redemption);
        }

        /// <summary>
        /// Lưu thay đổi
        /// </summary>
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Áp dụng khuyến mãi cho một đơn hàng đã tạo
        /// </summary>
        public async Task ApplyPromotionAsync(Order order)
        {
            if (!order.PromotionId.HasValue) return; // không có khuyến mãi thì thôi

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Lấy khuyến mãi
                var promo = await GetByIdAsync(order.PromotionId.Value);
                if (promo == null)
                    throw new Exception("Khuyến mãi không tồn tại");

                // 2. Kiểm tra giới hạn sử dụng
                if (promo.UsageLimit.HasValue && promo.UsedCount >= promo.UsageLimit.Value)
                    throw new Exception("Khuyến mãi đã hết lượt sử dụng");

                // 3. Tăng số lần dùng
                promo.UsedCount += 1;
                _context.Promotions.Update(promo);

                // 4. Tạo bản ghi redemption
                var redemption = new PromotionRedemption
                {
                    PromotionId = promo.Id,
                    CustomerId = order.CustomerId,
                    OrderId = order.Id,
                    RedeemedAt = DateTime.UtcNow
                };
                await AddRedemptionAsync(redemption);

                // 5. Lưu tất cả
                await SaveChangesAsync();

                // 6. Commit transaction
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
