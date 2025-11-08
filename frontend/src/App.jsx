import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductList from "./pages/products/ProductList";
import OrdersPage from "./pages/orders/OrdersPage";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          {/* Trang quan lí đơn hàng bán trực tiếp */}
          <Route path="/orders" element={<OrdersPage />} />
          
          {/* các route khác */}
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
export default App;
