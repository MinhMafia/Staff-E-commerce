import React from "react";

export default function ProductModal({onClose}) {
   
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-bold">Chọn Sản Phẩm</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        className="w-full px-4 py-2 border rounded-lg mb-4"
                    />

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left">Mã SP</th>
                                    <th className="px-4 py-2 text-left">Tên SP</th>
                                    <th className="px-4 py-2 text-right">Giá</th>
                                    <th className="px-4 py-2 text-center">Chọn</th>
                                </tr>
                            </thead>
                            <tbody>

                                {/* Dữ liệu giả */}
                                <tr className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-4 py-2">SP001</td>
                                    <td className="px-4 py-2">Áo Thun Nam</td>
                                    <td className="px-4 py-2 text-right font-bold">150,000₫</td>
                                    <td className="px-4 py-2 text-center">
                                        <input type="radio" name="selectedProduct" />
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-4 py-2">SP002</td>
                                    <td className="px-4 py-2">Quần Jean Nữ</td>
                                    <td className="px-4 py-2 text-right font-bold">320,000₫</td>
                                    <td className="px-4 py-2 text-center">
                                        <input type="radio" name="selectedProduct" />
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-4 py-2">SP003</td>
                                    <td className="px-4 py-2">Giày Thể Thao</td>
                                    <td className="px-4 py-2 text-right font-bold">500,000₫</td>
                                    <td className="px-4 py-2 text-center">
                                        <input type="radio" name="selectedProduct" />
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Pagination tĩnh */}
                <div className="flex justify-center items-center gap-3 mt-4">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-gray-300 ">
                        Prev
                    </button>
                    <span>1 / 3</span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-gray-300">
                        Next
                    </button>
                </div>


                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 border-t">
                    <button className="px-6 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                        Chọn Sản Phẩm
                    </button>
                </div>

            </div>
        </div>
    );
}
