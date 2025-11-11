// src/hook/useAudit.js
import { useState } from 'react';

export const useAudit = () => {
  const [showAuditDetailModal, setShowAuditDetailModal] = useState(false);

  const openAuditDetailModal = () => setShowAuditDetailModal(true);
  const closeAuditDetailModal = () => setShowAuditDetailModal(false);

  return {
    showAuditDetailModal,
    setShowAuditDetailModal,
    openAuditDetailModal,
    closeAuditDetailModal,
  };
};
