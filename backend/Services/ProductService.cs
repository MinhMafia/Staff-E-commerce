using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using backend.Repository;
using backend.DTO;

namespace backend.Services
{
    public class ProductService
    {
        private readonly ProductRepository _productRepository;

        public ProductService(ProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<List<ProductDTO>> GetAllProductsAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return products.Select(MapToProductDto).ToList();
        }

        public async Task<List<ProductDTO>> GetFeaturedProductsAsync(int limit)
        {
            var products = await _productRepository.GetFeaturedProductsAsync(limit);
            return products.Select(MapToProductDto).ToList();
        }

        public async Task<List<ProductDTO>> GetBestSellerAsync(int limit)
        {
            var products = await _productRepository.GetBestSellerAsync(limit);
            return products.Select(MapToProductDto).ToList();
        }

        public async Task<List<ProductDTO>> GetBudgetProductAsync(int limit, decimal threshold = 1000m)
        {
            var products = await _productRepository.GetBudgetProductAsync(limit, threshold);
            return products.Select(MapToProductDto).ToList();
        }

        public async Task<PaginationResult<ProductDTO>> GetPaginatedProductsAsync(int page, int pageSize)
        {
            var result = await _productRepository.GetPaginatedAsync(page, pageSize);

            return new PaginationResult<ProductDTO>
            {
                Items = result.Items.Select(MapToProductDto).ToList(),
                TotalItems = result.TotalItems,
                CurrentPage = result.CurrentPage,
                PageSize = result.PageSize,
                TotalPages = result.TotalPages,
                HasPrevious = result.HasPrevious,
                HasNext = result.HasNext
            };
        }

        public async Task<ProductDTO?> GetProductByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Product ID must be greater than 0", nameof(id));

            var product = await _productRepository.GetByIdAsync(id);
            return product != null ? MapToProductDto(product) : null;
        }

        public async Task<ProductDTO> CreateProductAsync(Product product)
        {
            if (string.IsNullOrWhiteSpace(product.ProductName))
                throw new ArgumentException("Product name is required", nameof(product.ProductName));

            if (product.Price <= 0)
                throw new ArgumentException("Product price must be greater than 0", nameof(product.Price));

            // set timestamps (repository may override)
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;

            var created = await _productRepository.CreateAsync(product);
            return MapToProductDto(created);
        }

        public async Task<ProductDTO> UpdateProductAsync(Product product)
        {
            var existing = await _productRepository.GetByIdForUpdateAsync(product.Id);
            if (existing == null)
                throw new ArgumentException("Product not found", nameof(product.Id));

            // keep createdAt from existing if not provided
            product.CreatedAt = existing.CreatedAt;
            product.UpdatedAt = DateTime.UtcNow;

            var updated = await _productRepository.UpdateAsync(product);
            return MapToProductDto(updated);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            if (id <= 0) throw new ArgumentException("Product ID must be greater than 0", nameof(id));
            return await _productRepository.DeleteAsync(id);
        }

        public async Task<List<ProductDTO>> GetProductsBySupplierAsync(int supplierId)
        {
            var products = await _productRepository.GetBySupplierAsync(supplierId);
            return products.Select(MapToProductDto).ToList();
        }

        // Search using repository filtered query for efficiency
        public async Task<List<ProductDTO>> SearchProductsAsync(string keyword, int maxResults = 50)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return new List<ProductDTO>();

            // use filtered API: page=1, pageSize=maxResults, search=keyword
            var filtered = await _productRepository.GetFilteredAsync(1, maxResults, null, null, null, null, null, keyword);
            return filtered.Items.Select(MapToProductDto).ToList();
        }

        public async Task<PaginationResult<ProductDTO>> GetFilteredProductsAsync(
            int page, int pageSize,
            int? supplierId, int? categoryId,
            decimal? minPrice, decimal? maxPrice,
            string? sortBy, string? search)
        {
            var result = await _productRepository.GetFilteredAsync(
                page, pageSize, supplierId, categoryId, minPrice, maxPrice, sortBy, search
            );

            return new PaginationResult<ProductDTO>
            {
                Items = result.Items.Select(MapToProductDto).ToList(),
                TotalItems = result.TotalItems,
                CurrentPage = result.CurrentPage,
                PageSize = result.PageSize,
                TotalPages = result.TotalPages,
                HasPrevious = result.HasPrevious,
                HasNext = result.HasNext
            };
        }

        // Mapping: Product -> ProductDTO
        private ProductDTO MapToProductDto(Product p)
        {
            if (p == null) throw new ArgumentNullException(nameof(p));

            var dto = new ProductDTO
            {
                Id = p.Id,
                Sku = p.Sku,
                ProductName = p.ProductName,
                // Barcode = p.Barcode,
                CategoryId = p.CategoryId,
                SupplierId = p.SupplierId,
                Price = p.Price,
                Cost = p.Cost,
                Unit = p.Unit,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Category = p.Category != null ? new CategoryDTO
                {
                    Id = p.Category.Id,
                    Name = p.Category.Name,
                    Slug = p.Category.Slug,
                    Description = p.Category.Description,
                    IsActive = p.Category.IsActive
                } : null,
                Supplier = p.Supplier != null ? new SupplierDTO
                {
                    Id = p.Supplier.Id,
                    Name = p.Supplier.Name,
                    ContactName = p.Supplier.ContactName,
                    Phone = p.Supplier.Phone,
                    Email = p.Supplier.Email,
                    Address = p.Supplier.Address,
                    IsActive = p.Supplier.IsActive
                } : null,
                Inventory = p.Inventory != null ? new InventoryDTO
                {
                    ProductId = p.Inventory.ProductId,
                    Quantity = p.Inventory.Quantity,
                    LastCheckedAt = p.Inventory.LastCheckedAt,
                    UpdatedAt = p.Inventory.UpdatedAt
                } : null,

                // If you have rating/review tables, compute them here. For now default to 0.
                AverageRating = 0.0,
                ReviewCount = 0
            };

            // Optionally compute ReviewCount/AverageRating if you later add reviews table:
            // dto.ReviewCount = p.Reviews?.Count ?? 0;
            // dto.AverageRating = p.Reviews != null && p.Reviews.Any() ? Math.Round(p.Reviews.Average(r => r.Rating), 1) : 0.0;

            return dto;
        }
        public async Task<PaginationResult<Product>> GetAvailableProductsAsync(int page, int pageSize)
        {
            return await _productRepository.GetAvailableProductsPaginatedAsync(page, pageSize);
        }


    }
}
