using backend.DTO;
using backend.Repository;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

namespace backend.Services
{
    public class AiService
    {
        private readonly StatisticsService _statisticsService;
        private readonly ReportsService _reportsService;
        private readonly ProductService _productService;
        private readonly CustomerService _customerService;
        private readonly InventoryService _inventoryService;
        private readonly PromotionService _promotionService;
        private readonly OrderService _orderService;
        private readonly CategoryService _categoryService;
        private readonly SupplierService _supplierService;
        private readonly AiRepository _aiRepository;
        private readonly IConfiguration _config;
        private readonly ChatClient _chatClient;

        public AiService(
            StatisticsService statisticsService,
            ReportsService reportsService,
            ProductService productService,
            CustomerService customerService,
            InventoryService inventoryService,
            PromotionService promotionService,
            OrderService orderService,
            CategoryService categoryService,
            SupplierService supplierService,
            AiRepository aiRepository,
            IConfiguration config)
        {
            _statisticsService = statisticsService;
            _reportsService = reportsService;
            _productService = productService;
            _customerService = customerService;
            _inventoryService = inventoryService;
            _promotionService = promotionService;
            _orderService = orderService;
            _categoryService = categoryService;
            _supplierService = supplierService;
            _aiRepository = aiRepository;
            _config = config;

            // Khởi tạo ChatClient với custom endpoint (Chutes.ai)
            var apiKey = config["Chutes:ApiKey"] ?? "";
            var endpoint = new Uri("https://llm.chutes.ai/v1");
            var model = "zai-org/GLM-4.6";

            _chatClient = new ChatClient(
                model: model,
                credential: new ApiKeyCredential(apiKey),
                options: new OpenAIClientOptions { Endpoint = endpoint }
            );
        }

        // ===== PUBLIC METHODS =====

        public async Task<AiChatResponseDTO> ChatAsync(string userMessage, int userId, int? conversationId = null)
        {
            // Non-streaming version - đơn giản hơn
            try
            {
                var (convId, messages, tools) = await PrepareConversationAsync(userMessage, userId, conversationId);

                var options = new ChatCompletionOptions();
                foreach (var tool in tools)
                {
                    options.Tools.Add(tool);
                }

                var completion = await _chatClient.CompleteChatAsync(messages, options);
                var response = await ProcessCompletionAsync(completion.Value, messages, options, convId);

                return new AiChatResponseDTO
                {
                    Success = true,
                    Response = response,
                    ConversationId = convId
                };
            }
            catch (Exception ex)
            {
                return new AiChatResponseDTO
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async IAsyncEnumerable<string> ChatStreamAsync(
            string userMessage,
            int userId,
            int? conversationId = null,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            // 1. Chuẩn bị conversation và context
            var (convId, messages, tools) = await PrepareConversationAsync(userMessage, userId, conversationId);

            // 2. Gửi convId ngay lập tức
            yield return $"convId:{convId}|";

            // 3. Tạo options với tools
            var options = new ChatCompletionOptions();
            foreach (var tool in tools)
            {
                options.Tools.Add(tool);
            }

            // 4. Loop xử lý (có thể có nhiều vòng nếu AI gọi tool)
            bool requiresAction = true;
            int loopCount = 0;
            const int MAX_LOOPS = 5;
            var fullResponse = new StringBuilder();
            string? errorMessage = null;

            while (requiresAction && loopCount < MAX_LOOPS && errorMessage == null)
            {
                loopCount++;
                requiresAction = false;

                var contentBuilder = new StringBuilder();
                var toolCallsBuilder = new StreamingChatToolCallsBuilder();
                var streamedChunks = new List<string>();

                try
                {
                    // Gọi API streaming - gom chunks vào list trước
                    await foreach (var update in _chatClient.CompleteChatStreamingAsync(messages, options, cancellationToken))
                    {
                        // Xử lý content
                        foreach (var contentPart in update.ContentUpdate)
                        {
                            if (!string.IsNullOrEmpty(contentPart.Text))
                            {
                                contentBuilder.Append(contentPart.Text);
                                streamedChunks.Add(contentPart.Text);
                            }
                        }

                        // Gom tool calls
                        foreach (var toolCallUpdate in update.ToolCallUpdates)
                        {
                            toolCallsBuilder.Append(toolCallUpdate);
                        }
                    }
                }
                catch (Exception ex)
                {
                    errorMessage = ex.Message;
                }

                // Yield các chunks đã stream (ngoài try-catch)
                foreach (var chunk in streamedChunks)
                {
                    yield return chunk;
                }

                if (errorMessage != null)
                {
                    yield return $"\n[Lỗi: {errorMessage}]";
                    yield break;
                }

                // Build tool calls từ stream
                var toolCalls = toolCallsBuilder.Build();

                if (toolCalls.Count > 0)
                {
                    // Có tool calls -> cần xử lý
                    requiresAction = true;

                    // Thêm assistant message với tool calls vào history
                    var assistantMessage = new AssistantChatMessage(toolCalls);
                    if (contentBuilder.Length > 0)
                    {
                        assistantMessage.Content.Add(ChatMessageContentPart.CreateTextPart(contentBuilder.ToString()));
                    }
                    messages.Add(assistantMessage);

                    // Thực thi từng tool và thêm kết quả
                    foreach (var toolCall in toolCalls)
                    {
                        var result = await ExecuteToolCallAsync(toolCall);
                        messages.Add(new ToolChatMessage(toolCall.Id, result));
                    }

                    // Tiếp tục loop để AI đọc kết quả tool
                }
                else
                {
                    // Không có tool calls -> đây là response cuối cùng
                    fullResponse.Append(contentBuilder);
                }
            }

            // Lưu response vào DB
            if (fullResponse.Length > 0)
            {
                await _aiRepository.AddMessageAsync(convId, "assistant", fullResponse.ToString());
            }
        }

        // ===== HELPER METHODS =====

        private async Task<(int convId, List<ChatMessage> messages, List<ChatTool> tools)> PrepareConversationAsync(
            string userMessage, int userId, int? conversationId)
        {
            // Quản lý conversation
            int convId;
            if (conversationId.HasValue)
            {
                convId = conversationId.Value;
            }
            else
            {
                var title = userMessage.Length > 50 ? userMessage[..50] + "..." : userMessage;
                var conversation = await _aiRepository.CreateConversationAsync(userId, title);
                convId = conversation.Id;
            }

            // Lưu user message
            await _aiRepository.AddMessageAsync(convId, "user", userMessage);

            // Build messages
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(GetSystemPrompt())
            };

            // Thêm history
            var history = await _aiRepository.GetMessagesByConversationIdAsync(convId, 20);
            foreach (var msg in history.SkipLast(1)) // Bỏ tin user vừa insert
            {
                if (!string.IsNullOrEmpty(msg.Content))
                {
                    if (msg.Role == "user")
                        messages.Add(new UserChatMessage(msg.Content));
                    else if (msg.Role == "assistant")
                        messages.Add(new AssistantChatMessage(msg.Content));
                }
            }

            // Thêm current message
            messages.Add(new UserChatMessage(userMessage));

            // Tạo tools
            var tools = GetToolDefinitions();

            return (convId, messages, tools);
        }

        private async Task<string> ProcessCompletionAsync(
            ChatCompletion completion,
            List<ChatMessage> messages,
            ChatCompletionOptions options,
            int convId)
        {
            // Loop xử lý tool calls
            bool requiresAction = true;
            int loopCount = 0;
            const int MAX_LOOPS = 5;

            while (requiresAction && loopCount < MAX_LOOPS)
            {
                loopCount++;
                requiresAction = false;

                if (completion.FinishReason == ChatFinishReason.ToolCalls)
                {
                    // Thêm assistant message với tool calls
                    messages.Add(new AssistantChatMessage(completion));

                    // Thực thi tools
                    foreach (var toolCall in completion.ToolCalls)
                    {
                        var result = await ExecuteToolCallAsync(toolCall);
                        messages.Add(new ToolChatMessage(toolCall.Id, result));
                    }

                    // Gọi lại API
                    var nextCompletion = await _chatClient.CompleteChatAsync(messages, options);
                    completion = nextCompletion.Value;
                    requiresAction = true;
                }
            }

            // Lấy response cuối cùng
            var response = completion.Content.Count > 0 ? completion.Content[0].Text : "";

            // Lưu vào DB
            if (!string.IsNullOrEmpty(response))
            {
                await _aiRepository.AddMessageAsync(convId, "assistant", response);
            }

            return response ?? "";
        }

        private async Task<string> ExecuteToolCallAsync(ChatToolCall toolCall)
        {
            try
            {
                var functionName = toolCall.FunctionName;
                var args = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(toolCall.FunctionArguments.ToString());
                var result = await ExecuteFunctionAsync(functionName, args);
                return JsonSerializer.Serialize(result);
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { error = ex.Message });
            }
        }

        private async Task<object> ExecuteFunctionAsync(string functionName, Dictionary<string, JsonElement>? args)
        {
            return functionName switch
            {
                // 1. PRODUCTS
                "query_products" => await ExecuteQueryProductsAsync(args),

                // 2. CATEGORIES  
                "query_categories" => await ExecuteQueryCategoriesAsync(args),

                // 3. CUSTOMERS
                "query_customers" => await ExecuteQueryCustomersAsync(args),

                // 4. ORDERS
                "query_orders" => await ExecuteQueryOrdersAsync(args),

                // 5. PROMOTIONS
                "query_promotions" => await ExecuteQueryPromotionsAsync(args),

                // 6. SUPPLIERS
                "query_suppliers" => await ExecuteQuerySuppliersAsync(args),

                // 7. STATISTICS
                "get_statistics" => await ExecuteGetStatisticsAsync(args),

                // 8. REPORTS
                "get_reports" => await ExecuteGetReportsAsync(args),

                _ => new { error = $"Function '{functionName}' not supported" }
            };
        }

        // ===== TOOL EXECUTION METHODS =====

        private async Task<object> ExecuteQueryProductsAsync(Dictionary<string, JsonElement>? args)
        {
            var keyword = GetStringArg(args, "keyword", null);
            var categoryId = GetNullableIntArg(args, "category_id");
            var supplierId = GetNullableIntArg(args, "supplier_id");
            var minPrice = GetNullableDecimalArg(args, "min_price");
            var maxPrice = GetNullableDecimalArg(args, "max_price");
            var inStock = GetNullableBoolArg(args, "in_stock");
            var isActive = GetNullableBoolArg(args, "is_active");
            var limit = GetIntArg(args, "limit", 20);

            // Convert inStock/isActive to status if needed
            int? status = null;
            if (isActive.HasValue)
                status = isActive.Value ? 1 : 0;

            var result = await _productService.GetPaginatedProductsAsync(
                page: 1,
                pageSize: limit,
                search: keyword,
                categoryId: categoryId,
                supplierId: supplierId,
                minPrice: minPrice,
                maxPrice: maxPrice,
                sortBy: "",
                status: status
            );

            // Filter by inStock if specified (check Inventory.Quantity)
            var items = result.Items;
            if (inStock.HasValue)
            {
                items = inStock.Value 
                    ? items.Where(p => p.Inventory != null && p.Inventory.Quantity > 0).ToList()
                    : items.Where(p => p.Inventory == null || p.Inventory.Quantity <= 0).ToList();
            }

            return new { 
                total = result.TotalItems,
                products = items
            };
        }

        private async Task<object> ExecuteQueryCategoriesAsync(Dictionary<string, JsonElement>? args)
        {
            var keyword = GetStringArg(args, "keyword", null);
            var isActive = GetNullableBoolArg(args, "is_active");
            var limit = GetIntArg(args, "limit", 50);

            string? status = isActive.HasValue ? (isActive.Value ? "active" : "inactive") : null;

            var result = await _categoryService.GetFilteredAndPaginatedAsync(
                page: 1,
                pageSize: limit,
                keyword: keyword,
                status: status
            );

            return new {
                total = result.TotalItems,
                categories = result.Items
            };
        }

        private async Task<object> ExecuteQueryCustomersAsync(Dictionary<string, JsonElement>? args)
        {
            var keyword = GetStringArg(args, "keyword", null);
            var isActive = GetNullableBoolArg(args, "is_active");
            var limit = GetIntArg(args, "limit", 20);

            string? status = isActive.HasValue ? (isActive.Value ? "active" : "inactive") : null;

            var result = await _customerService.GetFilteredAndPaginatedAsync(
                page: 1,
                pageSize: limit,
                keyword: keyword,
                status: status
            );

            return new {
                total = result.TotalItems,
                customers = result.Items
            };
        }

        private async Task<object> ExecuteQueryOrdersAsync(Dictionary<string, JsonElement>? args)
        {
            var orderId = GetNullableIntArg(args, "order_id");
            var status = GetStringArg(args, "status", null);
            var dateFromStr = GetStringArg(args, "date_from", null);
            var dateToStr = GetStringArg(args, "date_to", null);
            var keyword = GetStringArg(args, "keyword", null);
            var limit = GetIntArg(args, "limit", 20);

            // Nếu có order_id cụ thể, lấy chi tiết đơn hàng đó
            if (orderId.HasValue)
            {
                var orderDetail = await _orderService.MapToDTOAsync(orderId.Value);
                if (orderDetail == null)
                    return new { error = $"Không tìm thấy đơn hàng #{orderId}" };
                return new { order = orderDetail };
            }

            // Parse dates
            DateTime? startDate = null;
            DateTime? endDate = null;
            if (!string.IsNullOrEmpty(dateFromStr) && DateTime.TryParse(dateFromStr, out var df))
                startDate = df;
            if (!string.IsNullOrEmpty(dateToStr) && DateTime.TryParse(dateToStr, out var dt))
                endDate = dt;

            var result = await _orderService.GetPagedOrdersAsync(
                pageNumber: 1,
                pageSize: limit,
                status: status,
                startDate: startDate,
                endDate: endDate,
                search: keyword
            );

            return new {
                total = result.TotalItems,
                orders = result.Items
            };
        }

        private async Task<object> ExecuteQueryPromotionsAsync(Dictionary<string, JsonElement>? args)
        {
            var keyword = GetStringArg(args, "keyword", null);
            var code = GetStringArg(args, "code", null);
            var status = GetStringArg(args, "status", null); // active, inactive, expired
            var type = GetStringArg(args, "type", null);
            var limit = GetIntArg(args, "limit", 20);

            // Nếu có code cụ thể, tìm promotion đó
            if (!string.IsNullOrEmpty(code))
            {
                var promotion = await _promotionService.GetPromotionByCodeAsync(code);
                if (promotion == null)
                    return new { error = $"Không tìm thấy khuyến mãi với mã '{code}'" };
                return new { promotion };
            }

            var result = await _promotionService.GetPaginatedPromotionsAsync(
                page: 1,
                pageSize: limit,
                search: keyword,
                status: status,
                type: type
            );

            return new {
                total = result.TotalItems,
                promotions = result.Items
            };
        }

        private async Task<object> ExecuteQuerySuppliersAsync(Dictionary<string, JsonElement>? args)
        {
            var keyword = GetStringArg(args, "keyword", null);
            var limit = GetIntArg(args, "limit", 50);

            var result = await _supplierService.GetPaginatedAsync(
                page: 1,
                pageSize: limit,
                search: keyword
            );

            return new {
                total = result.TotalItems,
                suppliers = result.Items
            };
        }

        private async Task<object> ExecuteGetStatisticsAsync(Dictionary<string, JsonElement>? args)
        {
            var type = GetStringArg(args, "type", "overview");
            var days = GetIntArg(args, "days", 7);
            var limit = GetIntArg(args, "limit", 10);
            var threshold = GetIntArg(args, "threshold", 10);

            return type switch
            {
                "overview" => await _statisticsService.GetOverviewStatsAsync(),
                "revenue" => await _statisticsService.GetRevenueByPeriodAsync(days),
                "best_sellers" => await _statisticsService.GetBestSellersAsync(limit, days),
                "low_stock" => await _statisticsService.GetLowStockProductsAsync(threshold),
                "order_stats" => await _statisticsService.GetOrderStatsAsync(days),
                _ => new { error = $"Loại thống kê '{type}' không hỗ trợ. Dùng: overview, revenue, best_sellers, low_stock, order_stats" }
            };
        }

        private async Task<object> ExecuteGetReportsAsync(Dictionary<string, JsonElement>? args)
        {
            var type = GetStringArg(args, "type", "sales_summary");
            var dateFromStr = GetStringArg(args, "date_from", null);
            var dateToStr = GetStringArg(args, "date_to", null);
            var limit = GetIntArg(args, "limit", 10);

            // Parse dates với default
            DateTime dateTo = DateTime.UtcNow;
            DateTime dateFrom = dateTo.AddDays(-30);

            if (!string.IsNullOrEmpty(dateFromStr) && DateTime.TryParse(dateFromStr, out var df))
                dateFrom = df;
            if (!string.IsNullOrEmpty(dateToStr) && DateTime.TryParse(dateToStr, out var dt))
                dateTo = dt;

            return type switch
            {
                "sales_summary" => await _reportsService.GetSalesSummaryAsync(dateFrom, dateTo),
                "top_products" => await _reportsService.GetTopProductsAsync(dateFrom, dateTo, limit),
                "top_customers" => await _reportsService.GetTopCustomersAsync(dateFrom, dateTo, limit),
                "revenue_by_day" => await _reportsService.GetRevenueByDayAsync(dateFrom, dateTo),
                _ => new { error = $"Loại báo cáo '{type}' không hỗ trợ. Dùng: sales_summary, top_products, top_customers, revenue_by_day" }
            };
        }

        // ===== ARGUMENT HELPERS =====

        private static int? GetNullableIntArg(Dictionary<string, JsonElement>? args, string key)
        {
            if (args != null && args.TryGetValue(key, out var val))
            {
                if (val.ValueKind == JsonValueKind.Number) return val.GetInt32();
                if (val.ValueKind == JsonValueKind.String && int.TryParse(val.GetString(), out int i)) return i;
            }
            return null;
        }

        private static decimal? GetNullableDecimalArg(Dictionary<string, JsonElement>? args, string key)
        {
            if (args != null && args.TryGetValue(key, out var val))
            {
                if (val.ValueKind == JsonValueKind.Number) return val.GetDecimal();
                if (val.ValueKind == JsonValueKind.String && decimal.TryParse(val.GetString(), out decimal d)) return d;
            }
            return null;
        }

        private static bool? GetNullableBoolArg(Dictionary<string, JsonElement>? args, string key)
        {
            if (args != null && args.TryGetValue(key, out var val))
            {
                if (val.ValueKind == JsonValueKind.True) return true;
                if (val.ValueKind == JsonValueKind.False) return false;
                if (val.ValueKind == JsonValueKind.String)
                {
                    var str = val.GetString()?.ToLower();
                    if (str == "true" || str == "1") return true;
                    if (str == "false" || str == "0") return false;
                }
            }
            return null;
        }

        private static int GetIntArg(Dictionary<string, JsonElement>? args, string key, int defaultValue)
        {
            if (args != null && args.TryGetValue(key, out var val))
            {
                if (val.ValueKind == JsonValueKind.Number) return val.GetInt32();
                if (val.ValueKind == JsonValueKind.String && int.TryParse(val.GetString(), out int i)) return i;
            }
            return defaultValue;
        }

        private static string? GetStringArg(Dictionary<string, JsonElement>? args, string key, string? defaultValue)
        {
            if (args != null && args.TryGetValue(key, out var val))
                return val.GetString() ?? defaultValue;
            return defaultValue;
        }

        private static decimal GetDecimalArg(Dictionary<string, JsonElement>? args, string key, decimal defaultValue)
        {
            if (args != null && args.TryGetValue(key, out var val))
            {
                if (val.ValueKind == JsonValueKind.Number) return val.GetDecimal();
                if (val.ValueKind == JsonValueKind.String && decimal.TryParse(val.GetString(), out decimal d)) return d;
            }
            return defaultValue;
        }

        // ===== SYSTEM PROMPT =====

        private static string GetSystemPrompt()
        {
            return @"Bạn là trợ lý AI cho hệ thống quản lý cửa hàng POS. Bạn có thể giúp:

- **Sản phẩm**: Tìm kiếm, xem danh sách, lọc theo danh mục/giá/tồn kho
- **Danh mục**: Xem tất cả danh mục sản phẩm
- **Khách hàng**: Tìm kiếm, xem thông tin khách hàng
- **Đơn hàng**: Xem đơn hàng gần đây, tìm theo ID/trạng thái/ngày
- **Khuyến mãi**: Xem khuyến mãi đang hoạt động, tìm theo mã
- **Nhà cung cấp**: Xem danh sách nhà cung cấp
- **Thống kê**: Doanh thu, sản phẩm bán chạy, tồn kho thấp, thống kê đơn hàng
- **Báo cáo**: Top sản phẩm, top khách hàng, doanh thu theo ngày

Hướng dẫn:
1. Sử dụng các function có sẵn để lấy dữ liệu
2. Trả lời ngắn gọn, rõ ràng bằng tiếng Việt
3. Định dạng tiền tệ theo VND (vd: 1.000.000đ)
4. Nếu không có dữ liệu, thông báo cho người dùng
5. Khi người dùng hỏi về danh mục, sử dụng query_categories
6. Khi người dùng hỏi về sản phẩm, sử dụng query_products";
        }

        // ===== TOOL DEFINITIONS (8 Domain-based Tools) =====

        private static List<ChatTool> GetToolDefinitions()
        {
            return new List<ChatTool>
            {
                // 1. PRODUCTS - Query sản phẩm với filter mạnh
                ChatTool.CreateFunctionTool(
                    functionName: "query_products",
                    functionDescription: "Tìm kiếm và lọc sản phẩm. Dùng để: xem danh sách sản phẩm, tìm sản phẩm theo tên/danh mục/giá, kiểm tra sản phẩm còn hàng",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "keyword": {
                                "type": "string",
                                "description": "Từ khóa tìm kiếm theo tên sản phẩm"
                            },
                            "category_id": {
                                "type": "integer",
                                "description": "Lọc theo ID danh mục"
                            },
                            "supplier_id": {
                                "type": "integer",
                                "description": "Lọc theo ID nhà cung cấp"
                            },
                            "min_price": {
                                "type": "number",
                                "description": "Giá tối thiểu"
                            },
                            "max_price": {
                                "type": "number",
                                "description": "Giá tối đa"
                            },
                            "in_stock": {
                                "type": "boolean",
                                "description": "Chỉ lấy sản phẩm còn hàng (true) hoặc hết hàng (false)"
                            },
                            "is_active": {
                                "type": "boolean",
                                "description": "Lọc theo trạng thái hoạt động"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả tối đa (mặc định 20)"
                            }
                        }
                    }
                    """)
                ),

                // 2. CATEGORIES - Query danh mục
                ChatTool.CreateFunctionTool(
                    functionName: "query_categories",
                    functionDescription: "Lấy danh sách danh mục sản phẩm. Dùng để: xem tất cả danh mục, tìm danh mục theo tên",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "keyword": {
                                "type": "string",
                                "description": "Từ khóa tìm kiếm theo tên danh mục"
                            },
                            "is_active": {
                                "type": "boolean",
                                "description": "Lọc theo trạng thái hoạt động"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả tối đa (mặc định 50)"
                            }
                        }
                    }
                    """)
                ),

                // 3. CUSTOMERS - Query khách hàng
                ChatTool.CreateFunctionTool(
                    functionName: "query_customers",
                    functionDescription: "Tìm kiếm khách hàng. Dùng để: xem danh sách khách hàng, tìm khách hàng theo tên/SĐT",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "keyword": {
                                "type": "string",
                                "description": "Từ khóa tìm kiếm (tên, email, SĐT)"
                            },
                            "is_active": {
                                "type": "boolean",
                                "description": "Lọc theo trạng thái hoạt động"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả tối đa (mặc định 20)"
                            }
                        }
                    }
                    """)
                ),

                // 4. ORDERS - Query đơn hàng
                ChatTool.CreateFunctionTool(
                    functionName: "query_orders",
                    functionDescription: "Tìm kiếm đơn hàng. Dùng để: xem đơn hàng gần đây, tìm đơn theo ID/trạng thái/khách hàng/ngày",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "order_id": {
                                "type": "integer",
                                "description": "ID đơn hàng cụ thể cần xem chi tiết"
                            },
                            "customer_id": {
                                "type": "integer",
                                "description": "Lọc theo ID khách hàng"
                            },
                            "status": {
                                "type": "string",
                                "description": "Lọc theo trạng thái: pending, completed, cancelled"
                            },
                            "date_from": {
                                "type": "string",
                                "description": "Ngày bắt đầu (yyyy-MM-dd)"
                            },
                            "date_to": {
                                "type": "string",
                                "description": "Ngày kết thúc (yyyy-MM-dd)"
                            },
                            "keyword": {
                                "type": "string",
                                "description": "Từ khóa tìm kiếm"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả tối đa (mặc định 20)"
                            }
                        }
                    }
                    """)
                ),

                // 5. PROMOTIONS - Query khuyến mãi
                ChatTool.CreateFunctionTool(
                    functionName: "query_promotions",
                    functionDescription: "Tìm kiếm khuyến mãi. Dùng để: xem khuyến mãi đang hoạt động, tìm theo mã code, kiểm tra khuyến mãi hết hạn",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "keyword": {
                                "type": "string",
                                "description": "Từ khóa tìm kiếm theo tên"
                            },
                            "code": {
                                "type": "string",
                                "description": "Mã khuyến mãi cụ thể"
                            },
                            "status": {
                                "type": "string",
                                "enum": ["active", "inactive", "expired"],
                                "description": "Trạng thái: active (đang hoạt động), inactive (bị tắt), expired (hết hạn)"
                            },
                            "type": {
                                "type": "string",
                                "description": "Loại khuyến mãi: percent, fixed"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả tối đa (mặc định 20)"
                            }
                        }
                    }
                    """)
                ),

                // 6. SUPPLIERS - Query nhà cung cấp
                ChatTool.CreateFunctionTool(
                    functionName: "query_suppliers",
                    functionDescription: "Lấy danh sách nhà cung cấp. Dùng để: xem tất cả NCC, tìm NCC theo tên",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "keyword": {
                                "type": "string",
                                "description": "Từ khóa tìm kiếm theo tên nhà cung cấp"
                            },
                            "is_active": {
                                "type": "boolean",
                                "description": "Lọc theo trạng thái hoạt động"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả tối đa (mặc định 50)"
                            }
                        }
                    }
                    """)
                ),

                // 7. STATISTICS - Thống kê tổng hợp
                ChatTool.CreateFunctionTool(
                    functionName: "get_statistics",
                    functionDescription: "Lấy các thống kê kinh doanh. Dùng để: xem tổng quan, doanh thu, sản phẩm bán chạy, tồn kho thấp, thống kê đơn hàng",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "enum": ["overview", "revenue", "best_sellers", "low_stock", "order_stats"],
                                "description": "Loại thống kê: overview (tổng quan), revenue (doanh thu), best_sellers (bán chạy), low_stock (sắp hết), order_stats (đơn hàng)"
                            },
                            "days": {
                                "type": "integer",
                                "description": "Số ngày để tính (mặc định 7)"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả (cho best_sellers, mặc định 10)"
                            },
                            "threshold": {
                                "type": "integer",
                                "description": "Ngưỡng tồn kho (cho low_stock, mặc định 10)"
                            }
                        },
                        "required": ["type"]
                    }
                    """)
                ),

                // 8. REPORTS - Báo cáo chi tiết
                ChatTool.CreateFunctionTool(
                    functionName: "get_reports",
                    functionDescription: "Lấy báo cáo chi tiết. Dùng để: báo cáo doanh thu, top sản phẩm, top khách hàng theo khoảng thời gian",
                    functionParameters: BinaryData.FromString("""
                    {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "enum": ["sales_summary", "top_products", "top_customers", "revenue_by_day"],
                                "description": "Loại báo cáo: sales_summary (tổng hợp bán hàng), top_products (SP bán chạy), top_customers (KH mua nhiều), revenue_by_day (doanh thu theo ngày)"
                            },
                            "date_from": {
                                "type": "string",
                                "description": "Ngày bắt đầu (yyyy-MM-dd), mặc định 30 ngày trước"
                            },
                            "date_to": {
                                "type": "string",
                                "description": "Ngày kết thúc (yyyy-MM-dd), mặc định hôm nay"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Số lượng kết quả (mặc định 10)"
                            }
                        },
                        "required": ["type"]
                    }
                    """)
                )
            };
        }

        // ===== CONVERSATION MANAGEMENT =====

        public async Task<List<AiConversationDTO>> GetConversationsAsync(int userId)
        {
            var conversations = await _aiRepository.GetConversationsByUserIdAsync(userId);
            return conversations.Select(c => new AiConversationDTO
            {
                Id = c.Id,
                Title = c.Title,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList();
        }

        public async Task<AiConversationDTO?> GetConversationAsync(int conversationId, int userId)
        {
            var conversation = await _aiRepository.GetConversationByIdAsync(conversationId, userId);
            if (conversation == null) return null;

            return new AiConversationDTO
            {
                Id = conversation.Id,
                Title = conversation.Title,
                CreatedAt = conversation.CreatedAt,
                UpdatedAt = conversation.UpdatedAt,
                Messages = conversation.Messages.Select(m => new AiMessageDTO
                {
                    Id = m.Id,
                    Role = m.Role,
                    Content = m.Content,
                    FunctionCalled = m.FunctionCalled,
                    Data = string.IsNullOrEmpty(m.FunctionData) ? null : JsonSerializer.Deserialize<object>(m.FunctionData),
                    CreatedAt = m.CreatedAt
                }).ToList()
            };
        }

        public async Task DeleteConversationAsync(int conversationId, int userId)
        {
            await _aiRepository.DeleteConversationAsync(conversationId, userId);
        }
    }

    // Helper class để gom tool calls từ stream
    public class StreamingChatToolCallsBuilder
    {
        private readonly Dictionary<int, (string Id, string Name, StringBuilder Arguments)> _toolCalls = new();

        public void Append(StreamingChatToolCallUpdate update)
        {
            var index = update.Index;

            if (!_toolCalls.ContainsKey(index))
            {
                _toolCalls[index] = ("", "", new StringBuilder());
            }

            var current = _toolCalls[index];

            if (!string.IsNullOrEmpty(update.ToolCallId))
            {
                current.Id = update.ToolCallId;
            }

            if (!string.IsNullOrEmpty(update.FunctionName))
            {
                current.Name = update.FunctionName;
            }

            if (!string.IsNullOrEmpty(update.FunctionArgumentsUpdate?.ToString()))
            {
                current.Arguments.Append(update.FunctionArgumentsUpdate.ToString());
            }

            _toolCalls[index] = current;
        }

        public IReadOnlyList<ChatToolCall> Build()
        {
            var result = new List<ChatToolCall>();

            foreach (var kvp in _toolCalls.OrderBy(x => x.Key))
            {
                var (id, name, args) = kvp.Value;
                if (!string.IsNullOrEmpty(id) && !string.IsNullOrEmpty(name))
                {
                    result.Add(ChatToolCall.CreateFunctionToolCall(id, name, BinaryData.FromString(args.ToString())));
                }
            }

            return result;
        }
    }
}
