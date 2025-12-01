namespace backend.DTO
{
    public class OverviewStatsDTO
    {
        public decimal TodayRevenue { get; set; }
        public decimal RevenueChange { get; set; }
        public int TodayOrders { get; set; }
        public decimal OrdersChange { get; set; }
        public int TodayProductsSold { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal TotalDiscountApplied { get; set; }
        public int LowStockCount { get; set; }
        public decimal InventoryValue { get; set; }
    }
}
