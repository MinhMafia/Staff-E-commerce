using backend.Models;
using backend.DTO;
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

            // 🔹 Tạo thư mục Logs root khi service khởi tạo
            string logRoot = Path.Combine(AppContext.BaseDirectory, "Logs");
            if (!Directory.Exists(logRoot))
            {
                Directory.CreateDirectory(logRoot);
                Console.WriteLine($"[ActivityLogService] Created root log directory: {logRoot}");
            }
        }

        public async Task LogAsync(
            int userId,
            string action,
            string entityType,
            string entityId,
            string? payload,
            string ipAddress)
        {
            // 1️⃣ Ghi vào database
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

            // 2️⃣ Lấy file log từ config
            string logPath = _config[$"LogFiles:{entityType}"];
            if (string.IsNullOrEmpty(logPath))
                logPath = _config["LogFiles:Default"] ?? "Logs/activity_log.txt";

            // 3️⃣ Tạo thư mục nếu chưa tồn tại
            string logDir = Path.GetDirectoryName(logPath) ?? "Logs";
            if (!Directory.Exists(logDir))
            {
                Directory.CreateDirectory(logDir);
                Console.WriteLine($"[ActivityLogService] Created log directory: {logDir}");
            }

            // 4️⃣ Ghi log vào file
            string logLine = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [User:{userId}] [Action:{action}] [Entity:{entityType}#{entityId}] [IP:{ipAddress}] {payload}";
            await File.AppendAllTextAsync(logPath, logLine + Environment.NewLine, Encoding.UTF8);
            Console.WriteLine($"[ActivityLogService] Logged to {logPath}");

            // 5️⃣ Xoay log nếu quá lớn/quá cũ
            CleanUpOldLogs(logPath);
        }

        private void CleanUpOldLogs(string logPath)
        {
            try
            {
                var fileInfo = new FileInfo(logPath);
                if (!fileInfo.Exists) return;

                TimeSpan maxAge = TimeSpan.FromDays(7);
                long maxSize = 5 * 1024 * 1024; // 5 MB

                bool tooOld = DateTime.Now - fileInfo.LastWriteTime > maxAge;
                bool tooBig = fileInfo.Length > maxSize;

                if (tooOld || tooBig)
                {
                    string archiveDir = Path.Combine(fileInfo.DirectoryName!, "Archive");
                    Directory.CreateDirectory(archiveDir);

                    string archiveFile = Path.Combine(archiveDir, $"{Path.GetFileNameWithoutExtension(fileInfo.Name)}_{DateTime.Now:yyyyMMdd_HHmmss}.txt");
                    File.Move(logPath, archiveFile, true);

                    File.WriteAllText(logPath, $"[System] Log rotated at {DateTime.Now}\n");
                    Console.WriteLine($"[ActivityLogService] Log rotated to {archiveFile}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ActivityLogService] Log cleanup error: {ex.Message}");
            }
        }

                 /// <summary>
        /// Lấy danh sách log có phân trang.
        /// </summary>
        public async Task<(List<ActivityLogCreateDTO> Logs, int TotalCount)> GetPagedLogsAsync(int page, int size)
        {
            return await _logRepo.GetPagedLogsAsync(page, size);
        }

        /// <summary>
        /// Lọc log theo user + khoảng thời gian (có phân trang).
        /// </summary>
        public async Task<(List<ActivityLogCreateDTO> Logs, int TotalCount)> GetFilteredLogsAsync(
            int page,
            int size,
            int? userId,
            DateTime? startDate,
            DateTime? endDate)
        {
            // Validation: nếu chỉ có endDate mà không có startDate → lỗi
            if (endDate.HasValue && !startDate.HasValue)
                throw new ArgumentException("Bạn cần chọn ngày bắt đầu nếu đã chọn ngày kết thúc.");

            // Validation: ngày bắt đầu > ngày kết thúc → lỗi
            if (startDate.HasValue && endDate.HasValue && startDate > endDate)
                throw new ArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");

            return await _logRepo.GetFilteredLogsAsync(page, size, userId, startDate, endDate);
        }


        

    }
}
