// src/hook/useOrders.js
import { useState } from "react";

export const useOrders = () => {
  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Form mode: "create" | "detail"
  const [ordersFormMode, setOrdersFormMode] = useState("create");

  // Current order info
  const [currentOrder, setCurrentOrder] = useState(null);

  // Product list in the order
  const [listOrderProducts, setListOrderProducts] = useState([]);

  // Payment info: chỉ hỗ trợ "cash" và "momo"
  const [payment, setPayment] = useState({
    method: "cash", // "cash" | "momo"
    transactionId: null, // chỉ dùng khi momo
    status: "pending",
    amount: 0,
  });

  // Modal controls
  const openCustomerModal = () => setShowCustomerModal(true);
  const closeCustomerModal = () => setShowCustomerModal(false);

  const openProductModal = () => setShowProductModal(true);
  const closeProductModal = () => setShowProductModal(false);

  const openOrderModal = (mode = "create", order = null, products = []) => {
    setOrdersFormMode(mode);
    setCurrentOrder(order);
    setListOrderProducts(products);
    setShowOrderModal(true);
  };
  const closeOrderModal = () => setShowOrderModal(false);

  // API: Tạo đơn tạm thời
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

      const orderData = await response.json();
      openOrderModal("create", orderData);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  // Cập nhật khách hàng khi chọn từ CustomerModal
  const updateCustomer = (customer) => {
    setCurrentOrder((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.fullName,
    }));
    closeCustomerModal();
  };

  // Thêm hoặc cập nhật sản phẩm khi chọn từ ProductModal
  const addOrUpdateProduct = (product) => {
    setListOrderProducts((prev) => {
      const existing = prev.find((p) => p.productId === product.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity + (product.quantity || 1) }
            : p
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    closeProductModal();
  };

  // Cập nhật payment (chỉ cash hoặc momo)
  const updatePayment = (update) => {
    setPayment((prev) => ({
      ...prev,
      ...update,
    }));
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

    // Order data
    ordersFormMode,
    setOrdersFormMode,
    currentOrder,
    setCurrentOrder,
    listOrderProducts,
    setListOrderProducts,
    payment,
    setPayment,

    // Actions
    createNewOrder,
    updateCustomer,
    addOrUpdateProduct,
    updatePayment,

  };
};
