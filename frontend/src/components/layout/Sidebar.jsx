import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Nếu bạn không dùng react-router, thay NavLink bằng <a href="..."> và className active logic
 */

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z"
      fill="currentColor"
    />
  </svg>
);

const IconProducts = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 16V8a2 2 0 00-1-1.732L13 2l-7 4.268A2 2 0 005 8v8a2 2 0 001 1.732L11 22l7-4.268A2 2 0 0021 16z"
      fill="currentColor"
    />
  </svg>
);

export default function Sidebar({ collapsed, onClose }) {
  // collapsed = true : hide labels (for mobile or small)
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ${
      isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-700"
    }`;

  return (
    <aside
      className={`bg-white border-r border-gray-200 w-64 ${
        collapsed ? "hidden md:block" : "block"
      } h-screen fixed`}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b">
        <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold">
          SM
        </div>
        <div className="hidden md:block">
          <div className="text-lg font-semibold">StoreMgr</div>
          <div className="text-xs text-gray-500">Quản lý cửa hàng</div>
        </div>
        <div className="md:hidden ml-auto">
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            {/* close icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {/* Dashboard */}
        <NavLink to="/dashboard" className={linkClass}>
          <span className="w-5 h-5">
            <IconDashboard />
          </span>
          <span className="text-sm">Tổng quan</span>
        </NavLink>

        {/* POS */}
        <NavLink to="/orders" className={linkClass}>
          <span className="w-5 h-5">🧾</span>
          <span className="text-sm">Bán hàng (POS)</span>
        </NavLink>

        <div className="border-t my-2" />

        {/* Products */}
        <NavLink to="/products" className={linkClass}>
          <span className="w-5 h-5">
            <IconProducts />
          </span>
          <span className="text-sm">Quản lý Sản phẩm</span>
        </NavLink>

        {/* Customers */}
        <NavLink to="/customers" className={linkClass}>
          <span className="w-5 h-5">👥</span>
          <span className="text-sm">Quản lý Khách hàng</span>
        </NavLink>

        {/* Promotions */}
        <NavLink to="/promotions" className={linkClass}>
          <span className="w-5 h-5">🏷️</span>
          <span className="text-sm">Quản lý Giảm giá</span>
        </NavLink>

        {/* Reports */}
        <NavLink to="/reports" className={linkClass}>
          <span className="w-5 h-5">📊</span>
          <span className="text-sm">Báo cáo/Thống kê</span>
        </NavLink>

        {/* Audit */}
        <NavLink to="/audits" className={linkClass}>
          <span className="w-5 h-5">🗂️</span>
          <span className="text-sm">Nhật ký hệ thống</span>
        </NavLink>

        {/* Settings */}
        <NavLink to="/settings" className={linkClass}>
          <span className="w-5 h-5">⚙️</span>
          <span className="text-sm">Cài đặt</span>
        </NavLink>

        <div className="border-t my-2" />

        <button
          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
          onClick={() => {
            /* logout logic */
          }}
        >
          🚪 Đăng xuất
        </button>
      </nav>

      <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-400">
        <div>Version</div>
        <div>v.0.1</div>
      </div>
    </aside>
  );
}
