import { getAuthToken } from "./apiClient";

const BASE_URL = "http://localhost:5099/api";

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Gửi tin nhắn đến AI và nhận phản hồi
 * @param {string} message - Câu hỏi của người dùng
 * @param {number|null} conversationId - ID cuộc hội thoại (null = tạo mới)
 * @returns {Promise<{success: boolean, response: string, functionCalled?: string, data?: any, error?: string, conversationId?: number}>}
 */
export async function sendMessage(message, conversationId = null) {
  const response = await fetch(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Không thể kết nối đến AI");
  }

  return response.json();
}

/**
 * Gửi tin nhắn đến AI và nhận phản hồi dạng STREAM
 * @param {string} message - Câu hỏi
 * @param {number|null} conversationId - ID hội thoại
 * @param {function} onChunk - Callback nhận từng đoạn text: (text) => void
 * @param {function} onConversationId - Callback nhận conversationId: (id) => void
 * @returns {Promise<void>}
 */
export async function streamMessage(message, conversationId, onChunk, onConversationId = null) {
  const response = await fetch(`${BASE_URL}/ai/stream`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Không thể kết nối đến AI");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || ""; // Giữ lại phần chưa hoàn chỉnh

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data);
          if (json.error) throw new Error(json.error);
          
          // Nhận conversationId từ chunk đầu tiên
          if (json.conversationId && onConversationId) {
            onConversationId(json.conversationId);
          }
          
          if (json.content) onChunk(json.content);
        } catch (e) {
          console.error("Lỗi parse stream:", e);
        }
      }
    }
  }
}

/**
 * Lấy danh sách cuộc hội thoại của user
 */
export async function getConversations() {
  const response = await fetch(`${BASE_URL}/ai/conversations`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách hội thoại");
  }

  return response.json();
}

/**
 * Lấy chi tiết cuộc hội thoại với messages
 */
export async function getConversation(id) {
  const response = await fetch(`${BASE_URL}/ai/conversations/${id}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không thể tải cuộc hội thoại");
  }

  return response.json();
}

/**
 * Xóa cuộc hội thoại
 */
export async function deleteConversation(id) {
  const response = await fetch(`${BASE_URL}/ai/conversations/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không thể xóa cuộc hội thoại");
  }

  return response.json();
}

/**
 * Kiểm tra trạng thái AI service
 */
export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/ai/health`);

  if (!response.ok) {
    throw new Error("AI Service không khả dụng");
  }

  return response.json();
}
