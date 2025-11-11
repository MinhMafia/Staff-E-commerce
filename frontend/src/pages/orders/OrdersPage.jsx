import React from "react";
import OrdersForm from "../../components/orders/OrderForm";
import OrderTable from "../../components/orders/OrderTable";
import CustomerModal from "../../components/orders/CustomerModal";
import ProductModal from "../../components/orders/ProductModal";
import { useOrders } from "../../hook/useOrders";

export default function OrdersPage() {
  const { 
    showCustomerModal,
    showProductModal,
    showOrderModal, 
    openOrderModal, 
    closeOrderModal,
    openCustomerModal,
    closeCustomerModal,
    openProductModal,
    closeProductModal,
    ordersFormMode,
    createNewOrder,
    currentOrder,
    setCurrentOrder ,
    payment,
    setPayment,
    updateCustomer,
    listOrderProducts,
    setListOrderProducts,
    selectedProduct, 
    setSelectedProduct

 

    
  } = useOrders();
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">

      {/* Lọc trạng thái + Tạo đơn hàng */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-bold text-gray-700 whitespace-nowrap">
            Lọc trạng thái:
          </label>
          <select
            onChange={() => {}}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chưa xử lý</option>
            <option value="paid">Đã thanh toán</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <button
          onClick={createNewOrder}
          className="w-full sm:w-auto px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg transition"
        >
          Tạo Đơn Hàng Mới
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm theo Mã đơn hoặc Tên khách"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() => {}}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          Tìm Kiếm
        </button>
      </div>

      {/* Lọc theo ngày */}
      <div className="flex gap-3 mb-6">
        <input
          type="date"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
        />
        <button
          onClick={() => {}}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          Lọc
        </button>
      </div>

      {/* Form đơn hàng */}
      {showOrderModal && <OrdersForm 
      onClose={closeOrderModal} 
      openCustomerModal={openCustomerModal}
      openProductModal={openProductModal} 
      mode = {ordersFormMode} 
      currentOrder={currentOrder}
      setCurrentOrder={setCurrentOrder}
      payment={payment}
      setPayment={setPayment}
      listOrderProducts={listOrderProducts}
      setListOrderProducts={setListOrderProducts}
      selectedProduct={selectedProduct}
      setSelectedProduct={setSelectedProduct}


      
     />}
  

      {/* Danh sách đơn hàng*/}
      <OrderTable 
      openOrderModal={openOrderModal} 
      />

      {/* Modal chọn khách hàng */}
      {showCustomerModal && <CustomerModal 
      onClose={closeCustomerModal}  
      updateCustomer ={updateCustomer}
      />}

      {/* Modal chọn sản phẩm */}
      {showProductModal && <ProductModal 
      onClose={closeProductModal}       
      selectedProduct={selectedProduct}
      setSelectedProduct={setSelectedProduct} 
      />}

    </div>
  );
}
