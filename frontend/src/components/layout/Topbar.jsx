import React, { useState } from "react";

const SearchIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    {...props}
  >
    <path
      d="M21 21l-4.35-4.35"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="11"
      cy="11"
      r="6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    {...props}
  >
    <path
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21a2 2 0 01-3.46 0"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Topbar({ onToggleSidebar }) {
  // const [q, setQ] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();
  //   // TODO: call parent search handler or navigate to search page
  //   console.log("Search for:", q);
  // };

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring"
          aria-label="Toggle sidebar"
        >
          {/* menu icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-700 block lg:hidden"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1"
        >
          <SearchIcon className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Tìm kiếm toàn hệ thống..."
            className="bg-transparent outline-none text-sm w-64 placeholder-gray-500"
          />
        </form> */}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md hover:bg-gray-100 focus:outline-none">
          <BellIcon className="text-gray-600" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-500 rounded-full">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 focus:outline-none"
            aria-haspopup="true"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium">
              N
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-medium text-gray-800">Nguyên</span>
              <span className="text-xs text-gray-500">Nhân viên</span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-500"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
              <a
                href="/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-50"
              >
                Hồ sơ
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cài đặt
              </a>
              <div className="border-t" />
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  /* logout */ console.log("Logout");
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
