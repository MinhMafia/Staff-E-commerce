using Microsoft.AspNetCore.Mvc;
using backend.DTO;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _service;

        public CategoriesController(CategoryService service)
        {
            _service = service;
        }

        // GET api/categories/paginated
        [HttpGet("paginated")]
        public async Task<ActionResult<PaginationResult<CategoryDTO>>> GetPaginated(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 12;

            var result = await _service.GetPaginatedAsync(page, pageSize, search);
            return Ok(result);
        }

        // GET api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetAll()
        {
            var list = await _service.GetAllAsync();
            return Ok(list);
        }

        // GET api/categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDTO>> GetById(int id)
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto == null) return NotFound("Category not found");
            return Ok(dto);
        }

        // POST api/categories
        [HttpPost]
        public async Task<ActionResult<CategoryDTO>> Create([FromBody] CategoryDTO dto)
        {
            if (dto == null) return BadRequest("Payload required");
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Category name required");

            try
            {
                var category = new Category
                {
                    Name = dto.Name,
                    IsActive = dto.IsActive,
                };

                var created = await _service.CreateCategoryAsync(category);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }

        // PUT api/categories/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDTO>> Update(int id, [FromBody] CategoryDTO dto)
        {
            if (dto == null) return BadRequest("Payload required");
            try
            {
                var category = new Category
                {
                    Id = id,
                    Name = dto.Name,
                    IsActive = dto.IsActive
                };

                var updated = await _service.UpdateCategoryAsync(category);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Server error updating category");
            }
        }

        // DELETE api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteCategoryAsync(id);
            if (!ok) return NotFound("Category not found");
            return Ok("Deleted");
        }
    }
}
