using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using backend.DTO;

namespace backend.Controllers 
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductsController(ProductService productService)
        {
            _productService = productService;
        }

        // GET api/products/paginated
        [HttpGet("paginated")]
        public async Task<ActionResult<PaginationResult<ProductDTO>>> GetPaginatedProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 8
        )
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 8;

            var result = await _productService.GetPaginatedProductsAsync(page, pageSize);
            return Ok(result);
        }

        // GET api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts()
        {
            try
            {
                var products = await _productService.GetAllProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null) 
                    return NotFound($"Product with ID {id} not found");
                
                return Ok(product);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET api/products/featured
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetFeaturedProducts([FromQuery] int limit = 8)
        {
            try
            {
                var products = await _productService.GetFeaturedProductsAsync(limit);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET api/products/bestsellers
        [HttpGet("bestsellers")]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetBestSellers([FromQuery] int limit = 8)
        {
            try
            {
                var products = await _productService.GetBestSellerAsync(limit);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET api/products/budget
        [HttpGet("budget")]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetBudgetProducts([FromQuery] int limit = 8)
        {
            try
            {
                var products = await _productService.GetBudgetProductAsync(limit);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET api/products/search?keyword=...
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> SearchProducts([FromQuery] string keyword)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(keyword))
                    return BadRequest("Search keyword is required");

                var products = await _productService.SearchProductsAsync(keyword);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST api/products
        // Accept ProductDTO in body and map to Product entity before creating
        [HttpPost]
        public async Task<ActionResult<ProductDTO>> CreateProduct([FromBody] ProductDTO productDto)
        {
            if (productDto == null)
                return BadRequest("Product payload is required");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Map DTO -> Entity (only required fields)
                var product = new Product
                {
                    ProductName = productDto.ProductName,
                    Sku = productDto.Sku,
                    // Barcode = productDto.Barcode,
                    CategoryId = productDto.CategoryId,
                    SupplierId = productDto.SupplierId,
                    Price = productDto.Price,
                    Cost = productDto.Cost,
                    Unit = productDto.Unit,
                    Description = productDto.Description,
                    ImageUrl = productDto.ImageUrl,
                    IsActive = productDto.IsActive,
                    CreatedAt = productDto.CreatedAt ?? DateTime.UtcNow,
                    UpdatedAt = productDto.UpdatedAt ?? DateTime.UtcNow
                };

                var createdDto = await _productService.CreateProductAsync(product);
                return CreatedAtAction(nameof(GetProduct), new { id = createdDto.Id }, createdDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProductDTO>> UpdateProduct(int id, [FromBody] Product product)
        {
            try
            {
                product.Id = id;
        
                var updatedProduct = await _productService.UpdateProductAsync(product);
                return updatedProduct;
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server khi cập nhật sản phẩm");
            }
        }

        // GET api/products/filter? ... (note: use supplierId not brandId)
        [HttpGet("filter")]
        public async Task<ActionResult<PaginationResult<ProductDTO>>> GetFilteredProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] int? supplierId = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = "newest",
            [FromQuery] string? search = null
        )
        {
            try
            {
                var result = await _productService.GetFilteredProductsAsync(
                    page, pageSize, supplierId, categoryId, minPrice, maxPrice, sortBy, search
                );
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);
                return result ? Ok("Xóa thành công") : NotFound("Không tìm thấy sản phẩm");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
