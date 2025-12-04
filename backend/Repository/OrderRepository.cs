using backend.Data;
using backend.DTO;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class OrderRepository
    {
        private readonly AppDbContext _context;

        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }

        // Các phương thức liên quan sẽ được triển khai ở đây.

        // 1. Lấy thông tin đơn hàng theo Id
        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems) // nếu bạn có navigation
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        // 2. Cập nhật trạng thái đơn hàng (VD: pending → paid → completed)
        public async Task UpdateOrderStatusAsync(int orderId, string newStatus)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order != null)
            {
                order.Status = newStatus;
                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        //3. Lấy max Id hiện tại trong bảng Orders => nếu chưa có đơn hàng nào thì trả về 0
        public async Task<int> GetMaxIdAsync()
        {
            return await _context.Orders.AnyAsync() ? await _context.Orders.MaxAsync(o => o.Id) : 0;
        }

        /*
            4. Tạo đơn hàng mới 

        */
        public async Task<Order> CreateOrderAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        /*Tìm kiếm kết hợp phân trang*/
        // public async Task<(List<OrderDTO> Data, int TotalItems)> SearchPagingAsync(
        //     int pageNumber,
        //     int pageSize,
        //     string? status,
        //     DateTime? startDate,
        //     DateTime? endDate,
        //     string? search
        // )
        // {
        //     var query = _context.Orders
        //         .Include(o => o.Customer)
        //         .Include(o => o.User)
        //         .Include(o => o.Promotion)
        //         .AsQueryable();

        //     // 1) Lọc theo trạng thái
        //     if (!string.IsNullOrEmpty(status))
        //         query = query.Where(o => o.Status == status);

        //     // 2) Lọc theo ngày tạo
        //     if (startDate.HasValue)
        //         query = query.Where(o => o.CreatedAt >= startDate.Value);

        //     if (endDate.HasValue)
        //         query = query.Where(o => o.CreatedAt <= endDate.Value);

        //     // 3) Tìm theo tên khách / tên nhân viên
        //     if (!string.IsNullOrEmpty(search))
        //     {
        //         string keyword = search.ToLower();
        //         query = query.Where(o =>
        //             (o.Customer != null && o.Customer.FullName.ToLower().Contains(keyword)) ||
        //             (o.User != null && o.User.FullName.ToLower().Contains(keyword))
        //         );
        //     }

        //     int totalItems = await query.CountAsync();

        //     var data = await query
        //         .OrderByDescending(o => o.CreatedAt)
        //         .Skip((pageNumber - 1) * pageSize)
        //         .Take(pageSize)
        //         .Select(o => new OrderDTO
        //         {
        //             Id = o.Id,
        //             OrderNumber = o.OrderNumber,
        //             CustomerId = o.CustomerId,
        //             UserId = o.UserId,
        //             Status = o.Status,
        //             Subtotal = o.Subtotal,
        //             Discount = o.Discount,
        //             TotalAmount = o.TotalAmount,
        //             PromotionId = o.PromotionId,
        //             Note = o.Note,
        //             CreatedAt = o.CreatedAt,
        //             UpdatedAt = o.UpdatedAt,

        //             CustomerName = o.Customer != null ? o.Customer.FullName : null,
        //             UserName = o.User != null ? o.User.FullName : null,
        //             PromotionCode = o.Promotion != null ? o.Promotion.Code : null
        //         })
        //         .ToListAsync();

        //     return (data, totalItems);
        // }

        public async Task<(List<OrderDTO> Data, int TotalItems)> SearchPagingAsync(
    int pageNumber,
    int pageSize,
    string? status,
    DateTime? startDate,
    DateTime? endDate,
    string? search
)
{
    var query = _context.Orders
        .Include(o => o.Customer)
        .Include(o => o.User)
        .Include(o => o.Promotion)
        .AsQueryable();

    // === LỌC TRẠNG THÁI ===
    if (!string.IsNullOrEmpty(status))
        query = query.Where(o => o.Status == status);

    // === LỌC TỪ NGÀY ===
    if (startDate.HasValue)
    {
        var start = startDate.Value.Date; // 00:00:00
        query = query.Where(o => o.CreatedAt >= start);
    }

    // === LỌC ĐẾN NGÀY ===
    if (endDate.HasValue)
    {
        var end = endDate.Value.Date.AddDays(1).AddTicks(-1); // 23:59:59.9999999
        query = query.Where(o => o.CreatedAt <= end);
    }

    // === TÌM KIẾM THEO TÊN ===
    if (!string.IsNullOrEmpty(search))
    {
        string keyword = $"%{search}%";

        query = query.Where(o =>
            (o.Customer != null && EF.Functions.Like(o.Customer.FullName, keyword)) ||
            (o.User != null && EF.Functions.Like(o.User.FullName, keyword))
        );
    }

    // === ĐẾM TỔNG ===
    int totalItems = await query.CountAsync();

    // === TRẢ VỀ DATA THEO TRANG ===
    var data = await query
        .OrderByDescending(o => o.CreatedAt)
        .ThenByDescending(o => o.Id)

        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .Select(o => new OrderDTO
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerId = o.CustomerId,
            UserId = o.UserId,
            Status = o.Status,
            Subtotal = o.Subtotal,
            Discount = o.Discount,
            TotalAmount = o.TotalAmount,
            PromotionId = o.PromotionId,
            Note = o.Note,
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt,
            CustomerName = o.Customer != null ? o.Customer.FullName : null,
            UserName = o.User != null ? o.User.FullName : null,
            PromotionCode = o.Promotion != null ? o.Promotion.Code : null
        })
        .ToListAsync();

    return (data, totalItems);
}


    }
}