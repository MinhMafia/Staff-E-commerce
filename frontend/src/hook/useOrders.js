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
      id: "",
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

 

  const openOrderModal = (mode = "create", order = null, products = [], payment = []) => {
    setOrdersFormMode(mode);
    setCurrentOrder(order);
    setListOrderProducts(products);
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
      openOrderModal("create", orderData,[]);
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

  async function changePromotion(promotionId, customerId, orderId) {
    try {
      const response = await fetch("http://localhost:5099/api/promotions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionId,
          customerId,
          orderId,
        }),
      });

      if (!response.ok) {
        console.error("Lỗi HTTP:", response.status);
        return false;
      }

      const data = await response.json();

      if (data.success) {
        console.log("Áp dụng khuyến mãi thành công:", data.message);
        return true;
      } else {
        console.warn(" Áp dụng thất bại:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Lỗi khi gọi API khuyến mãi:", error);
      return false;
    }
  }

    const pay = async (method = "offline") => {
    if (!currentOrder) return;

    if (method === "momo") {
      
      const currentPageUrl = window.location.href;

      const body = {
        orderId: currentOrder.order_id,
        amount: currentOrder.total_amount,
        customerId: currentOrder.customer_id,
        returnUrl: currentPageUrl, 
        notifyUrl: "http://localhost:5000/api/payment/momo/notify", // backend nhận IPN
      };

      const res = await postJSON("http://localhost:5099/api/payment/momo/create", body);

      if (res) {
        // Nếu người dùng vừa redirect về trang này, alert ngay
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("orderId");
        if (orderId === String(currentOrder.order_id)) {
          alert(`Thanh toán MoMo cho đơn ${orderId} thành công!`);
        } else {
          alert("Thanh toán MoMo thành công! Kiểm tra backend để cập nhật trạng thái.");
        }
      }
      return res;
    } else {
      // Thanh toán offline / cash / card
      const body = {
        orderId: currentOrder.order_id,
        amount: currentOrder.total_amount,
        customerId: currentOrder.customer_id,
        method: payment.method,
        transactionRef: payment.transaction_ref || null,
      };

      const res = await postJSON("http://localhost:5099/api/payment/offlinepayment", body);
      if (res) alert("Thanh toán trực tiếp thành công!");
      return res;
    }
  };

    const click_buttonCreateNewOrder = async () => {
    console.log("===== 🧾 THÔNG TIN ĐƠN HÀNG HIỆN TẠI =====");
    console.log("Đơn hàng:", currentOrder);
    console.log("Sản phẩm trong đơn:", listOrderProducts);
    console.log("Khuyến mãi:", promotion);
    console.log("Thanh toán:", payment);

    if (listOrderProducts.length === 0) {
      alert("Vui lòng thêm sản phẩm vào đơn hàng!");
      return;
    }


    const orderData = orderObject(currentOrder, promotion);
    const listOrderItem = listOrderItemObject (listOrderProducts, currentOrder);

    const success = await createOrder(orderData);
    if (success) {
      const success1= await createOrderItems(listOrderItem);
      if(success1){

        alert("Lưu đơn lên database thành công");
      }else{
        alert("Lưu item thất bại");
      }
      
    } else {
      alert("Lưu đơn thất bại");
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
    console.log("Đơn Hàng: \n"+currentOrder);
  };

  //Chuẩn bị dữ liệu cho order
  const orderObject = (currentOrder, promotion) => {
    return {
      Id: currentOrder.id,
      OrderNumber: currentOrder.orderNumber,
      CustomerId: currentOrder.customerId, 
      UserId: currentOrder.userId,
      Status: currentOrder.status,
      Subtotal: currentOrder.subtotal,
      Discount: currentOrder.discount,
      TotalAmount: currentOrder.total_amount,
      PromotionId: promotion?.id || null, 
      Note: currentOrder.note,
      CreatedAt: currentOrder.createdAt, 
      UpdatedAt: currentOrder.updatedAt
    };
  };

  //Chuẩn bị dữ liệu một list OrderItem để gửi lên database OrderItem
  const listOrderItemObject = (listOrderProducts, currentOrder) =>{
    return listOrderProducts.map (product => ({
    OrderId : currentOrder.id,
    ProductId: product.id,
    Quantity: product.pty,
    UnitPrice: product.price,
    total_price: product.total,
    CreatedAt: new Date().toISOString() 
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
    changePromotion,
    pay,
    click_buttonCreateNewOrder, 
    orderObject,
    listOrderItemObject
 
  };
};