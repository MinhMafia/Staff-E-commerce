import { formatCurrency } from "../../utils/formatters";

/**
 * Component hiển thị data table cho function results
 */
const DataTable = ({ data, functionCalled }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  // Best sellers / Top products table
  if (functionCalled === "get_best_sellers" || functionCalled === "get_top_products") {
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Sản phẩm</th>
              <th className="px-3 py-2 text-right">SL bán</th>
              <th className="px-3 py-2 text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{item.productName}</td>
                <td className="px-3 py-2 text-right">{item.quantitySold}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(item.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Low stock table
  if (functionCalled === "get_low_stock") {
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Sản phẩm</th>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-right">Tồn kho</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{item.productName}</td>
                <td className="px-3 py-2 text-gray-500">{item.sku || "-"}</td>
                <td
                  className={`px-3 py-2 text-right font-semibold ${
                    item.quantity < 5 ? "text-red-600" : "text-orange-500"
                  }`}
                >
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Top customers table
  if (functionCalled === "get_top_customers") {
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-right">Số đơn</th>
              <th className="px-3 py-2 text-right">Tổng chi</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{item.customerName}</td>
                <td className="px-3 py-2 text-right">{item.orderCount}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(item.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

export default DataTable;
