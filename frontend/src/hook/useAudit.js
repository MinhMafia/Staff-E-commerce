// src/hook/useAudit.js
import { useState } from 'react';

export const useAudit = () => {
    //Trạng thái modal chi tiết audit log => bạn đầu sẽ bị ẩn
  const [showAuditDetailModal, setShowAuditDetailModal] = useState(false);


  // Hàm đóng modal chi tiết audit log
  const openAuditDetailModal = () => setShowAuditDetailModal(true);
  const closeAuditDetailModal = () => setShowAuditDetailModal(false);

  return {
    showAuditDetailModal,
    setShowAuditDetailModal,
    openAuditDetailModal,
    closeAuditDetailModal,
  };
};
