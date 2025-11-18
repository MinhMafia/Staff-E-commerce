using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTO;
using backend.Models;
using backend.Repository;

namespace backend.Services
{
    public class CategoryService
    {
        private readonly CategoryRepository _repo;

        public CategoryService(CategoryRepository repo)
        {
            _repo = repo;
        }

        private CategoryDTO MapToDto(Category c)
        {
            return new CategoryDTO
            {
                Id = c.Id,
                Name = c.Name,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                IsActive = c.IsActive
            };
        }

        public async Task<List<CategoryDTO>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            return items.Select(MapToDto).ToList();
        }

        public async Task<CategoryDTO?> GetByIdAsync(int id)
        {
            var c = await _repo.GetByIdAsync(id);
            return c == null ? null : MapToDto(c);
        }

        // Paginated result: reuse your existing PaginationResult<T>
        public async Task<PaginationResult<CategoryDTO>> GetPaginatedAsync(int page, int pageSize, string? search)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            var (items, total) = await _repo.GetPaginatedAsync(page, pageSize, search);
            var dtoItems = items.Select(MapToDto).ToList();

            var totalPages = (int)Math.Ceiling((double)total / pageSize);

            return new PaginationResult<CategoryDTO>
            {
                Items = dtoItems,
                TotalItems = total,
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasPrevious = page > 1,
                HasNext = page < totalPages
            };
        }

        public async Task<CategoryDTO> CreateCategoryAsync(Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name))
                throw new ArgumentException("Category name is required");

            // check duplicate
            var exists = await _repo.ExistsByNameAsync(category.Name);
            if (exists)
                throw new ArgumentException("Category name already exists");

            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;
            var created = await _repo.CreateAsync(category);
            return MapToDto(created);
        }

        public async Task<CategoryDTO> UpdateCategoryAsync(Category category)
        {
            var existing = await _repo.GetByIdAsync(category.Id);
            if (existing == null)
                throw new ArgumentException("Category not found");

            if (string.IsNullOrWhiteSpace(category.Name))
                throw new ArgumentException("Category name is required");

            var duplicate = await _repo.ExistsByNameAsync(category.Name, category.Id);
            if (duplicate)
                throw new ArgumentException("Category name already exists");

            existing.Name = category.Name;
            existing.IsActive = category.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            var updated = await _repo.UpdateAsync(existing);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            return await _repo.DeleteAsync(id);
        }
    }
}
