using backend.DTO;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;
        public OrdersController(OrderService orderService)
        {
            _orderService = orderService;
        }

        //1. Khởi tạo một đối tượng đơn hàng tạm thời để truyền xuống frontend
        [HttpPost("create-temp")]
        public async Task<ActionResult<OrderDTO>> CreateTemporaryOrder()
        {
            try
            {
                var tempOrder = await _orderService.CreateTemporaryOrderAsync();
                return Ok(tempOrder);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi tạo order: {ex}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        
        // POST: api/Order/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            if (order == null)
                return BadRequest(false); 

            try
            {
                var savedOrder = await _orderService.SaveOrderAsync(order);
                return Ok(true); 
            }
            catch (Exception)
            {
                return StatusCode(500, false); 
            }
        }

      
    }
}
