import React, { useEffect, useState } from "react";
import {
  getUsersPaginated,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
} from "../../api/apiClient";
import Pagination from "../../components/ui/Pagination";

const emptyForm = {
  username: "",
  email: "",
  fullName: "",
  role: "staff",
  isActive: true,
  password: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleBadgeClass = (role) =>
  role?.toLowerCase() === "admin"
    ? "bg-red-50 text-red-700"
    : "bg-sky-50 text-sky-700";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const result = await getUsersPaginated(page, pageSize);
      setUsers(result.items ?? []);
      setMeta({
        currentPage: result.currentPage ?? page,
        totalPages:
          result.totalPages && result.totalPages > 0 ? result.totalPages : 1,
        totalItems: result.totalItems ?? 0,
        pageSize: result.pageSize ?? pageSize,
      });
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(user) {
    setEditUserId(user.id);
    setFormData({
      username: user.username ?? "",
      email: user.email ?? "",
      fullName: user.fullName ?? "",
      role: user.role ?? "staff",
      isActive: user.isActive ?? true,
      password: "",
    });
    setFieldErrors({});
  }

  function closeEditModal() {
    setEditUserId(null);
    setFormData(emptyForm);
    setSaving(false);
    setFieldErrors({});
  }

  function openCreateModal() {
    setFormData(emptyForm);
    setCreateModalOpen(true);
    setAlert(null);
    setFieldErrors({});
  }

  function closeCreateModal() {
    setCreateModalOpen(false);
    setFormData(emptyForm);
    setSaving(false);
    setFieldErrors({});
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setFieldErrors({});

    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    if (trimmedUsername.length < 3) {
      setFieldErrors({ username: "Username phải có ít nhất 3 kí tự!" });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFieldErrors({ email: "Email không hợp lệ!" });
      return;
    }

    if (trimmedPassword.length < 6) {
      setFieldErrors({ password: "Mật khẩu phải có ít nhất 6 kí tự!" });
      return;
    }

    setSaving(true);
    setAlert(null);
    try {
      const payload = {
        ...formData,
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
        fullName: formData.fullName ? formData.fullName.trim() : "",
      };
      const created = await createUser(payload);
      setAlert({
        type: "success",
        message: `Đã thêm nhân viên ${created.username}.`,
      });
      closeCreateModal();
      if (page !== 1) {
        setPage(1);
      } else {
        fetchUsers();
      }
    } catch (err) {
      const msg = err.message || "Thêm nhân viên thất bại.";
      if (msg.toLowerCase().includes("username")) {
        setFieldErrors({ username: msg });
      } else if (msg.toLowerCase().includes("email")) {
        setFieldErrors({ email: msg });
      } else {
        setAlert({
          type: "error",
          message: msg,
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editUserId) return;
    setFieldErrors({});

    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();

    if (trimmedUsername.length < 3) {
      setFieldErrors({ username: "Username phải có ít nhất 3 ký tự." });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFieldErrors({ email: "Email không hợp lệ." });
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn cập nhật người dùng ${trimmedUsername}?`
    );
    if (!confirmed) return;

    setSaving(true);
    setAlert(null);
    try {
      const payload = {
        ...formData,
        username: trimmedUsername,
        email: trimmedEmail,
        fullName: formData.fullName ? formData.fullName.trim() : "",
      };
      if (!payload.password) {
        delete payload.password;
      }
      const updated = await updateUser(editUserId, payload);
      setAlert({
        type: "success",
        message: `Đã cập nhật ${updated.username}.`,
      });
      closeEditModal();
      fetchUsers();
    } catch (err) {
      const msg = err.message || "Cập nhật người dùng thất bại.";
      if (msg.toLowerCase().includes("username")) {
        setFieldErrors({ username: msg });
      } else if (msg.toLowerCase().includes("email")) {
        setFieldErrors({ email: msg });
      } else {
        setAlert({
          type: "error",
          message: msg,
        });
      }
    } finally {
      setSaving(false);
    }
  }
  async function handleViewDetail(user) {
    setDetailUser(user);
    setDetailLoading(true);
    setAlert(null);
    try {
      const detail = await getUserById(user.id);
      setDetailUser(detail);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Không thể tải chi tiết người dùng.",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetailModal() {
    setDetailUser(null);
    setDetailLoading(false);
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá người dùng ${user.username}?`
    );
    if (!confirmed) return;

    setDeleteLoadingId(user.id);
    setAlert(null);
    try {
      await deleteUser(user.id);
      setAlert({
        type: "success",
        message: `Đã xóa tài khoản ${user.username}.`,
      });
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUsers();
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Không thể xóa người dùng.",
      });
    } finally {
      setDeleteLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Quản lý Nhân viên
          </h1>
          <p className="text-sm text-gray-500">
            Theo dõi trạng thái tài khoản và thao tác cập nhật.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-md bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          onClick={openCreateModal}
        >
          + Thêm nhân viên
        </button>
      </div>

      {alert && (
        <div
          className={`rounded-md px-4 py-2 text-sm ${
            alert.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {alert.message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Chưa có người dùng nào.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-indigo-50/60 transition-colors"
                >
                  <td className="px-4 py-3">{user.email || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {user.username}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${roleBadgeClass(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        onClick={() => handleViewDetail(user)}
                      >
                        Xem
                      </button>
                      {user.role !== "admin" && (
                        <>
                          <button
                            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                            onClick={() => openEditModal(user)}
                          >
                            Sửa
                          </button>
                          <button
                            className="text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                            disabled={deleteLoadingId === user.id}
                            onClick={() => handleDelete(user)}
                          >
                            {deleteLoadingId === user.id
                              ? "Đang xóa..."
                              : "Xóa"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {meta && users.length > 0 && (
        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      )}

      {detailUser && (
        <Modal title="Thông tin người dùng" onClose={closeDetailModal}>
          {detailLoading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Username</dt>
                <dd className="font-semibold text-gray-800">
                  {detailUser.username}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-semibold text-gray-800">
                  {detailUser.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Họ tên</dt>
                <dd className="font-semibold text-gray-800">
                  {detailUser.fullName || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Vai trò</dt>
                <dd className="font-semibold text-gray-800">
                  {detailUser.role}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Trạng thái</dt>
                <dd className="font-semibold text-gray-800">
                  {detailUser.isActive ? "Đang hoạt động" : "Đã khóa"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Cập nhật lần cuối</dt>
                <dd className="font-semibold text-gray-800">
                  {detailUser.updatedAt
                    ? new Date(detailUser.updatedAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
            </dl>
          )}
        </Modal>
      )}

      {createModalOpen && (
        <Modal title="Thêm nhân viên" onClose={closeCreateModal}>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                required
                minLength={3}
                aria-invalid={Boolean(fieldErrors.username)}
              />
              {fieldErrors.username && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ho ten
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vai tro
                </label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trang thai
                </label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Dang hoat dong</option>
                  <option value="false">Khoa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mat khau
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                minLength={6}
                required
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                onClick={closeCreateModal}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Thêm mới"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editUserId && (
        <Modal title="Cập nhật người dùng" onClose={closeEditModal}>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-100 cursor-not-allowed"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                required
                aria-invalid={Boolean(fieldErrors.username)}
                readOnly
              />
              {fieldErrors.username && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-100 cursor-not-allowed"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                aria-invalid={Boolean(fieldErrors.email)}
                readOnly
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Họ tên
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vai trò
                </label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Khoá</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Đặt lại mật khẩu (tùy chọn)
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={formData.password}
                placeholder="Để trống nếu không đổi"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                minLength={6}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                onClick={closeEditModal}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
