// src/pages/orders/components/OrderTable.jsx
import { useOrders } from '../../hook/useOrders';

export default function OrderTable() {
  const {
    orders, searchQuery, filterStatus, page, perPage,
    viewOrder, statusText, statusBadge, formatVND,
    setPage
  } = useOrders();

  const filtered = orders
    .filter(o => {
      if (searchQuery && !o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterStatus && o.status !== filterStatus) return false;
      return true;
    });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-gray-100 to-gray-200">
        <h3 className="text-2xl font-bold">DANH SÁCH ĐƠN HÀNG</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold">Mã đơn</th>
              <th className="px-6 py-4 text-left font-bold">Khách</th>
              <th className="px-6 py-4 text-left font-bold">NV</th>
              <th className="px-6 py-4 text-right font-bold">Tiền</th>
              <th className="px-6 py-4 text-center font-bold">Trạng thái</th>
              <th className="px-6 py-4 text-center font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold">{order.order_number}</td>
                <td className="px-6 py-4">{order.customer_name}</td>
                <td className="px-6 py-4">{order.user_name}</td>
                <td className="px-6 py-4 text-right font-bold text-blue-600">
                  {formatVND(order.total_amount)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={statusBadge(order.status)}>{statusText(order.status)}</span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button onClick={() => viewOrder(order)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-5 border-t bg-gray-50">
        <button onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-6 py-3 border rounded-lg disabled:opacity-50 font-bold">
          Trước
        </button>
        <span className="text-sm font-bold">
          Trang <strong>{page}</strong> / <strong>{totalPages}</strong>
        </span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-6 py-3 border rounded-lg disabled:opacity-50 font-bold">
          Sau
        </button>
      </div>
    </div>
  );
}