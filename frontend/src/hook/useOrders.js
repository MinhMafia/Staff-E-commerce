import { useState } from "react";

import { request } from "../api/apiClient"; // THÊM DÒNG NÀY


export const useOrders = () => {
  // --- Modal states ---
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // --- Form mode ---
  const [ordersFormMode, setOrdersFormMode] = useState("create");

  // --- Current order info ---
  const [currentOrder, setCurrentOrder] = useState(null);

  // --- Product đang chọn từ ProductModal (chưa thêm vào đơn) ---
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- Danh sách sản phẩm trong đơn ---
  const [listOrderProducts, setListOrderProducts] = useState([]);

  // --- Payment info ---
  const [payment, setPayment] = useState({
    method: "cash",
    transaction_ref: "",
    status: "pending",
  });


  // --- Promotion ---
  const [promotion, setPromotion] = useState(
    {
      id: null,
      code: "",
      type: "",
      value: 0

    }
  )

  // --- Modal controls ---
  const openCustomerModal = () => setShowCustomerModal(true);
  const closeCustomerModal = () => setShowCustomerModal(false);

  const openProductModal = () => setShowProductModal(true);
  const closeProductModal = () => setShowProductModal(false);



  const openOrderModal = (mode = "create", 
    order = null, 
    products = [], 
    payment = {
    method: "cash",
    transaction_ref: "",
    status: "pending",
  }, 
  selectedProduct=null,
  promotion={
    
      id: null,
      code: "",
      type: "",
      value: 0

    
  }) => {
    setOrdersFormMode(mode);
    setCurrentOrder(order);
    setSelectedProduct(selectedProduct);
    setListOrderProducts(products);
    setPayment(payment)
    setShowOrderModal(true);
    setPromotion(promotion);
  };
  const closeOrderModal = () => setShowOrderModal(false);

  // --- API: tạo đơn tạm ---
  const createNewOrder = async () => {
    try {
     
      const orderData = await request("/orders/create-temp", { 
        method: "POST" 
      });

   
      openOrderModal("create", orderData, []);
      
    } catch (err) {
      console.error("Lỗi khi tạo đơn tạm:", err.message || err);
      alert("Không thể tạo đơn hàng mới: " + (err.message || "Lỗi không xác định"));
    }
  };

  //Lưu đon hàng lên database

  async function createOrder(orderData) {
    try {
      console.log("Dữ liệu gửi lên:", orderData);

      const response = await fetch("http://localhost:5099/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      // const response = await request("/orders/create", {
      //   method: "POST",
      //   body:orderData,
      // });

      if (!response.ok) {
        console.error("Lỗi khi gọi API:", response.status);
        return false;
      }

      const result = await response.json();
      return result === true;
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      return false;
    }
  }



  const createOrderItems = async (orderItems) => {
    try {
      const result = await request("/orderitem/create", {
        method: "POST",
        body: orderItems,
      });
      return result === true;
    } catch (err) {
      alert("Lưu sản phẩm thất bại: " + err.message);
      return false;
    }
  };



  const applyPromotion = async (promotionId, orderId, customerId) => {
    try {
      await request("/promotions/apply", {
        method: "POST",
        body: { PromotionId: promotionId, OrderId: orderId, CustomerId: customerId },
      });
      return true;
    } catch (err) {
      console.error("Apply promotion error:", err.message);
      return false;
    }
  };

 


  const reduceInventory = async (items) => {
    try {
      await request("/inventory/reduce-multiple", {
        method: "POST",
        body: items,
      });
      return true;
    } catch (err) {
      alert("Cập nhật kho thất bại: " + err.message);
      return false;
    }
  };

const pay = async (method = "cash") => {
  if (!currentOrder) return;

  if (method === "other") {
    const body = {
      OrderId: currentOrder.id,
      Amount: Math.round(currentOrder.total_amount),
      ReturnUrl: "http://localhost:5173/orders",
      NotifyUrl: "http://localhost:5099/api/payment/momo/ipn"
    };
    const res = await request("/payment/momo/create", { method: "POST", body });
    if (res?.payUrl) window.location.href = res.payUrl;
    return res;
  } else {
    const body = {
      OrderId: currentOrder.id,
      Amount: Math.round(currentOrder.total_amount),
      Method: method,
      Status: "completed",
    };
    return await request("/payment/offlinepayment", { method: "POST", body });
  }
};


const click_buttonCreateNewOrder = async () => {
  console.log("=== BẮT ĐẦU TẠO ĐƠN HÀNG ===");
  console.log("Current Order:", currentOrder);
  console.log("Khuyến mãi:", promotion);
  console.log("Danh sách sản phẩm:", listOrderProducts);

  // Check xem có sản phẩm trong đơn không
  if (!listOrderProducts || listOrderProducts.length === 0) {
    alert("Vui lòng thêm sản phẩm vào đơn hàng!");
    return;
  }

  // Check currentOrder
  if (!currentOrder || !currentOrder.id) {
    alert("Order chưa được tạo. Vui lòng tạo đơn tạm trước!");
    return;
  }

  // Chuẩn bị dữ liệu
  const orderData = orderObject(currentOrder, promotion, payment);
  const listOrderItem = listOrderItemObject(listOrderProducts, currentOrder);
  const listreduceItem = listReduceItemObject(listOrderProducts);

  console.log("===== THÔNG TIN TRUYỀN LÊN DB =====");
  console.log("Đơn hàng:", orderData);
  console.log("Sản phẩm trong đơn:", listOrderItem);
  console.log("Sản phẩm bị trừ:", listreduceItem);

  // --- Lưu đơn hàng ---
  const success = await createOrder(orderData);
  if (!success) {
    alert("Lưu đơn thất bại");
    return;
  }

  // --- Lưu sản phẩm trong đơn ---
  const success1 = await createOrderItems(listOrderItem);
  if (!success1) {
    alert("Lưu sản phẩm thất bại");
    return;
  }

  // --- Giảm inventory ---
  const success2 = await reduceInventory(listreduceItem);
  if (!success2) {
    alert("Cập nhật kho thất bại");
    return;
  } else {
    console.log("Giảm số lượng sản phẩm trong inventory thành công");
  }

  // --- Apply promotion nếu có ---
  if (promotion?.id != null && currentOrder.customerId) {
    const success3 = await applyPromotion(
      promotion.id,
      currentOrder.id,
      currentOrder.customerId
    );
    console.log(success3 ? "Apply promotion thành công" : "Apply promotion thất bại");
  }

  // --- Thanh toán ---
  if (!payment?.method) payment.method = "cash"; // mặc định cash
  try {
    const paymentResult = await pay(payment.method);
    if (paymentResult) {
      console.log("Thanh toán thành công:", paymentResult);
      alert("Thanh toán thành công");

      // --- Hỏi có muốn in phiếu không ---
      const printConfirm = window.confirm("Đơn hàng đã lưu thành công. Bạn có muốn in phiếu không?");
      if (printConfirm) {
        printOrder(currentOrder, listOrderProducts, promotion, payment);
      }

      closeOrderModal();
    } else {
      console.log("Thanh toán thất bại hoặc bị hủy");
      closeOrderModal();
    }
  } catch (err) {
    console.error("Lỗi khi thanh toán:", err);
    alert("Thanh toán gặp lỗi");
    closeOrderModal();
  }

  console.log("=== KẾT THÚC TẠO ĐƠN HÀNG ===");
};


const printOrder = (order, products, promotion, payment) => {
  // Mở cửa sổ in ngay lập tức
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) {
    alert("Trình duyệt chặn popup. Vui lòng cho phép popup để in phiếu.");
    return;
  }

  // Tạo nội dung HTML
  let html = `
    <h2>Phiếu Đơn Hàng #${order.orderNumber}</h2>
    <p>Khách hàng: ${order.customerName || "Khách lẻ"}</p>
    <p>Ngày tạo: ${new Date().toLocaleString()}</p>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Sản phẩm</th>
        <th>Số lượng</th>
        <th>Đơn giá</th>
        <th>Thành tiền</th>
      </tr>
  `;

  products.forEach(p => {
    html += `
      <tr>
        <td>${p.name}</td>
        <td>${p.qty}</td>
        <td>${p.price}</td>
        <td>${p.total}</td>
      </tr>
    `;
  });

  html += `</table>`;
  html += `<p>Tổng tiền: ${order.total_amount}</p>`;
  if (promotion?.code) html += `<p>Khuyến mãi: ${promotion.code} - Giảm ${promotion.value}</p>`;
  html += `<p>Thanh toán: ${payment.method} - ${payment.status}</p>`;

  // Ghi nội dung và in
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};








// --- Cập nhật khách hàng ---
const updateCustomer = (customer) => {
  setCurrentOrder((prev) => ({
    ...prev,
    customerId: customer.id,
    customerName: customer.fullName,
  }));
  closeCustomerModal();
  console.log("Đơn Hàng: \n" + currentOrder);
};

// Chuẩn bị dữ liệu cho order
const orderObject = (currentOrder, promotion, payment) => {
  // Xác định trạng thái thanh toán
  const paymentStatus = payment.method === 'cash' ? 'pending' : 'completed';

  return {
    Id: currentOrder.id,
    OrderNumber: currentOrder.orderNumber,
    CustomerId: currentOrder.customerId,
    UserId: currentOrder.userId,
    Status: paymentStatus,
    Subtotal: currentOrder.subtotal,
    Discount: currentOrder.discount,
    TotalAmount: currentOrder.total_amount,
    PromotionId: promotion?.id ?? null, // nếu promotion null thì trả null
    Note: currentOrder.note,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };
};


//Chuẩn bị dữ liệu một list OrderItem để gửi lên database OrderItem
const listOrderItemObject = (listOrderProducts, currentOrder) => {
  return listOrderProducts.map(product => ({
    OrderId: currentOrder.id,
    ProductId: product.id,
    Quantity: product.qty,
    UnitPrice: product.price,
    TotalPrice: product.total,
    CreatedAt: new Date().toISOString()
  }));
}

  // Chuẩn bị dữ liệu list ReduceItem
 /**
 * items: [{ productId: number, quantity: number }]
 * Trả về true nếu thành công, false nếu lỗi
 */
const listReduceItemObject = (listOrderProducts)=>{
  return listOrderProducts.map(product => ({
    ProductId: product.id,  
    Quantity: product.qty
  }));
}



return {
  // Modals
  showCustomerModal,
  openCustomerModal,
  closeCustomerModal,
  showProductModal,
  openProductModal,
  closeProductModal,
  showOrderModal,
  openOrderModal,
  closeOrderModal,

  // Data
  ordersFormMode,
  setOrdersFormMode,
  currentOrder,
  setCurrentOrder,
  selectedProduct,
  setSelectedProduct,
  listOrderProducts,
  setListOrderProducts,
  payment,
  setPayment,
  promotion,
  setPromotion,

  // Actions
  createNewOrder,
  updateCustomer,
  createOrder,
  createOrderItems,
  applyPromotion,
  pay,
  click_buttonCreateNewOrder,
  orderObject,
  listOrderItemObject,
  reduceInventory,
  listReduceItemObject


};

}
