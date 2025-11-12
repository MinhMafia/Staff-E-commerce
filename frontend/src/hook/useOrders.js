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



  const pay = async (method = "offline") => {
    if (!currentOrder) return;

    const baseUrl = "http://localhost:5099/api/payment";

    if (method === "momo") {
      // URL frontend để redirect sau khi MoMo thanh toán xong
      const currentPageUrl = window.location.href;

      const body = {
        orderId: currentOrder.order_id,
        amount: currentOrder.total_amount,
        returnUrl: currentPageUrl,             
        notifyUrl: `${baseUrl}/momo/ipn`,      
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
        orderId: currentOrder.order_id,
        amount: currentOrder.total_amount,
        customerId: currentOrder.customer_id,
        method: method,                         // method có thể là "cash", "card", ...
        transactionRef: null                     // optional nếu có
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


      const orderData = orderObject(currentOrder, promotion);
      const listOrderItem = listOrderItemObject (listOrderProducts, currentOrder);

      const success = await createOrder(orderData);
      if (success) {
        console.log("Đã thành công lưu Order vào băng");
        const success1= await createOrderItems(listOrderItem);
        if(success1){
          console.log("Đã thành công lưu OrderItem vào băng");
          const success2 = await applyPromotion(
            promotion.id,         // promotionId
            currentOrder.id,      // orderId
            currentOrder.customerId // customerId
          );
          if(success2){
            console.log("Đã thành công lưu Promotion vào băng");
            alert("Lưu đơn lên database thành công");
          }
          
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
    TotalPrice: product.total,
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
    applyPromotion,
    pay,
    click_buttonCreateNewOrder, 
    orderObject,
    listOrderItemObject
 
  };
};