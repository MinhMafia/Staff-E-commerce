using backend.Models;
using backend.Repository;
using Microsoft.Extensions.Configuration;
using System.Text;

namespace backend.Services
{
    public class ActivityLogService
    {
        private readonly ActivityLogRepository _logRepo;
        private readonly IConfiguration _config;

        public ActivityLogService(ActivityLogRepository logRepo, IConfiguration config)
        {
            _logRepo = logRepo;
            _config = config;
        }

        public async Task LogAsync(
            int userId,
            string action,
            string entityType,
            string entityId,
            string? payload,
            string ipAddress)
        {
            var log = new ActivityLog
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Payload = payload,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };

            await _logRepo.AddLogAsync(log);

            string logPath = _config[$"LogFiles:{entityType}"];
            if (string.IsNullOrEmpty(logPath))
                logPath = _config["LogFiles:Default"] ?? "Logs/activity_log.txt";

            string? logDir = Path.GetDirectoryName(logPath);
            if (!string.IsNullOrEmpty(logDir) && !Directory.Exists(logDir))
                Directory.CreateDirectory(logDir);

            // Ghi log
            string logLine = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [User:{userId}] [Action:{action}] [Entity:{entityType}#{entityId}] [IP:{ipAddress}] {payload}";
            await File.AppendAllTextAsync(logPath, logLine + Environment.NewLine, Encoding.UTF8);

            // 👉 Sau khi ghi xong, kiểm tra file có quá cũ / quá nặng không
            CleanUpOldLogs(logPath);
        }

        /// <summary>
        /// Xóa hoặc xoay file log nếu quá cũ hoặc quá nặng
        /// </summary>
        private void CleanUpOldLogs(string logPath)
        {
            try
            {
                var fileInfo = new FileInfo(logPath);

                if (!fileInfo.Exists) return;

                // Giới hạn: tuổi tối đa 7 ngày, dung lượng tối đa 5 MB
                TimeSpan maxAge = TimeSpan.FromDays(7);
                long maxSizeBytes = 5 * 1024 * 1024; // 5 MB

                bool isTooOld = DateTime.Now - fileInfo.LastWriteTime > maxAge;
                bool isTooBig = fileInfo.Length > maxSizeBytes;

                if (isTooOld || isTooBig)
                {
                    string archiveName = $"{Path.GetFileNameWithoutExtension(logPath)}_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
                    string archivePath = Path.Combine(fileInfo.DirectoryName!, "Archive", archiveName);

                    // Tạo thư mục Archive
                    Directory.CreateDirectory(Path.Combine(fileInfo.DirectoryName!, "Archive"));

                    // Di chuyển file sang thư mục lưu trữ
                    File.Move(logPath, archivePath, true);

                    // Tạo file mới
                    File.WriteAllText(logPath, $"[System] Log file rotated at {DateTime.Now}\n");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LogCleanupError] {ex.Message}");
            }
        }
    }
}
