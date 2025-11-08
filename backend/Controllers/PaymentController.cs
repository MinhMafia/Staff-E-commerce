using backend.DTO;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Controller quản lý các API liên quan đến thanh toán (MoMo)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly ActivityLogService _logService;

        public PaymentController(PaymentService paymentService, ActivityLogService logService)
        {
            _paymentService = paymentService;
            _logService = logService;
        }

        /// <summary>
        /// API khởi tạo thanh toán MoMo
        /// Client gửi lên thông tin đơn hàng, backend tạo request đến MoMo và trả URL cho client
        /// </summary>
        /// <param name="req">Dữ liệu yêu cầu thanh toán (OrderId, Amount, v.v...)</param>
        [HttpPost("momo/create")]
        public async Task<IActionResult> CreatePayment([FromBody] MomoPaymentRequestDTO req)
        {
            try
            {
                int userId = 1; // tạm giả lập user id, thực tế lấy từ token JWT

                var result = await _paymentService.CreatePaymentAsync(req, userId);

                await _logService.LogAsync(
                    userId,
                    "REQUEST_CREATE_PAYMENT",
                    "Payment",
                    req.OrderId.ToString(),
                    $"Tạo yêu cầu thanh toán MoMo cho đơn hàng {req.OrderId}",
                    HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(0, "ERROR_CREATE_PAYMENT", "System", "0", ex.Message, "system");
                return StatusCode(500, new { message = "Lỗi khi tạo thanh toán MoMo", error = ex.Message });
            }
        }

        /// <summary>
        /// API để MoMo gọi về (IPN - Instant Payment Notification)
        /// Backend nhận callback, xác thực chữ ký, cập nhật trạng thái thanh toán
        /// </summary>
        [HttpPost("momo/ipn")]
        public async Task<IActionResult> MomoCallback([FromBody] MomoIpnCallbackDTO callback)
        {
            try
            {
                bool valid = await _paymentService.HandleMomoCallbackAsync(callback);
                if (!valid)
                {
                    await _logService.LogAsync(0, "INVALID_SIGNATURE", "Payment", callback.OrderId ?? "", "Sai chữ ký MoMo", "system");
                    return BadRequest(new { message = "Invalid signature" });
                }

                await _logService.LogAsync(0, "MOMO_IPN_RECEIVED", "Payment", callback.OrderId ?? "", $"Callback: {callback.Message}", "system");
                return Ok(new { message = "Callback handled successfully" });
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(0, "ERROR_MOMO_CALLBACK", "System", "0", ex.Message, "system");
                return StatusCode(500, new { message = "Lỗi khi xử lý callback MoMo", error = ex.Message });
            }
        }
    }
}
