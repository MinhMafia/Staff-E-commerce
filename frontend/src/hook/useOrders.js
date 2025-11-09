// src/hook/useOrders.js   
import { useState } from 'react';

export const useOrders = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [ordersFormMode, setOrdersFormMode] = useState("create"); // "create" | "detail"
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // Đóng mở và đóng modal Khách hàng
  const openCustomerModal = () => setShowCustomerModal(true);
  const closeCustomerModal = () => setShowCustomerModal(false);

  // Đóng mở và đóng modal Sản phẩm
  const openProductModal = () => setShowProductModal(true);
  const closeProductModal = () => setShowProductModal(false);

  // Đóng mở và đóng modal Đơn hàng
  const openOrderModal = (mode = "create") => {
    // Thiết lập chế độ cho form đơn hàng
    setOrdersFormMode(mode);

    setShowOrderModal(true);
  };





  const closeOrderModal = () => setShowOrderModal(false); 

  return {
    showCustomerModal,
    openCustomerModal,
    closeCustomerModal,

    showProductModal,
    openProductModal,
    closeProductModal,

    showOrderModal,
    openOrderModal,
    closeOrderModal,
    ordersFormMode,
    setOrdersFormMode,
    currentOrder,
    setCurrentOrder, 
  };
};