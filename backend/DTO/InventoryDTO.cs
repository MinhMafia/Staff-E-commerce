using System;
using System.Text.Json.Serialization;


namespace backend.DTO
{
    public class InventoryDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 0;
        public DateTime? LastCheckedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
