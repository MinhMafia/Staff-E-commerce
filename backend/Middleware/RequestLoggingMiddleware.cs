using backend.Services;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Middlewares
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider;

        public RequestLoggingMiddleware(RequestDelegate next, IServiceProvider serviceProvider)
        {
            _next = next;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                var request = context.Request;
                string method = request.Method.ToUpper();

                if (method == "POST" || method == "PUT" || method == "DELETE")
                {
                    request.EnableBuffering();
                    string bodyText = string.Empty;

                    try
                    {
                        using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
                        bodyText = await reader.ReadToEndAsync();
                        request.Body.Position = 0;
                    }
                    catch
                    {
                        bodyText = "[Unreadable Body]";
                    }

                    string path = request.Path.ToString();
                    string entityName = NormalizeEntityName(ExtractEntityName(path));
                    string entityId = ExtractEntityId(path);
                    string action = method switch
                    {
                        "POST" => $"CREATE_{entityName}",
                        "PUT" => $"UPDATE_{entityName}",
                        "DELETE" => $"DELETE_{entityName}",
                        _ => $"HTTP_{method}_{entityName}"
                    };

                    string ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    int userId = 2; // TODO: lấy từ JWT nếu có
                    string userName = context.User?.Identity?.Name ?? "anonymous";
                    string payload = $"User: {userName} | Body: {bodyText}";

                    Console.WriteLine($"[RequestLoggingMiddleware] Logging {action} for {entityName}#{entityId}");

                    // 🔹 Tạo scope để resolve ActivityLogService
                    try
                    {
                        using var scope = _serviceProvider.CreateScope();
                        var logService = scope.ServiceProvider.GetRequiredService<ActivityLogService>();
                        await logService.LogAsync(userId, action, entityName, entityId, payload, ip);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[RequestLoggingMiddleware] LogAsync failed: {ex.Message}");
                    }
                }

                await _next(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RequestLoggingMiddleware] Unexpected error: {ex.Message}");
                await _next(context);
            }
        }

        private string ExtractEntityName(string path)
        {
            try
            {
                var match = Regex.Match(path, @"^/api/([^/]+)");
                if (!match.Success || string.IsNullOrEmpty(match.Groups[1].Value))
                    return "Unknown";

                string name = match.Groups[1].Value;
                return char.ToUpper(name[0]) + (name.Length > 1 ? name.Substring(1).ToLower() : "");
            }
            catch
            {
                return "Unknown";
            }
        }

        private string NormalizeEntityName(string entityName)
        {
            // Chuẩn hóa để trùng key trong appsettings.json
            return entityName switch
            {
                "Inventoryadjustment" => "Inventory_Adjustment",
                _ => entityName
            };
        }

        private string ExtractEntityId(string path)
        {
            try
            {
                var match = Regex.Match(path, @"^/api/[^/]+/([^/]+)");
                return match.Success && !string.IsNullOrEmpty(match.Groups[1].Value) ? match.Groups[1].Value : "0";
            }
            catch
            {
                return "0";
            }
        }
    }
}
