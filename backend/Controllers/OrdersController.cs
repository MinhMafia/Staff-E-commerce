using backend.DTO;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

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
                return BadRequest(new { message = ex.Message });
            }
        }
      
    }
}
