using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class UserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả user
        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users
                .OrderBy(u => u.Username)
                .ToListAsync();
        }

        // Lấy user theo Id
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        // Lấy user theo username
        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        // Lấy user theo email
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        // Thêm user mới
        public async Task<User> AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // Cập nhật user
        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // Xóa user
        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        // Kiểm tra tồn tại user theo Id
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Users.AnyAsync(u => u.Id == id);
        }
    }
    
}