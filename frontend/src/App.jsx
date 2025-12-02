import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductList from "./pages/products/ProductList";
import OrdersPage from "./pages/orders/OrdersPage";
import AuditPage from "./pages/audits/AuditPage";
import UserManagement from "./pages/users/UserManagement";
import ProfilePage from "./pages/profile/ProfilePage";
import PromotionList from "./pages/promotions/PromotionList";
import PromotionDetail from "./pages/promotions/PromotionDetail";
import PromotionCreate from "./pages/promotions/PromotionCreate";
import PromotionEdit from "./pages/promotions/PromotionEdit";
import LoginPage from "./pages/login/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";
import CustomerList from "./pages/customers/CustomerList";
import CategoryList from "./pages/categories/CategoryList";
import ReportsPage from "./pages/reports/ReportsPage";
import InventoryList from "./pages/inventory/InventoryList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Promotion Routes */}
          <Route path="/promotions" element={<PromotionList />} />
          <Route path="/promotions/create" element={<PromotionCreate />} />
          <Route path="/promotions/:id" element={<PromotionDetail />} />
          <Route path="/promotions/:id/edit" element={<PromotionEdit />} />

          {/*Customer Routes */}
          <Route path="/customers" element={<CustomerList />} />

          {/*Category Routes */}
          <Route path="/categories" element={<CategoryList />} />

          {/*Reports Routes */}
          <Route path="/reports" element={<ReportsPage />} />

          <Route path="*" element={<h1>404 - Page not found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
