// src/pages/orders/OrdersPage.jsx
// import { useOrders } from '../../hook//useOrders';
// import OrderTable from '../../components/orders/OrderTable';
// import OrderForm from '../../components/orders/OrderForm';
// import CustomerModal from '../../components/orders/CustomerModal';
// import ProductModal from '../../components/orders/ProductModal';

import OrdersForm from "../../components/orders/OrderForm";

export default function OrdersPage() {

  return (
    <div class="max-w-7xl mx-auto p-4 sm:p-6">

      {/* <!-- Lọc trạng thái + Tạo đơn hàng --> */}
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <label class="text-sm font-bold text-gray-700 whitespace-nowrap">Lọc trạng thái:</label>
          <select x-model="filterStatus" onChange={() => {}} class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chưa xử lý</option>
            <option value="paid">Đã thanh toán</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <button onclick={() => {}}
          class="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg transition">
          Tạo Đơn Hàng Mới
        </button>
      </div>

      {/* <!-- Tìm kiếm --> */}
      <div class="flex gap-3 mb-4">
        <input type="text" x-model="searchQuery" 
          placeholder="Tìm theo Mã đơn hoặc Tên khách"
          class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"/>
        <button onclick = {() => {}} class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700">
          Tìm Kiếm
        </button>
      </div>

      {/* <!-- Lọc theo ngày --> */}
      <div class="flex gap-3 mb-6">
        <input type="date" x-model="filterStart" class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"/>
        <input type="date" x-model="filterEnd" class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"/>
        <button onClick={() => {}} class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700">
          Lọc
        </button>
      </div>
      {/* <!-- Form đơn hàng sẽ ở đây <các thao tác, tạo, xem, xử lí sẽ gọi tới nó> Lúc đầu sẽ bị ẩn--> */}
      <OrdersForm />
      <NoteFrom />
      

    </div>
  );
}