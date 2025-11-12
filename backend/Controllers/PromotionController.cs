using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using backend.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionsController : ControllerBase
    {
        private readonly PromotionService _promotionService;
        private readonly AppDbContext _context;

        public PromotionsController(PromotionService promotionService, AppDbContext context)
        {
            _promotionService = promotionService;
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách khuyến mãi cho đơn hàng mới
        /// customerId = 0 hoặc null => khách vãng lai
        /// customerId > 0 => khách thân quen
        /// </summary>
        [HttpGet("promotionforneworder")]
        public async Task<ActionResult<List<Promotion>>> GetPromotions([FromQuery] int? customerId)
        {
            var promotions = await _promotionService.GetPromotionsForCustomerAsync(customerId ?? 0);
            return Ok(promotions);
        }

        /// <summary>
        /// Áp dụng khuyến mãi cho order đã tạo
        /// </summary>
        [HttpPost("{orderId}/apply")]
        public async Task<ActionResult> ApplyPromotion(int orderId)
        {
            // Lấy order từ database
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound(new { message = "Order không tồn tại" });

            try
            {
                await _promotionService.ApplyPromotionAsync(order);
                return Ok(new { message = "Áp dụng khuyến mãi thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
