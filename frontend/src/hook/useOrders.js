// src/hook/useOrders.js   ← FILE NÀY LÀ FILE THẬT BẠN ĐANG DÙNG
import { useState } from 'react';

export const useOrders = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const openCustomerModal = () => setShowCustomerModal(true);
  const closeCustomerModal = () => setShowCustomerModal(false);

  const openProductModal = () => setShowProductModal(true);
  const closeProductModal = () => setShowProductModal(false);

  const openOrderModal = () => setShowOrderModal(true);
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
  };
};