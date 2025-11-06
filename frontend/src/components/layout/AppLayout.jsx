import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={!sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Page content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
