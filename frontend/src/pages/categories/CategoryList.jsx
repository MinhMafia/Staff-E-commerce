import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  setCurrentPage,
  setSearchTerm,
  setStatusFilter,
  toggleStatus,
  resetFilters,
} from "../../features/categories/categorySlice";
import Pagination from "../../components/ui/Pagination";
import CategoryDetailModal from "../../components/categories/CategoryDetailModal";
import CategoryEditModal from "../../components/categories/CategoryEditModal";
import CategoryAddModal from "../../components/categories/CategoryAddModal";
import { Search, Edit2, Power, Eye, RotateCcw } from "lucide-react";

const CategoryList = () => {
  const dispatch = useDispatch();
  const {
    items: categories,
    loading,
    error,
    pagination,
    filters,
  } = useSelector((state) => state.categories);

  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch categories when filters or pagination changes
  useEffect(() => {
    dispatch(
      fetchCategories({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        search: filters.search,
        status: filters.status,
      })
    );
  }, [
    dispatch,
    pagination.currentPage,
    filters.search,
    filters.status,
    pagination.pageSize,
  ]);

  const handleSearch = () => {
    dispatch(setSearchTerm(localSearchTerm));
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleStatusFilter = (status) => {
    dispatch(setStatusFilter(status));
  };

  const handleToggleStatus = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      try {
        console.log(
          "Toggling status for category:",
          categoryId,
          "Current status:",
          category.isActive
        );
        const result = await dispatch(
          toggleStatus({ categoryId, isActive: !category.isActive })
        ).unwrap();
        console.log("Toggle status result:", result);

        // Small delay to ensure backend has processed the change
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Refetch categories after toggle status
        console.log("Refetching categories...");
        await dispatch(
          fetchCategories({
            page: pagination.currentPage,
            pageSize: pagination.pageSize,
            search: filters.search,
            status: filters.status,
          })
        ).unwrap();
        console.log("Categories refetched successfully");
      } catch (error) {
        console.error("Error toggling status:", error);
      }
    }
  };

  const handleView = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const handleEdit = (categoryId) => {
    setEditingCategoryId(categoryId);
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setLocalSearchTerm("");
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Danh Mục</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm Danh Mục
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div
          className="p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100"
          onClick={() => handleStatusFilter("active")}
        >
          <p className="text-sm text-green-600">Đang Hoạt Động</p>
          <p className="text-2xl font-bold text-green-800">
            {categories.filter((c) => c.isActive).length}
          </p>
        </div>
        <div
          className="p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100"
          onClick={() => handleStatusFilter("inactive")}
        >
          <p className="text-sm text-red-600">Ngừng Hoạt Động</p>
          <p className="text-2xl font-bold text-red-800">
            {categories.filter((c) => !c.isActive).length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên danh mục, mô tả..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Search size={18} />
          Tìm kiếm
        </button>
        <select
          value={filters.status}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất Cả Trạng Thái</option>
          <option value="active">Đang Hoạt Động</option>
          <option value="inactive">Ngừng Hoạt Động</option>
        </select>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
          title="Làm mới danh sách"
        >
          <RotateCcw size={18} />
          Làm Mới
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-gray-300 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Tên Danh Mục
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Mô Tả
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {category.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const formattedDate = category.createdAt
                              ? new Date(category.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "";
                            return formattedDate;
                          })()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {category.slug || "-"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {category.description
                        ? category.description.substring(0, 50) +
                          (category.description.length > 50 ? "..." : "")
                        : "-"}
                    </td>
                    <td className="px-6 py-3">
                      {(() => {
                        const statusClass = category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800";
                        const statusText = category.isActive
                          ? "Hoạt Động"
                          : "Ngừng Hoạt Động";
                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}
                          >
                            {statusText}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(category.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(category.id)}
                          className={`p-2 rounded-lg transition ${
                            category.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-orange-600 hover:bg-orange-50"
                          }`}
                          title={
                            category.isActive ? "Ngừng hoạt động" : "Kích hoạt"
                          }
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination meta={pagination} onPageChange={handlePageChange} />
        <p className="mt-4 text-sm text-gray-600">
          Hiển thị {categories.length} trên {pagination.pageSize} danh mục
          (tổng: {pagination.totalItems})
        </p>
      </div>

      {/* Category Detail Modal */}
      {selectedCategoryId && (
        <CategoryDetailModal
          categoryId={selectedCategoryId}
          onClose={() => setSelectedCategoryId(null)}
        />
      )}

      {/* Category Edit Modal */}
      {editingCategoryId && (
        <CategoryEditModal
          categoryId={editingCategoryId}
          onClose={() => setEditingCategoryId(null)}
          onSave={() => {
            // Refresh category list after edit
            dispatch(
              fetchCategories({
                page: pagination.currentPage,
                pageSize: pagination.pageSize,
                search: filters.search,
                status: filters.status,
              })
            );
          }}
        />
      )}

      {/* Category Add Modal */}
      <CategoryAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // Refresh category list after adding
          dispatch(
            fetchCategories({
              page: pagination.currentPage,
              pageSize: pagination.pageSize,
              search: filters.search,
              status: filters.status,
            })
          );
        }}
      />
    </div>
  );
};

export default CategoryList;
