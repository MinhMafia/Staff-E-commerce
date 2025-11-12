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

        // Lấy tất cả khuyến mãi chưa xóa
        public async Task<List<Promotion>> GetAllAsync()
        {
            return await _context.Promotions
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        // Lấy khuyến mãi đang hoạt động, chưa hết lượt, chưa dùng bởi khách
        public async Task<List<Promotion>> GetActivePromotionsAsync(int? customerId = null)
        {
            var now = DateTime.UtcNow;

            var query = _context.Promotions
                .Where(p => p.Active &&
                            (!p.StartDate.HasValue || p.StartDate <= now) &&
                            (!p.EndDate.HasValue || p.EndDate >= now) &&
                            (!p.UsageLimit.HasValue || p.UsedCount < p.UsageLimit.Value))
                .AsQueryable();

            if (customerId.HasValue && customerId.Value > 0)
            {
                query = query.Where(p =>
                    !_context.PromotionRedemptions
                        .Any(r => r.PromotionId == p.Id && r.CustomerId == customerId.Value)
                );
            }

            return await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        // Get paginated promotions
        public async Task<PaginationResult<Promotion>> GetPaginatedAsync(int page, int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var totalItems = await _context.Promotions.Where(p => !p.IsDeleted).CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var items = await _context.Promotions
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginationResult<Promotion>
            {
                Items = items,
                TotalItems = totalItems,
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasPrevious = page > 1,
                HasNext = page < totalPages
            };
        }

        public async Task<Promotion?> GetByIdAsync(int id)
        {
            return await _context.Promotions
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<Promotion?> GetByCodeAsync(string code)
        {
            return await _context.Promotions
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Code == code && !p.IsDeleted);
        }

        public async Task<Promotion> CreateAsync(Promotion promotion)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            promotion.CreatedAt = vietnamTime;
            promotion.UpdatedAt = vietnamTime;

            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();
            return promotion;
        }

        public async Task<Promotion> UpdateAsync(Promotion promotion)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            promotion.UpdatedAt = vietnamTime;
            _context.Promotions.Update(promotion);
            await _context.SaveChangesAsync();
            return promotion;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var promotion = await _context.Promotions.FirstOrDefaultAsync(p => p.Id == id);
            if (promotion == null) return false;

            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            promotion.IsDeleted = true;
            promotion.DeletedAt = vietnamTime;
            _context.Promotions.Update(promotion);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<PromotionRedemption>> GetRedemptionsAsync(int promotionId)
        {
            return await _context.PromotionRedemptions
                .AsNoTracking()
                .Where(pr => pr.PromotionId == promotionId)
                .Include(pr => pr.Customer)
                .Include(pr => pr.Order)
                .OrderByDescending(pr => pr.RedeemedAt)
                .ToListAsync();
        }

        // Áp dụng khuyến mãi hoặc tăng số lần sử dụng
        public async Task<bool> ApplyOrChangePromotionAsync(Order order = null, int? promotionId = null, int? customerId = null, int? orderId = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                Promotion promo = null;

                if (order != null && order.PromotionId.HasValue)
                {
                    // ApplyPromotionAsync
                    promo = await GetByIdAsync(order.PromotionId.Value);
                    if (promo == null) throw new Exception("Khuyến mãi không tồn tại");
                    if (promo.UsageLimit.HasValue && promo.UsedCount >= promo.UsageLimit.Value)
                        throw new Exception("Khuyến mãi đã hết lượt sử dụng");

                    promo.UsedCount += 1;
                    _context.Promotions.Update(promo);

                    var redemption = new PromotionRedemption
                    {
                        PromotionId = promo.Id,
                        CustomerId = customerId,
                        OrderId = order.Id,
                        RedeemedAt = DateTime.UtcNow
                    };
                    await _context.PromotionRedemptions.AddAsync(redemption);
                }
                else if (promotionId.HasValue && orderId.HasValue)
                {
                    // ChangePromotionAsync
                    promo = await _context.Promotions.FirstOrDefaultAsync(p => p.Id == promotionId.Value);
                    promo.UsedCount += 1;
                    _context.Promotions.Update(promo);

                    var redemption = new PromotionRedemption
                    {
                        PromotionId = promo.Id,
                        CustomerId = customerId,
                        OrderId = orderId.Value,
                        RedeemedAt = DateTime.UtcNow
                    };
                    await _context.PromotionRedemptions.AddAsync(redemption);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[ApplyOrChangePromotionAsync] Lỗi: {ex.Message}");
                return false;
            }
        }
    }
}
