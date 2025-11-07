using backend.Services;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace backend.Middlewares
{
    /// <summary>
    /// Middleware tự động ghi log cho các request POST, PUT, DELETE.
    /// - Tự động xác định hành động (CREATE/UPDATE/DELETE)
    /// - Ghi log vào DB + file thông qua ActivityLogService
    /// </summary>
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ActivityLogService _logService;

        public RequestLoggingMiddleware(RequestDelegate next, ActivityLogService logService)
        {
            _next = next;
            _logService = logService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var request = context.Request;
            string method = request.Method.ToUpper();

            // Chỉ log các request có thể làm thay đổi dữ liệu
            if (method == "POST" || method == "PUT" || method == "DELETE")
            {
                request.EnableBuffering();
                string bodyText = string.Empty;

                try
                {
                    using (var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true))
                    {
                        bodyText = await reader.ReadToEndAsync();
                        request.Body.Position = 0;
                    }
                }
                catch
                {
                    bodyText = "[Unreadable Body]";
                }

                // Lấy path và entity name (ví dụ: /api/products/5 -> products)
                string path = request.Path.ToString();
                string entityName = ExtractEntityName(path);

                // Tự động xác định hành động
                string action = method switch
                {
                    "POST" => $"CREATE_{entityName}",
                    "PUT" => $"UPDATE_{entityName}",
                    "DELETE" => $"DELETE_{entityName}",
                    _ => $"HTTP_{method}_{entityName}"
                };

                string ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                // UserId tạm thời (sẽ lấy từ JWT sau này)
                int userId = 0;
                string userName = context.User?.Identity?.Name ?? "anonymous";

                string payload = $"User: {userName} | Body: {bodyText}";

                await _logService.LogAsync(
                    userId,
                    action,
                    "API",
                    path,
                    payload,
                    ip
                );
            }

            await _next(context);
        }

        /// <summary>
        /// Trích tên entity từ URL (ví dụ: /api/products/5 -> products)
        /// </summary>
        private string ExtractEntityName(string path)
        {
            // Tìm phần đầu tiên sau /api/
            var match = Regex.Match(path, @"^/api/([^/]+)");
            return match.Success ? match.Groups[1].Value.ToUpper() : "UNKNOWN";
        }
    }
}
