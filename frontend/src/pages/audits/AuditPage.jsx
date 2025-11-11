import React from "react";
import AuditTable from "../../components/audits/AuditTable";
import AuditDetail from "../../components/audits/AuditDetail";
import { useAudit } from "../../hook/useAudit";


export default function AuditPage() {
    const {
        showAuditDetailModal,
        openAuditDetailModal,
        closeAuditDetailModal,
    } = useAudit();
    

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Tiêu đề */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Nhật Ký Hoạt Động (Audit Log)
                </h1>
                <p className="text-gray-600 mt-1">
                    Theo dõi mọi thao tác của nhân viên trong hệ thống
                </p>
            </div>

            {/* Hàng 1: Nút Xuất CSV */}
            <div className="flex justify-end mb-4">
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow transition">
                    Xuất CSV
                </button>
            </div>

            {/* Hàng 2: Tìm kiếm */}
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Tìm tên nhân viên ...."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                    Tìm Kiếm
                </button>
            </div>

            {/* Hàng 3: Bộ lọc chi tiết */}
            <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Ngày bắt đầu */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ">
                            Ngày Bắt Đầu
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none "
                        />
                    </div>

                    {/* Ngày kết thúc */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Ngày Kết Thúc
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none "
                        />
                    </div>

                    {/* Nút lọc */}
                    <div className="flex items-end">
                        <button className="w-full px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                            Lọc
                        </button>
                    </div>
                </div>
                
            </div>
            <AuditTable openAuditDetailModal={openAuditDetailModal}/>
            {showAuditDetailModal&&<AuditDetail onClose={closeAuditDetailModal}/>}

        </div>
    );
}
