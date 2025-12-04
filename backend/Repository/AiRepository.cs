using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class AiRepository
    {
        private readonly AppDbContext _context;

        public AiRepository(AppDbContext context)
        {
            _context = context;
        }

        // Conversations
        public async Task<List<AiConversation>> GetConversationsByUserIdAsync(int userId, int limit = 20)
        {
            return await _context.AiConversations
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<AiConversation?> GetConversationByIdAsync(int id, int userId)
        {
            return await _context.AiConversations
                .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        }

        public async Task<AiConversation> CreateConversationAsync(int userId, string? title = null)
        {
            var conversation = new AiConversation
            {
                UserId = userId,
                Title = title,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AiConversations.Add(conversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task UpdateConversationTitleAsync(int id, string title)
        {
            var conversation = await _context.AiConversations.FindAsync(id);
            if (conversation != null)
            {
                conversation.Title = title;
                conversation.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteConversationAsync(int id, int userId)
        {
            var conversation = await _context.AiConversations
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            
            if (conversation != null)
            {
                _context.AiConversations.Remove(conversation);
                await _context.SaveChangesAsync();
            }
        }

        // Messages
        public async Task<AiMessage> AddMessageAsync(int conversationId, string role, string content, string? functionCalled = null, string? functionData = null)
        {
            var message = new AiMessage
            {
                ConversationId = conversationId,
                Role = role,
                Content = content,
                FunctionCalled = functionCalled,
                FunctionData = functionData,
                CreatedAt = DateTime.UtcNow
            };

            _context.AiMessages.Add(message);

            // Update conversation's UpdatedAt
            var conversation = await _context.AiConversations.FindAsync(conversationId);
            if (conversation != null)
            {
                conversation.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<List<AiMessage>> GetMessagesByConversationIdAsync(int conversationId, int limit = 50)
        {
            return await _context.AiMessages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }
    }
}
