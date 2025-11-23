// src/pages/login/Login.jsx
import React, { useState } from "react";
import { login, setAuthToken } from "../../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      // data: { token, tokenType, expiresIn, userName, role }
      // setAuthToken(data.token, { persist: true });
      localStorage.setItem("user_role", data.role || "staff");
      localStorage.setItem("user_name", data.userName || username);
      // redirect to dashboard
      nav("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">Đăng nhập</h1>

        {error && (
          <div className="p-2 text-red-700 bg-red-100 rounded mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Tên đăng nhập</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Mật khẩu</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              type="password"
              placeholder="password"
              required
            />
          </div>

          <div>
            <button
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
