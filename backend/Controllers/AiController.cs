using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services;
using backend.DTO;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly AiService _aiService;

        public AiController(AiService aiService)
        {
            _aiService = aiService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst("uid") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out int id))
                return id;
            return 0;
        }

        // POST api/ai/chat
        [HttpPost("chat")]
        public async Task<ActionResult<AiChatResponseDTO>> Chat([FromBody] AiChatRequestDTO request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                {
                    return BadRequest(new AiChatResponseDTO
                    {
                        Success = false,
                        Error = "Vui lòng nhập câu hỏi"
                    });
                }

                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new AiChatResponseDTO
                    {
                        Success = false,
                        Error = "Vui lòng đăng nhập"
                    });
                }

                var response = await _aiService.ChatAsync(request.Message, userId, request.ConversationId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AiChatResponseDTO
                {
                    Success = false,
                    Error = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // POST api/ai/stream
        [HttpPost("stream")]
        public async Task StreamChat([FromBody] AiChatRequestDTO request)
        {
            Response.Headers.Append("Content-Type", "text/event-stream");
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");

            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                var errorData = $"data: {System.Text.Json.JsonSerializer.Serialize(new { error = "Vui lòng đăng nhập" })}\n\n";
                await Response.WriteAsync(errorData);
                return;
            }

            try 
            {
                bool isFirstChunk = true;
                await foreach (var streamChunk in _aiService.ChatStreamAsync(request.Message, userId, request.ConversationId))
                {
                    // Chunk đầu tiên có format đặc biệt: "convId:123|nội dung" hoặc chỉ "nội dung"
                    if (isFirstChunk && streamChunk.StartsWith("convId:"))
                    {
                        var pipeIndex = streamChunk.IndexOf('|');
                        if (pipeIndex > 0)
                        {
                            var convIdStr = streamChunk.Substring(7, pipeIndex - 7);
                            var content = streamChunk.Substring(pipeIndex + 1);
                            
                            // Gửi conversationId riêng
                            var convIdData = $"data: {System.Text.Json.JsonSerializer.Serialize(new { conversationId = int.Parse(convIdStr) })}\n\n";
                            await Response.WriteAsync(convIdData);
                            await Response.Body.FlushAsync();
                            
                            // Gửi content nếu có
                            if (!string.IsNullOrEmpty(content))
                            {
                                var contentData = $"data: {System.Text.Json.JsonSerializer.Serialize(new { content = content })}\n\n";
                                await Response.WriteAsync(contentData);
                                await Response.Body.FlushAsync();
                            }
                            isFirstChunk = false;
                            continue;
                        }
                    }
                    
                    isFirstChunk = false;
                    var data = $"data: {System.Text.Json.JsonSerializer.Serialize(new { content = streamChunk })}\n\n";
                    await Response.WriteAsync(data);
                    await Response.Body.FlushAsync();
                }
            }
            catch (Exception ex)
            {
                var errorData = $"data: {System.Text.Json.JsonSerializer.Serialize(new { error = ex.Message })}\n\n";
                await Response.WriteAsync(errorData);
            }

            await Response.WriteAsync("data: [DONE]\n\n");
            await Response.Body.FlushAsync();
        }

        // GET api/ai/conversations
        [HttpGet("conversations")]
        public async Task<ActionResult<List<AiConversationDTO>>> GetConversations()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized();

                var conversations = await _aiService.GetConversationsAsync(userId);
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET api/ai/conversations/{id}
        [HttpGet("conversations/{id}")]
        public async Task<ActionResult<AiConversationDTO>> GetConversation(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized();

                var conversation = await _aiService.GetConversationAsync(id, userId);
                if (conversation == null)
                    return NotFound(new { error = "Không tìm thấy cuộc hội thoại" });

                return Ok(conversation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE api/ai/conversations/{id}
        [HttpDelete("conversations/{id}")]
        public async Task<ActionResult> DeleteConversation(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized();

                await _aiService.DeleteConversationAsync(id, userId);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET api/ai/health
        [HttpGet("health")]
        [AllowAnonymous]
        public ActionResult HealthCheck()
        {
            return Ok(new { status = "ok", message = "AI Service is running" });
        }
    }
}
