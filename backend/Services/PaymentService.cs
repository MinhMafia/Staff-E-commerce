using backend.DTO;
using backend.Models;
using backend.Repository;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace backend.Services
{
    // Service chịu trách nhiệm xử lý logic thanh toán qua MoMo
    public class PaymentService
    {
        private readonly PaymentRepository _paymentRepo;
        private readonly OrderRepository _orderRepo;
        private readonly ActivityLogService _logService;
        private readonly IConfiguration _config;

        public PaymentService(PaymentRepository paymentRepo, OrderRepository orderRepo, ActivityLogService logService, IConfiguration config)
        {
            _paymentRepo = paymentRepo;
            _orderRepo = orderRepo;
            _logService = logService;
            _config = config;
        }
        //Tạo một payment tạm để gủi 


        // Hàm băm SHA256 để tạo chữ ký gửi MoMo
        private static string SignSHA256(string message, string key)
        {
            var encoding = new UTF8Encoding();
            byte[] keyByte = encoding.GetBytes(key);
            byte[] messageBytes = encoding.GetBytes(message);
            using var hmacsha256 = new HMACSHA256(keyByte);
            byte[] hashMessage = hmacsha256.ComputeHash(messageBytes);
            return BitConverter.ToString(hashMessage).Replace("-", "").ToLower();
        }

        /*
            1. Hàm tạo giao dịch thanh toán mới trên MoMo

        */
        public async Task<MomoPaymentResponseDTO> CreatePaymentAsync(MomoPaymentRequestDTO req, int userId)
        {
            // Lấy cấu hình MoMo từ appsettings.json
            string endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            string partnerCode = _config["Momo:PartnerCode"];
            string accessKey = _config["Momo:AccessKey"];
            string secretKey = _config["Momo:SecretKey"];

            // Sinh mã định danh ngẫu nhiên
            string orderId = Guid.NewGuid().ToString(); // ID phía MoMo
            string requestId = Guid.NewGuid().ToString();

            // Tạo chuỗi ký để MoMo xác thực
            string rawHash = $"accessKey={accessKey}&amount={req.Amount}&extraData=&ipnUrl={req.NotifyUrl}&orderId={orderId}&orderInfo=Thanh toán đơn hàng&partnerCode={partnerCode}&redirectUrl={req.ReturnUrl}&requestId={requestId}&requestType=captureWallet";
            string signature = SignSHA256(rawHash, secretKey);

            // Tạo body gửi sang MoMo
            var body = new
            {
                partnerCode,
                partnerName = "MyStore",
                storeId = "MomoTest",
                requestId,
                amount = req.Amount.ToString(),
                orderId,
                orderInfo = "Thanh toán MoMo",
                redirectUrl = req.ReturnUrl,
                ipnUrl = req.NotifyUrl,
                lang = "vi",
                requestType = "captureWallet",
                autoCapture = true,
                extraData = "",
                signature
            };

            // Gửi HTTP POST sang API MoMo
            using var client = new HttpClient();
            var response = await client.PostAsync(endpoint, new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json"));
            var content = await response.Content.ReadAsStringAsync();
            dynamic json = JsonConvert.DeserializeObject(content);

            // Lấy URL để redirect
            string payUrl = (string?)json?.payUrl ?? "";
            bool success = !string.IsNullOrEmpty(payUrl);

            // Lưu bản ghi Payment vào DB
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

            // Ghi log tạo payment
            await _logService.LogAsync(userId, "CREATE_PAYMENT", "Payment", orderId, JsonConvert.SerializeObject(req), "system");

            return new MomoPaymentResponseDTO
            {
                PayUrl = payUrl,
                RequestId = requestId,
                OrderId = orderId,
                Message = json?.message,
                Success = success
            };
        }

        // 2. Hàm xử lý callback IPN từ MoMo (MoMo gọi vào notifyUrl)
        public async Task<bool> HandleMomoCallbackAsync(MomoIpnCallbackDTO callback)
        {
            string accessKey = _config["Momo:AccessKey"];
            string secretKey = _config["Momo:SecretKey"];

            string rawHash =
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

            string expectedSignature = SignSHA256(rawHash, secretKey);

            if (callback.Signature != expectedSignature)
                return false;

            if (callback.ResultCode == 0)
            {
                var payment = await _paymentRepo.GetByOrderIdAsync(int.Parse(callback.OrderId ?? "0"));
                if (payment != null)
                {
                    payment.Status = "completed";
                    await _paymentRepo.UpdatePaymentAsync(payment);

                    await _orderRepo.UpdateOrderStatusAsync(payment.OrderId, "paid");

                    await _logService.LogAsync(
                        payment.Order.Id,
                        "PAYMENT_SUCCESS",
                        "Payment",
                        payment.TransactionRef,
                        JsonConvert.SerializeObject(callback),
                        "system"
                    );
                }
            }

            return true;
        }





    }
    
}