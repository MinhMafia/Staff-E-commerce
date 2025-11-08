// src/pages/orders/hooks/useOrders.js
import { useState } from 'react';

export const useOrders = () => {
  
  const [orders, setOrders] = useState([
    { id: 1, order_number: "DH001", customer_name: "Nguyễn Văn A", user_name: "NV001", total_amount: 50000, status: "pending", payment_method: "cash" },
    { id: 2, order_number: "DH002", customer_name: "Trần Thị B", user_name: "NV002", total_amount: 120000, status: "paid", payment_method: "momo", transaction_ref: "MOMO123456", payment_status: "Thành công" },
    { id: 3, order_number: "DH003", customer_name: "Lê Văn C", user_name: "NV003", total_amount: 80000, status: "pending", payment_method: "cash" }
  ]);

  const customers = [
    { id: 1, full_name: "Nguyễn Văn A", phone: "0901234567" },
    { id: 2, full_name: "Trần Thị B", phone: "0909876543" },
    { id: 3, full_name: "Lê Văn C", phone: "0912345678" }
  ];

  const products = [
    { id: 1, sku: "SP001", product_name: "Coca Cola 330ml", price: 12000 },
    { id: 2, sku: "SP002", product_name: "Bánh Oreo", price: 25000 },
    { id: 3, sku: "SP003", product_name: "Mì Hảo Hảo", price: 5000 }
  ];

  const promotions = [
    { id: 1, code: "GIAM10", type: "percent", value: 10, min_order_amount: 100000, active: 1 },
    { id: 2, code: "GIAM20K", type: "fixed", value: 20000, min_order_amount: 150000, active: 1 },
    { id: 3, code: "FREESHIP", type: "fixed", value: 15000, min_order_amount: 0, active: 1 }
  ];

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [current, setCurrent] = useState({ items: [], promotion: null, status: 'pending', payment_method: 'cash' });

  // Chi tiết sản phẩm đang thêm
  const [selectedProduct, setSelectedProduct] = useState({});
  const [newItem, setNewItem] = useState({ quantity: 1 });
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  // Modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Promotion
  const [promoSearch, setPromoSearch] = useState('');
  const [filteredPromotions, setFilteredPromotions] = useState(promotions.filter(p => p.active));

  // Table filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  // Helper functions
  const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

  const subtotal = current.items.reduce((sum, item) => sum + item.total_price, 0);
  const discount = (() => {
    if (!current.promotion) return 0;
    if (subtotal < (current.promotion.min_order_amount || 0)) return 0;
    return current.promotion.type === 'percent'
      ? subtotal * current.promotion.value / 100
      : current.promotion.value;
  })();
  const totalAmount = Math.max(0, subtotal - discount);

  const openCreateOrder = () => {
    setIsCreating(true); setIsProcessing(false); setIsCancelling(false);
    setFormTitle('Tạo Đơn Hàng Mới');
    setCurrent({
      order_number: 'DH' + Date.now().toString().slice(-6),
      customer_id: null, customer_name: '', user_name: 'Nguyễn Văn Staff',
      create_at: new Date().toLocaleString('vi-VN'), update_at: '',
      note: '', status: 'pending', items: [], promotion: null,
      payment_method: 'cash'
    });
    setNewItem({ quantity: 1 });
    setSelectedProduct({});
    setEditingItemIndex(null);
    setShowForm(true);
  };

  const createOrder = () => {
    if (current.items.length === 0) return alert('Chưa có sản phẩm nào!');
    const newOrder = {
      ...current,
      id: Date.now(),
      total_amount: totalAmount
    };
    setOrders(prev => [newOrder, ...prev]);
    alert(`Tạo thành công đơn ${current.order_number}`);
    setShowForm(false);
  };

  const viewOrder = (order) => {
    setIsCreating(false); setIsProcessing(false); setIsCancelling(false);
    setFormTitle('Chi Tiết Đơn Hàng');
    setCurrent({
      ...order,
      items: generateFakeItems(order.id),
      create_at: order.create_at || new Date().toLocaleString('vi-VN')
    });
    setShowForm(true);
  };

  const generateFakeItems = (orderId) => {
    const data = {
      1: [{ sku: 'SP001', product_name: 'Coca Cola 330ml', quantity: 2, unit_price: 12000, total_price: 24000 }],
      2: [{ sku: 'SP002', product_name: 'Bánh Oreo', quantity: 3, unit_price: 25000, total_price: 75000 }],
      3: [{ sku: 'SP003', product_name: 'Mì Hảo Hảo', quantity: 16, unit_price: 5000, total_price: 80000 }]
    };
    return data[orderId] || [];
  };

  const statusText = (s) => ({ pending: 'Chưa xử lý', paid: 'Đã thanh toán', completed: 'Hoàn thành', cancelled: 'Đã hủy' })[s] || s;
  const statusBadge = (s) => {
    const colors = { pending: 'bg-yellow-500', paid: 'bg-green-600', completed: 'bg-blue-600', cancelled: 'bg-red-600' };
    return `px-3 py-1 rounded-full text-white text-xs font-bold ${colors[s] || 'bg-gray-500'}`;
  };

  return {
    // data
    orders, setOrders, customers, products, promotions,
    // form
    showForm, setShowForm, formTitle, isCreating, isProcessing, isCancelling,
    current, setCurrent,
    // item
    selectedProduct, setSelectedProduct, newItem, setNewItem, editingItemIndex, setEditingItemIndex,
    // modal
    showCustomerModal, setShowCustomerModal, showProductModal, setShowProductModal,
    customerSearch, setCustomerSearch, productSearch, setProductSearch,
    selectedCustomer, setSelectedCustomer, filteredCustomers, setFilteredCustomers,
    filteredProducts, setFilteredProducts,
    // promotion
    promoSearch, setPromoSearch, filteredPromotions, setFilteredPromotions,
    // table
    searchQuery, setSearchQuery, filterStatus, setFilterStatus, page, setPage, perPage,
    // helper
    formatVND, subtotal, discount, totalAmount,
    openCreateOrder, createOrder, viewOrder, generateFakeItems, statusText, statusBadge
  };


};