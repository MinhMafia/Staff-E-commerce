using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTO;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _service;

        public CustomersController(CustomerService service)
        {
            _service = service;
        }

        // GET api/customers/paginated?page=1&pageSize=10
        [HttpGet("paginated")]
        public async Task<ActionResult> GetPaginated(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, totalPages) = await _service.GetPaginatedAsync(page, pageSize);
            return Ok(new { items, totalPages });
        }

        // GET api/customers/search?keyword=...
        [HttpGet("search")]
        public async Task<ActionResult> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest("Keyword is required");

            var items = await _service.SearchByNameAsync(keyword);
            return Ok(items);
        }
    }
}
