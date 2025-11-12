using backend.DTO;
using backend.Models;
using backend.Repository;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace backend.Services
{
    public class PaymentService
    {
        private readonly PaymentRepository _paymentRepo;
        private readonly OrderRepository _orderRepo;
        private readonly ActivityLogService _logService;
        private readonly IConfiguration _config;

        // Hàm lưu một payment nếu là thanh toán trực tiếp 
        // Lưu Payment (Cash, Card, ECard,...)
        public async Task<Payment> CreatePaymentAsync(Payment payment)
        {
            
            return await _paymentRepo.AddPaymentAsync(payment);
        }

        public PaymentService(PaymentRepository paymentRepo, OrderRepository orderRepo, ActivityLogService logService, IConfiguration config)
        {
            _paymentRepo = paymentRepo;
            _orderRepo = orderRepo;
            _logService = logService;
            _config = config;
        }

        private string SignSHA256(string message, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            return BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(message))).Replace("-", "").ToLower();
        }

        public async Task<MomoPaymentResponseDTO> CreatePaymentAsync(MomoPaymentRequestDTO req, int userId)
        {
            string endpoint = _config["Momo:Endpoint"];
            string partnerCode = _config["Momo:PartnerCode"];
            string accessKey = _config["Momo:AccessKey"];
            string secretKey = _config["Momo:SecretKey"];
            string redirectUrl = _config["Momo:RedirectUrl"];
            string ipnUrl = _config["Momo:IpnUrl"];

            string orderId = Guid.NewGuid().ToString(); // MoMo order ID
            string requestId = Guid.NewGuid().ToString();
            string orderInfo = $"Thanh toán đơn hàng {req.OrderId}";

            string rawSignature = $"accessKey={accessKey}&amount={req.Amount}&extraData=&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType=captureMoMoWallet";
            string signature = SignSHA256(rawSignature, secretKey);

            var body = new
            {
                partnerCode,
                accessKey,
                requestId,
                amount = req.Amount.ToString(),
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData = "",
                requestType = "captureMoMoWallet",
                signature
            };

            using var client = new HttpClient();
            var resp = await client.PostAsync(endpoint, new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json"));
            var content = await resp.Content.ReadAsStringAsync();
            dynamic json = JsonConvert.DeserializeObject(content);
            string payUrl = json?.payUrl ?? "";
            bool success = !string.IsNullOrEmpty(payUrl);

            var payment = new Payment
            {
                OrderId = req.OrderId,
                Amount = req.Amount,
                Method = "momo",
                TransactionRef = orderId,
                Status = success ? "pending" : "failed",
                CreatedAt = DateTime.UtcNow
            };
            await _paymentRepo.AddPaymentAsync(payment);

            await _logService.LogAsync(userId, "CREATE_PAYMENT", "Payment", orderId, JsonConvert.SerializeObject(req), "system");

            return new MomoPaymentResponseDTO
            {
                PayUrl = payUrl,
                OrderId = orderId,
                RequestId = requestId,
                Success = success,
                Message = json?.message
            };
        }

        public async Task<bool> HandleMomoCallbackAsync(MomoIpnCallbackDTO callback)
        {
            string accessKey = _config["Momo:AccessKey"];
            string secretKey = _config["Momo:SecretKey"];

            string rawSignature =
                $"accessKey={accessKey}" +
                $"&amount={callback.Amount}" +
                $"&extraData={callback.ExtraData}" +
                $"&message={callback.Message}" +
                $"&orderId={callback.OrderId}" +
                $"&orderInfo={callback.OrderInfo}" +
                $"&orderType={callback.OrderType}" +
                $"&partnerCode={callback.PartnerCode}" +
                $"&payType={callback.PayType}" +
                $"&requestId={callback.RequestId}" +
                $"&responseTime={callback.ResponseTime}" +
                $"&resultCode={callback.ResultCode}" +
                $"&transId={callback.TransId}";

            string expected = SignSHA256(rawSignature, secretKey);
            if (callback.Signature != expected) return false;

            if (callback.ResultCode == 0)
            {
                var payment = await _paymentRepo.GetByOrderIdAsync(int.Parse(callback.OrderId ?? "0"));
                if (payment != null)
                {
                    payment.Status = "completed";
                    await _paymentRepo.UpdatePaymentAsync(payment);
                    await _orderRepo.UpdateOrderStatusAsync(payment.OrderId, "paid");
                    await _logService.LogAsync(payment.OrderId, "PAYMENT_SUCCESS", "Payment", payment.TransactionRef, JsonConvert.SerializeObject(callback), "system");
                }
            }

            return true;
        }
    }
}








    