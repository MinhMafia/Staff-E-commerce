import { useState,useEffect,useRef } from "react";


import { request } from "../api/apiClient"; 


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

  const isSubmittingRef = useRef(false);


  // --- Promotion ---
  const [promotion, setPromotion] = useState(
    {
      id: null,
      code: "",
      type: "",
      value: 0

    }
  )

  //Trạng thái phân trang 
    const [listOrders, setListOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState(null);

  // --- Modal controls ---
  const openCustomerModal = () => setShowCustomerModal(true);
  const closeCustomerModal = () => setShowCustomerModal(false);

  const openProductModal = () => setShowProductModal(true);
  const closeProductModal = () => setShowProductModal(false);



  const openOrderModal = (mode = "create", 
    order = null, 
    products = [], 
    payment = {
    method: "cash",
    transaction_ref: "",
    status: "pending",
  }, 
  selectedProduct=null,
  promotion={
    
      id: null,
      code: "",
      type: "",
      value: 0

    
  }) => {
    setOrdersFormMode(mode);
    setCurrentOrder(order);
    setSelectedProduct(selectedProduct);
    setListOrderProducts(products);
    setPayment(payment)
    setShowOrderModal(true);
    setPromotion(promotion);
    isSubmittingRef.current=false;
  };
  const closeOrderModal = () => setShowOrderModal(false);

  // --- API: tạo đơn tạm ---
  const createNewOrder = async () => {
    try {
     
      const orderData = await request("/orders/create-temp", { 
        method: "POST" 
      });

   
      openOrderModal("create", orderData, []);
      
    } catch (err) {
      console.error("Lỗi khi tạo đơn tạm:", err.message || err);
      alert("Không thể tạo đơn hàng mới: " + (err.message || "Lỗi không xác định"));
    }
  };

  async function cancelOrder(orderId) {
      try {
          const response = await fetch(`/api/orders/${orderId}/cancel`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              }
          });

          if (!response.ok) {
              console.error("API trả về lỗi HTTP:", response.status);
              alert("Không thể hủy đơn!");
              return;
          }

          const result = await response.json(); // true / false

          if (result === true) {
              alert("Hủy đơn hàng thành công!");
              loadOrdersAdvanced();
          } else {
              alert("Không thể hủy đơn!");
          }

      } catch (error) {
          console.error("Lỗi khi hủy đơn:", error);
          alert("Có lỗi kết nối khi hủy đơn!");
      }
  }

  //Lưu đon hàng lên database
  // async function createOrder(orderData) {
  //   try {
  //     console.log("Dữ liệu gửi lên:", orderData);

  //     const result = await request("/orders/create", {
  //       method: "POST",
  //       body: orderData,  
  //     });

  //     return result === true;
  //   } catch (error) {
  //     console.error("Lỗi khi tạo đơn hàng:", error);
  //     return false;
  //   }
  // }

  async function createOrder(orderData) {
  try {
    console.log("Dữ liệu gửi lên:", orderData);

    const savedOrder = await request("/orders/create", {
      method: "POST",
      body: orderData,
    });

    if (!savedOrder || !savedOrder.id) {
      throw new Error("Create order failed: invalid response");
    }

    return savedOrder;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return null;
  }
}



  const createOrderItems = async (orderItems) => {
    try {
      const result = await request("/orderitem/create", {
        method: "POST",
        body: orderItems,
      });
      return result === true;
    } catch (err) {
      alert("Lưu sản phẩm thất bại: " + err.message);
      return false;
    }
  };



  const applyPromotion = async (promotionId, orderId, customerId) => {
    try {
      await request("/promotions/apply", {
        method: "POST",
        body: { PromotionId: promotionId, OrderId: orderId, CustomerId: customerId },
      });
      return true;
    } catch (err) {
      console.error("Apply promotion error:", err.message);
      return false;
    }
  };


  const reduceInventory = async (items) => {
    try {
      await request("/inventory/reduce-multiple", {
        method: "POST",
        body: items,
      });
      return true;
    } catch (err) {
      alert("Cập nhật kho thất bại: " + err.message);
      return false;
    }
  };



// const pay = async (method = "cash") => {
//   if (!currentOrder) return;

//   // ======= THANH TOÁN MOMO =======
//   if (method === "other") {

//     // 1. Gọi API tạo payment
//     const body = {
//       OrderId: currentOrder.id,
//       Amount: Math.round(currentOrder.total_amount),

//       // Không cần ReturnUrl vì thanh toán mở popup
//       ReturnUrl: "",

//       NotifyUrl: "https://stainful-asher-unfeigningly.ngrok-free.dev/api/payment/momo/ipn"
//     };

//     const res = await request("/payment/momo/create", { method: "POST", body });

//     if (!res?.payUrl) {
//       alert("Không lấy được payUrl từ MoMo");
//       return null;
//     }

//     // 2. Mở popup momo
//     const popup = window.open(res.payUrl, "_blank", "width=480,height=700");

//     if (!popup) {
//       alert("Trình duyệt chặn popup. Hãy cho phép mở popup.");
//       return null;
//     }

//     // 3. Polling để chờ trạng thái thanh toán
//     return new Promise((resolve) => {
//       let counter = 0;

//       const interval = setInterval(async () => {
//         counter++;

//         const statusRes = await fetch(`http://localhost:5099/api/payment/status/${currentOrder.id}`);

//         if (statusRes.ok) {
//           const data = await statusRes.json();

//           console.log("Payment status →", data.status);

//           // MoMo ipn đã cập nhật DB → success
//           if (data.status === "completed") {
//             clearInterval(interval);
//             popup.close();

//             resolve({
//               success: true,
//               message: "Thanh toán thành công!"
//             });
//           }
//         }

//         // Hết 2 phút → timeout
//         if (counter >= 60) {
//           clearInterval(interval);
//           popup.close();
//           resolve({
//             success: false,
//             message: "Quá thời gian chờ thanh toán"
//           });
//         }

//       }, 2000);
//     });
//   }

//   // ======= CASH / OTHER METHODS =======
//   const body = {
//     OrderId: currentOrder.id,
//     Amount: Math.round(currentOrder.total_amount),
//     Method: method,
//     Status: "completed"
//   };

//   return await request("/payment/offlinepayment", { method: "POST", body });
// };

const pay = async (method = "cash") => {
  if (!currentOrder) return;

  // ======= THANH TOÁN MOMO =======
  if (method === "other") {

    // 1. Gọi API tạo payment
    const body = {
      OrderId: currentOrder.id,
      Amount: Math.round(currentOrder.total_amount),

      // Không cần ReturnUrl vì thanh toán mở popup
      ReturnUrl: "",

      NotifyUrl:
        "https://stainful-asher-unfeigningly.ngrok-free.dev/api/payment/momo/ipn"
    };

    const res = await request("/payment/momo/create", { method: "POST", body });

    if (!res?.payUrl) {
      alert("Không lấy được payUrl từ MoMo");
      return null;
    }

    // 2. Mở popup momo
    const popup = window.open(
      res.payUrl,
      "_blank",
      "width=480,height=700"
    );

    if (!popup) {
      alert("Trình duyệt chặn popup. Hãy cho phép mở popup.");
      return null;
    }

    // 3. Polling để chờ trạng thái thanh toán
    return new Promise((resolve) => {
      let counter = 0;
      let finished = false; // 🔒 chống resolve nhiều lần

      const interval = setInterval(async () => {

        // ❌ Người dùng tự đóng popup
        if (popup.closed && !finished) {
          finished = true;
          clearInterval(interval);

          resolve({
            success: false,
            message: "Bạn đã đóng cửa sổ thanh toán MoMo"
          });
          return;
        }

        counter++;

        try {
          const statusRes = await fetch(
            `http://localhost:5099/api/payment/status/${currentOrder.id}`
          );

          if (statusRes.ok) {
            const data = await statusRes.json();

            console.log("Payment status →", data.status);

            // ✅ MoMo IPN đã cập nhật DB → success
            if (data.status === "completed" && !finished) {
              finished = true;
              clearInterval(interval);
              popup.close();

              resolve({
                success: true,
                message: "Thanh toán thành công!"
              });
              return;
            }

            // ❌ Thanh toán thất bại / huỷ
            if (
              (data.status === "failed" ||
                data.status === "canceled") &&
              !finished
            ) {
              finished = true;
              clearInterval(interval);
              popup.close();

              resolve({
                success: false,
                message: "Thanh toán không thành công"
              });
              return;
            }
          }
        } catch (err) {
          console.error("Check payment error", err);
        }

        // ⏰ Hết 2 phút → timeout
        if (counter >= 60 && !finished) {
          finished = true;
          clearInterval(interval);
          popup.close();

          resolve({
            success: false,
            message: "Quá thời gian chờ thanh toán"
          });
        }

      }, 2000);
    });
  }

  // ======= CASH / OTHER METHODS =======
  const body = {
    OrderId: currentOrder.id,
    Amount: Math.round(currentOrder.total_amount),
    Method: method,
    Status: "completed"
  };

  return await request("/payment/offlinepayment", { method: "POST", body });
};



const click_buttonCreateNewOrder = async () => {
  if (isSubmittingRef.current) return;
  isSubmittingRef.current = true;

  try {
     await Handleclick_buttonCreateNewOrder(); 
  } finally {
     isSubmittingRef.current = false;
  }
};



// const Handleclick_buttonCreateNewOrder = async () => {
 

//   console.log("=== BẮT ĐẦU TẠO ĐƠN HÀNG ===");
//   console.log("Current Order:", currentOrder);
//   console.log("Khuyến mãi:", promotion);
//   console.log("Danh sách sản phẩm:", listOrderProducts);

//   // Check xem có sản phẩm trong đơn không
//   if (!listOrderProducts || listOrderProducts.length === 0) {
//     alert("Vui lòng thêm sản phẩm vào đơn hàng!");
//     return;
//   }

//   // Chuẩn bị dữ liệu
//   const orderData = orderObject(currentOrder, promotion, payment);
   
//   // --- Lưu đơn hàng ---
//   const savedOrder = await createOrder(orderData);
//   if (!savedOrder) {
//     alert("Lưu đơn thất bại");
//     return;
//   }

//   // Cập nhật lại order hiện tại bằng order đã lưu trong DB
//   setCurrentOrder(savedOrder);

//   const listOrderItem = listOrderItemObject(listOrderProducts, currentOrder);
//   const listreduceItem = listReduceItemObject(listOrderProducts);

//   console.log("===== THÔNG TIN TRUYỀN LÊN DB =====");
//   console.log("Đơn hàng:", orderData);
//   console.log("Sản phẩm trong đơn:", listOrderItem);
//   console.log("Sản phẩm bị trừ:", listreduceItem);

 

//   // --- Lưu sản phẩm trong đơn ---
//   const success1 = await createOrderItems(listOrderItem);
//   if (!success1) {
//     alert("Lưu sản phẩm thất bại");
//     return;
//   }

//   // --- Giảm inventory ---
//   const success2 = await reduceInventory(listreduceItem);
//   if (!success2) {
//     alert("Cập nhật kho thất bại");
//     return;
//   } else {
//     console.log("Giảm số lượng sản phẩm trong inventory thành công");
//   }

//   // --- Apply promotion nếu có ---
//   if (promotion?.id != null && currentOrder.customerId) {
//     const success3 = await applyPromotion(
//       promotion.id,
//       currentOrder.id,
//       currentOrder.customerId
//     );
//     console.log(success3 ? "Apply promotion thành công" : "Apply promotion thất bại");
//   }

//   // --- Thanh toán ---
//   if (!payment?.method) payment.method = "cash"; // mặc định cash
//   try {
//     const paymentResult = await pay(payment.method);
//     if (paymentResult) {
//       console.log("Thanh toán thành công:", paymentResult);
//       alert("Thanh toán thành công");

//       // --- Hỏi có muốn in phiếu không ---
//       const printConfirm = window.confirm("Đơn hàng đã lưu thành công. Bạn có muốn in phiếu không?");
//       if (printConfirm) {
//         printOrder(currentOrder, listOrderProducts, promotion, payment);
//       }


//       closeOrderModal();
//     } else {
//       console.log("Thanh toán thất bại hoặc bị hủy");
//       closeOrderModal();
//     }
//   } catch (err) {
//     console.error("Lỗi khi thanh toán:", err);
//     alert("Thanh toán gặp lỗi");
//     closeOrderModal();
//   }

//   console.log("=== KẾT THÚC TẠO ĐƠN HÀNG ===");
//   setCurrentPage(1);
//   loadOrdersAdvanced();
// };

const Handleclick_buttonCreateNewOrder = async () => {
  console.log("=== BẮT ĐẦU TẠO ĐƠN HÀNG ===");

  // 1️⃣ Check sản phẩm
  if (!listOrderProducts || listOrderProducts.length === 0) {
    alert("Vui lòng thêm sản phẩm vào đơn hàng!");
    return;
  }

  // 2️⃣ Chuẩn bị dữ liệu order
  const orderData = orderObject(currentOrder, promotion, payment);

  // 3️⃣ Lưu đơn hàng
  const savedOrder = await createOrder(orderData);
  if (!savedOrder) {
    alert("Lưu đơn thất bại");
    return;
  }

  // ⚠️ CỰC KỲ QUAN TRỌNG: dùng order đã lưu
  setCurrentOrder(savedOrder);

  const listOrderItem = listOrderItemObject(listOrderProducts, savedOrder);
  const listreduceItem = listReduceItemObject(listOrderProducts);

  // 4️⃣ Lưu order items
  const success1 = await createOrderItems(listOrderItem);
  if (!success1) {
    alert("Lưu sản phẩm thất bại");
    return;
  }

  // 5️⃣ Trừ kho
  const success2 = await reduceInventory(listreduceItem);
  if (!success2) {
    alert("Cập nhật kho thất bại");
    return;
  }

  // 6️⃣ Apply promotion
  if (promotion?.id != null && savedOrder.customerId) {
    await applyPromotion(
      promotion.id,
      savedOrder.id,
      savedOrder.customerId
    );
  }

  // 7️⃣ THANH TOÁN
  if (!payment?.method) payment.method = "cash";

  try {
    const paymentResult = await pay(payment.method);

    // ❌ Thanh toán thất bại / user đóng popup / timeout
    if (!paymentResult || paymentResult.success !== true) {
      alert(paymentResult?.message || "Thanh toán không thành công");
      closeOrderModal();
      return;
    }

    // ✅ Thanh toán thành công
    alert(paymentResult.message || "Thanh toán thành công");

    // 8️⃣ In phiếu
    const printConfirm = window.confirm(
      "Đơn hàng đã lưu thành công. Bạn có muốn in phiếu không?"
    );
    if (printConfirm) {
      printOrder(savedOrder, listOrderProducts, promotion, payment);
    }

    closeOrderModal();
  } catch (err) {
    console.error("Lỗi khi thanh toán:", err);
    alert("Thanh toán gặp lỗi");
    closeOrderModal();
  }

  console.log("=== KẾT THÚC TẠO ĐƠN HÀNG ===");
  setCurrentPage(1);
  loadOrdersAdvanced();
};



// ================== IN HÓA ĐƠN BẰNG IFRAME - KHÔNG BAO GIỜ BỊ CHẶN ==================
const printOrder = (order, products, promotion, payment) => {
  // Format tiền đẹp
  const f = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  // Nội dung hóa đơn (HTML đầy đủ)
  let html = `
<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Hóa đơn #${order.orderNumber || order.id}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 20px; font-size: 14px; }
  h2 { text-align: center; color: #1a9a7d; margin: 0 0 15px 0; }
  .info { margin: 5px 0; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #000; padding: 8px; text-align: center; }
  th { background: #f0f0f0; }
  .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 15px; }
  .promo { color: red; font-weight: bold; }
  .footer { margin-top: 40px; text-align: center; font-size: 18px; font-weight: bold; }
  @media print { body { margin: 5mm; } }
</style>
</head>
<body>
  <h2>PHIẾU THANH TOÁN</h2>
  <div class="info"><strong>Mã đơn:</strong> #${order.orderNumber || order.id}</div>
  <div class="info"><strong>Khách hàng:</strong> ${order.customerName || 'Khách lẻ'}</div>
  <div class="info"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</div>

  <table>
    <tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
  `;

  products.forEach(p => {
    html += `
    <tr>
      <td style="text-align:left; padding-left:10px;">${p.product || p.productName}</td>
      <td>${p.qty || p.quantity}</td>
      <td>${f(p.price)}</td>
      <td>${f(p.total || p.price * p.qty)}</td>
    </tr>`;
  });

  html += `
  </table>
  <div class="total">TỔNG TIỀN: ${f(order.total_amount)}</div>
  ${promotion?.code ? `<div class="promo">Khuyến mãi (${promotion.code}): -${f(promotion.value || 0)}</div>` : ''}
  <div style="margin-top:20px; font-size:18px; font-weight:bold;">
    Thanh toán: ${payment?.method === 'cash' ? 'TIỀN MẶT' : payment?.method === 'other' ? 'MOMO' : (payment?.method || 'CASH').toUpperCase()}
  </div>
  <div class="footer">CẢM ƠN QUÝ KHÁCH!<br>HẸN GẶP LẠI</div>
</body></html>`;

  // Tạo iframe ẩn và in
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  // TỰ ĐỘNG XÓA iframe sau khi in xong hoặc bấm Hủy
  iframe.contentWindow.onafterprint = () => {
    document.body.removeChild(iframe);
  };
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
    PromotionId: promotion?.id ?? null, 
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

const listReduceItemObject = (listOrderProducts)=>{
  return listOrderProducts.map(product => ({
    ProductId: product.id,  
    Quantity: product.qty
  }));
}


/**
 * Api lấy danh sách có phân trang nâng cao (Phân trang bình thường, lọc theo trạng thái đơn hàng, lọc theo ngày bắt đầu kết thúc, tìm kiếm )
 */

const loadOrdersAdvanced = async () => {
    try {
        const params = new URLSearchParams();
        params.append("pageNumber", currentPage);
        params.append("pageSize", pageSize);

        if (selectedStatus) params.append("status", selectedStatus);
        if (searchKeyword?.trim()) params.append("search", searchKeyword.trim());

        // Format ngày (nếu có)
        if (selectedStartDate) {
            params.append("startDate", new Date(selectedStartDate).toISOString());
        }
        if (selectedEndDate) {
            params.append("endDate", new Date(selectedEndDate).toISOString());
        }

        const url = `http://localhost:5099/api/orders/search?${params.toString()}`;

        const res = await fetch(url);

        if (!res.ok) {
            console.error("Lỗi tải danh sách đơn hàng:", res.status, await res.text());
            return;
        }

        const data = await res.json();

        setListOrders(data.items || []);
        setTotalPages(data.totalPages);

        console.log("Danh sách đơn hàng:", data);
        console.log("Params gửi lên:", {
            status: selectedStatus,
            search: searchKeyword,
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            page: currentPage
        });



    } catch (err) {
        console.error("loadOrdersAdvanced error:", err);
    }
};

useEffect(() => {
    console.log("totalPages đã cập nhật:", totalPages);
}, [totalPages]);
useEffect(() => {
    console.log(" currentPage đã cập nhật:", currentPage);
}, [currentPage]);



//Api lấy danh sách orderitem
async function loadOrderItemsByOrderId(orderId) {
    try {
        const res = await fetch(`http://localhost:5099/api/orderitem/byorder/${orderId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error("Không thể tải dữ liệu Order Items");
        }

        const data = await res.json();
        console.log("Order Items:", data);
        return data;

    } catch (err) {
        console.error("Lỗi:", err);
        return [];
    }
}

//Lấy khuyến mãi
async function getPromotionById(id) {
    try {
        const res = await fetch(`http://localhost:5099/api/promotions/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText);
        }

        const data = await res.json();
        console.log("Promotion data:", data);
        return data;

    } catch (err) {
        console.error("Lỗi:", err.message);
        return null;
    }
}

// Lấy payment
async function getPaymentByOrder(orderId) {
  const url = `http://localhost:5099/api/payment/getbyorder/${orderId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"

      }
    });

    if (response.status === 404) {
      return null; // không có payment
    }

    if (!response.ok) {
      throw new Error("Server error " + response.status);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching payment:", error);
    return null;
  }
}


// Hàm xử lí xem chi tiết đơn hàng 
const showOrder = async (index) => {
    const item = listOrders[index];
    if (!item) return;

    try {
        // Chuyển sang chế độ xem chi tiết
        setOrdersFormMode("detail");

        // Set thông tin đơn hàng chính
        setCurrentOrder(item);

        // ========== Lấy Order Items ==========
        const orderItems = await loadOrderItemsByOrderId(item.id);
        setListOrderProducts(orderItems);

        // Reset sản phẩm đang chọn (nếu modal có tab sản phẩm)
        setSelectedProduct(null);

        // ========== Lấy thông tin Payment ==========
        const payment = await getPaymentByOrder(item.id);
        setPayment(payment);

        // ========== Lấy thông tin Promotion ==========
        // item.PromotionId có thể null/undefined → cần kiểm tra
        if (item.promotionId || item.PromotionId) {
            const promoId = item.promotionId ?? item.PromotionId;
            const promo = await getPromotionById(promoId);
            setPromotion(promo);
        } else {
            setPromotion(null);
        }

        // Mở modal xem chi tiết
        setShowOrderModal(true);

    } catch (err) {
        console.error("showOrder error:", err);
        
    }
};



useEffect(() => {
    loadOrdersAdvanced();
}, [selectedStatus]);



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
  listReduceItemObject,

  currentPage,
  pageSize,
  totalPages,
  setCurrentPage,
  setTotalPages,
  selectedStatus,
  setSelectedStatus,
  selectedStartDate,
  selectedEndDate,
  setSelectedStartDate,
  setSelectedEndDate,
  searchKeyword,
  setSearchKeyword,
  loadOrdersAdvanced ,
  listOrders,
  setListOrders,
  loadOrderItemsByOrderId,
  getPromotionById,
  getPaymentByOrder,
  showOrder,
  cancelOrder

};

}
