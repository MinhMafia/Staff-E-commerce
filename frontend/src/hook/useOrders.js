import { useState } from "react";

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
  const [payment, setPayment] = useState(
    {
      method: "cash",
      transaction_ref: "",
      status: "pending",
    }
  );

  // --- Promotion ---
  const [promotion, setPromotion] = useState(
    {
      id: "",
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
 
  };
};
