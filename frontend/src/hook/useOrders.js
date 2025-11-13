import { useState } from "react";
import axios from "axios";


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

  const postJSON = async (url, data) => {
    try {
      const res = await axios.post(url, data);
      return res.data;
    } catch (err) {
      console.error(`API Error [${url}]:`, err.response?.data || err.message);
      return null;
    }
  };
  // --- Modal controls ---
  const openCustomerModal = () => setShowCustomerModal(true);
  const closeCustomerModal = () => setShowCustomerModal(false);

  const openProductModal = () => setShowProductModal(true);
  const closeProductModal = () => setShowProductModal(false);



  const openOrderModal = (mode = "create", order = null, products = [], payment = [], selectedProduct=null) => {
    setOrdersFormMode(mode);
    setCurrentOrder(order);
    setListOrderProducts([]);
    setSelectedProduct(selectedProduct);
    setListOrderProducts(products);
    setPayment(payment)
    setPayment(payment);
    setShowOrderModal(true);
  };
  const closeOrderModal = () => setShowOrderModal(false);

  // --- API: tạo đơn tạm ---
  const createNewOrder = async () => {
    try {
      const response = await fetch("http://localhost:5099/api/orders/create-temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Lỗi khi tạo đơn hàng:", error.message || response.statusText);
        return;
      }
      //Tạo ra một đơn hàng tạm
      const orderData = await response.json();
      openOrderModal("create", orderData, []);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
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



  async function createOrderItems(orderItems) {
    try {

      const res = await axios.post("http://localhost:5099/api/orderitem/create", orderItems);
      return res.data === true;
    } catch (error) {
      console.error("Lỗi khi lưu order items:", error);
      return false;
    }
  }

  // src/api/promotionApi.js

  async function applyPromotion(promotionId, orderId, customerId) {
    try {
      const res = await fetch("http://localhost:5099/api/promotions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          PromotionId: promotionId,   // phải đúng tên property
          OrderId: orderId,
          CustomerId: customerId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Apply Promotion failed:", errorData);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Fetch error:", err);
      return false;
    }
  }

 
  async function reduceInventory(items) {
  try {
    const res = await fetch("http://localhost:5099/api/inventory/reduce-multiple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Reduce inventory failed:", errorData?.message || "Unknown error");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Fetch error:", err);
    return false;
  }
}




const pay = async (method = "cash") => {
  if (!currentOrder) return;

  const baseUrl = "http://localhost:5099/api/payment";

  if (method === "other") {
    // Thanh toán MoMo
    const body = {
      OrderId: currentOrder.id,                          // ID đơn hàng hệ thống
      Amount: Math.round(currentOrder.total_amount),     // Số tiền integer
      ReturnUrl: "http://localhost:5173/orders",         // Redirect sau thanh toán
      NotifyUrl: `${baseUrl}/momo/ipn`                  // Callback backend
    };

    try {
      const res = await postJSON(`${baseUrl}/momo/create`, body);

      if (res?.payUrl) {
        // Redirect người dùng tới MoMo để thanh toán
        window.location.href = res.payUrl;
      } else {
        alert("Tạo payment MoMo thất bại. Kiểm tra backend logs.");
      }

      return res;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gọi API thanh toán MoMo");
      return null;
    }
  } else {
    // Thanh toán offline / cash / card
    const body = {
      OrderId: currentOrder.id,
      Amount: Math.round(currentOrder.total_amount),
      Method: payment.method,   // cash, card, etc.
      TransactionRef: null,
      Status: 'completed',
      CreatedAt: new Date().toISOString()
    };

    try {
      const res = await postJSON(`${baseUrl}/offlinepayment`, body);
      if (res) alert("Thanh toán trực tiếp thành công!");
      return res;
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thanh toán trực tiếp");
      return null;
    }
  }
};



const click_buttonCreateNewOrder = async () => {
  console.log("===== THÔNG TIN ĐƠN HÀNG HIỆN TẠI =====");
  console.log("Đơn hàng:", currentOrder);
  console.log("Sản phẩm trong đơn:", listOrderProducts);
  console.log("Khuyến mãi:", promotion);
  console.log("Thanh toán:", payment);

  if (listOrderProducts.length === 0) {
    alert("Vui lòng thêm sản phẩm vào đơn hàng!");
    return;
  }


  const orderData = orderObject(currentOrder, promotion, payment);
  const listOrderItem = listOrderItemObject(listOrderProducts, currentOrder);
  const listreduceItem = listReduceItemObject(listOrderProducts);

  console.log("===== THÔNG TIN TRUYỀN LÊN DB =====");
  console.log("Đơn hàng:", orderData);
  console.log("Sản phẩm trong đơn:", listOrderItem);
  console.log("Sản phẩm bị trừ:", listreduceItem );

  const success = await createOrder(orderData);
  if (!success) {
    alert("Lưu đơn thất bại");
    return;
  }

  const success1 = await createOrderItems(listOrderItem);
  if (!success1) {
    alert("Lưu item thất bại");
    return;
  }

  const success2 = await reduceInventory(listreduceItem);
  if (!success2) {
    console.log("Cập nhật inventory thất bại");
    alert("Cập nhật inventory thất bại");
    return;
  } else {
    console.log("Giảm số lượng sản phẩm trong inventory thành công");
  }

  if (promotion?.id != null) {
    const success3 = await applyPromotion(
      promotion.id,
      currentOrder.id,
      currentOrder.customerId
    );
    console.log(success3 ? "Apply promotion thành công" : "Apply promotion thất bại");
  }

    // --- Bước thanh toán ---
  try {

    const paymentResult = await pay(payment.method);
    if (paymentResult) {
      console.log("Thanh toán thành công:", paymentResult);
    } else {
      console.log("Thanh toán thất bại hoặc bị hủy");
    }
  } catch (err) {
    console.error("Lỗi khi thanh toán:", err);
    alert("Thanh toán gặp lỗi");
  }

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
  const paymentStatus = payment.method === 'cash' ? 'completed' : 'pending';

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
