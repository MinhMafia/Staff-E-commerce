export default function OrdersForm() {
    return (
        // Thông tin đơn hàng
        <div class="space-y-5 mb-6">    
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Mã đơn hàng</label>
                <input readonly
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"/>
            </div>

            {/* // <!-- Chọn khách hàng --> */}
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Khách hàng</label>
                <div class="flex gap-2">
                    <input readonly placeholder="Chưa chọn khách..."
                    class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"/>
                    <button class="px-3 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    </button>
                </div>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Nhân viên</label>
                <input  readonly
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"/>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Ngày lập phiếu</label>
                <input x-model="current.create_at" readonly
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"/>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Ngày chỉnh sửa</label>
                <input x-model="current.update_at" readonly
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium"/>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Trạng thái đơn</label>
                <select x-model="current.status"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-bold">
                    <option value="pending">Chưa xử lý</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

        </div>

        

        
        


    );
}
