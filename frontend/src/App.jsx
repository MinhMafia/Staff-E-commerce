import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductList from "./pages/products/ProductList";
import OrdersPage from "./pages/orders/OrdersPage";
import AuditPage from "./pages/audits/AuditPage";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Khi người dùng truy cập "/" → tự chuyển đến trang Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/audit" element={<AuditPage />} />

          {/* Trang 404 (nếu cần) */}
          <Route path="*" element={<h1>404 - Page not found</h1>} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
