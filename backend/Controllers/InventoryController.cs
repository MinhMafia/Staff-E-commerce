using backend.Services;
using backend.DTO;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly InventoryService _inventoryService;

        public InventoryController(InventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpPost("reduce-multiple")]
        public async Task<IActionResult> ReduceMultipleInventory([FromBody] List<ReduceInventoryDto> items)
        {
            try
            {
                await _inventoryService.ReduceInventoryAsync(items);
                return Ok(new { message = "Cập nhật kho thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
