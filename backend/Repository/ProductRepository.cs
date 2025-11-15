    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using backend.Data;
    using backend.Models;
    using Microsoft.EntityFrameworkCore;

    namespace backend.Repository
    {
        public class ProductRepository
        {
            private readonly AppDbContext _context;

            public ProductRepository(AppDbContext context)
            {
                _context = context;
            }



            // Lấy theo id (include liên quan)
            public async Task<Product?> GetByIdAsync(int id)
            {
                return await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Supplier)
                    .Include(p => p.Inventory)
                    .Include(p => p.OrderItems) // nếu cần thống kê
                    .FirstOrDefaultAsync(p => p.Id == id);
            }

            public async Task<Product?> GetByIdForUpdateAsync(int id)
    {
            return await _context.Products
                .AsNoTracking() // tránh tracking conflict
                .Select(p => new Product 
                {
                    Id = p.Id,
                    CreatedAt = p.CreatedAt
                })  
                .FirstOrDefaultAsync(p => p.Id == id);
    }

            

            public async Task<Product> CreateAsync(Product product)
            {
                // đảm bảo timestamp nếu cần
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;

                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                return product;
            }

            public async Task<Product> UpdateAsync(Product product)
            {
                product.UpdatedAt = DateTime.UtcNow;
                _context.Products.Update(product);
                await _context.SaveChangesAsync();
                return product;
            }

            public async Task<bool> DeleteAsync(int id)
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null) return false;

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return true;
            }


            // Filtered with pagination and sorting
            public async Task<PaginationResult<Product>> GetFilteredAsync(
                int page = 1, 
                int pageSize = 12,
                int? supplierId = null, 
                int? categoryId = null,
                decimal? minPrice = null, 
                decimal? maxPrice = null,
                string? sortBy = "newest", 
                string? search = null)
            {
                if (page < 1) page = 1;
                if (pageSize <= 0) pageSize = 10;

                IQueryable<Product> query = _context.Products
                    .AsQueryable()
                    .Include(p => p.Category)
                    .Include(p => p.Supplier)
                    .Include(p => p.Inventory);

                // Filter supplier
                if (supplierId.HasValue)
                    query = query.Where(p => p.SupplierId == supplierId.Value);

                // Filter category
                if (categoryId.HasValue)
                    query = query.Where(p => p.CategoryId == categoryId.Value);

                // Price range
                if (minPrice.HasValue)
                    query = query.Where(p => p.Price >= minPrice.Value);

                if (maxPrice.HasValue)
                    query = query.Where(p => p.Price <= maxPrice.Value);

                // Search by product name, sku, barcode, supplier name
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.Trim();
                    query = query.Where(p =>
                        p.ProductName.Contains(s) ||
                        (p.Sku != null && p.Sku.Contains(s)) ||
                        // (p.Barcode != null && p.Barcode.Contains(s)) ||
                        (p.Supplier != null && p.Supplier.Name.Contains(s))
                    );
                }

                // Sort
                query = (sortBy ?? "newest").ToLower() switch
                {
                    "price_asc" => query.OrderBy(p => p.Price),
                    "price_desc" => query.OrderByDescending(p => p.Price),
                    "name_asc" => query.OrderBy(p => p.ProductName),
                    "name_desc" => query.OrderByDescending(p => p.ProductName),
                    "featured" => query.OrderByDescending(p => p.OrderItems.Sum(oi => oi.Quantity)), // best sellers
                    "bestsellers" => query.OrderByDescending(p => p.OrderItems.Sum(oi => oi.Quantity)),
                    "budget" => query.OrderBy(p => p.Price), // cheapest first
                    "newest" => query.OrderByDescending(p => p.CreatedAt),
                    "oldest" => query.OrderBy(p => p.CreatedAt),

                    _ => query.OrderByDescending(p => p.Id)
                };

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .AsNoTracking()
                    .ToListAsync();

                return new PaginationResult<Product>
                {
                    Items = items,
                    TotalItems = totalItems,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    HasPrevious = page > 1,
                    HasNext = page < totalPages
                };
            }
        }

        //Thừa 

                // Lấy toàn bộ sản phẩm (include category, supplier, inventory)
        // public async Task<List<Product>> GetAllAsync()
        // {
            // return await _context.Products
                // .AsNoTracking()
                // .Include(p => p.Category)
                // .Include(p => p.Supplier)
                // .Include(p => p.Inventory)
                // .ToListAsync();
        // }


        // Pagination cơ bản
        // public async Task<PaginationResult<Product>> GetPaginatedAsync(int page, int pageSize)
        // {
            // if (page < 1) page = 1;
            // if (pageSize <= 0) pageSize = 20;

            // var totalItems = await _context.Products.CountAsync();
            // var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            // var items = await _context.Products
                // .AsNoTracking()
                // .Include(p => p.Category)
                // .Include(p => p.Supplier)
                // .Include(p => p.Inventory)
                // .OrderByDescending(p => p.CreatedAt)
                // .Skip((page - 1) * pageSize)
                // .Take(pageSize)
                // .ToListAsync();

            // return new PaginationResult<Product>
            // {
                // Items = items,
                // TotalItems = totalItems,
                // CurrentPage = page,
                // PageSize = pageSize,
                // TotalPages = totalPages,
                // HasPrevious = page > 1,
                // HasNext = page < totalPages
            // };
        // }

        
        // Lấy theo supplier (thay cho brand)
        // public async Task<List<Product>> GetBySupplierAsync(int supplierId)
        // {
            // return await _context.Products
                // .AsNoTracking()
                // .Where(p => p.SupplierId == supplierId)
                // .Include(p => p.Supplier)
                // .Include(p => p.Category)
                // .ToListAsync();
        // }
// 
        // Lấy theo category
        // public async Task<List<Product>> GetByCategoryAsync(int categoryId)
        // {
            // return await _context.Products
                // .AsNoTracking()
                // .Where(p => p.CategoryId == categoryId)
                // .Include(p => p.Category)
                // .Include(p => p.Supplier)
                // .ToListAsync();
        // }
// 
        // Featured: top products theo tổng số lượng bán (có thể giới hạn theo thời gian nếu cần)
        // public async Task<List<Product>> GetFeaturedProductsAsync(int limit)
        // {
            // Lấy productId có tổng quantity bán nhiều nhất
            // var top = await _context.OrderItems
                // .GroupBy(oi => oi.ProductId)
                // .Select(g => new { ProductId = g.Key, TotalQty = g.Sum(x => x.Quantity) })
                // .OrderByDescending(x => x.TotalQty)
                // .Take(limit)
                // .ToListAsync();
// 
            // var productIds = top.Select(t => t.ProductId).ToList();
// 
            // var products = await _context.Products
                // .AsNoTracking()
                // .Where(p => productIds.Contains(p.Id))
                // .Include(p => p.Category)
                // .Include(p => p.Supplier)
                // .Include(p => p.Inventory)
                // .ToListAsync();
// 
            // Sắp xếp lại theo thứ tự top
            // var ordered = productIds.Select(id => products.First(p => p.Id == id)).ToList();
            // return ordered;
        // }
// 
        // Best sellers: tương tự featured nhưng trả theo số lượng (limit)
        // public async Task<List<Product>> GetBestSellerAsync(int limit)
        // {
            // return await GetFeaturedProductsAsync(limit);
        // }
// 
        // Budget products: products có price nhỏ hơn threshold
        // public async Task<List<Product>> GetBudgetProductAsync(int limit, decimal threshold = 1000m)
        // {
            // return await _context.Products
                // .AsNoTracking()
                // .Where(p => p.Price <= threshold)
                // .Include(p => p.Category)
                // .Include(p => p.Supplier)
                // .OrderBy(p => p.Price)
                // .Take(limit)
                // .ToListAsync();
        // }
    }
