import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, History, Plus, Trash2, ChevronLeft } from "lucide-react";
import { streamMessage, getConversations, getConversation, deleteConversation } from "../../api/aiApi";
import { formatCurrency } from "../../utils/formatters";

const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const welcomeMessage = {
    role: "assistant",
    content: "Xin chào! Tôi là trợ lý AI của hệ thống POS. Tôi có thể giúp bạn:\n\n• Xem thống kê doanh thu, đơn hàng\n• Tra cứu sản phẩm bán chạy\n• Kiểm tra tồn kho\n• Phân tích báo cáo kinh doanh\n\nBạn cần hỗ trợ gì?",
  };

  useEffect(() => {
    // Hiển thị welcome message khi mới mở
    if (messages.length === 0 && !conversationId) {
      setMessages([welcomeMessage]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (id) => {
    setLoadingHistory(true);
    try {
      const data = await getConversation(id);
      setConversationId(id);
      setMessages(data.messages.map(m => ({
        role: m.role,
        content: m.content,
        functionCalled: m.functionCalled,
        data: m.data,
      })));
      setShowHistory(false);
    } catch (error) {
      console.error("Lỗi tải hội thoại:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Xóa cuộc hội thoại này?")) return;
    
    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (conversationId === id) {
        startNewConversation();
      }
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([welcomeMessage]);
    setShowHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // 1. Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // 2. Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isStreaming: true }
      ]);

      let fullResponse = "";

      // 3. Stream response với callback nhận conversationId
      await streamMessage(
        userMessage, 
        conversationId, 
        (chunk) => {
          fullResponse += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            lastMsg.content = fullResponse;
            return newMessages;
          });
        },
        (newConvId) => {
          // Nhận conversationId từ backend khi tạo conversation mới
          if (!conversationId) {
            setConversationId(newConvId);
          }
        }
      );

      // 4. Finish streaming
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.isStreaming = false;
        return newMessages;
      });

    } catch (error) {
      // Cập nhật message placeholder thay vì thêm mới
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          lastMsg.content = `Lỗi kết nối: ${error.message}`;
          lastMsg.isError = true;
          lastMsg.isStreaming = false;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };



  const renderDataTable = (data, functionCalled) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    if (functionCalled === "get_best_sellers" || functionCalled === "get_top_products") {
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Sản phẩm</th>
                <th className="px-3 py-2 text-right">SL bán</th>
                <th className="px-3 py-2 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{item.productName}</td>
                  <td className="px-3 py-2 text-right">{item.quantitySold}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (functionCalled === "get_low_stock") {
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Sản phẩm</th>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-right">Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{item.productName}</td>
                  <td className="px-3 py-2 text-gray-500">{item.sku || "-"}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${item.quantity < 5 ? "text-red-600" : "text-orange-500"}`}>
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (functionCalled === "get_top_customers") {
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Khách hàng</th>
                <th className="px-3 py-2 text-right">Số đơn</th>
                <th className="px-3 py-2 text-right">Tổng chi</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{item.customerName}</td>
                  <td className="px-3 py-2 text-right">{item.orderCount}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };


  // History Panel
  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow">
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-blue-600 rounded-t-lg">
          <button
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">Lịch sử hội thoại</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={startNewConversation}
            className="w-full mb-4 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Cuộc hội thoại mới</span>
          </button>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có lịch sử hội thoại</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group transition ${
                    conversationId === conv.id
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {conv.title || "Cuộc hội thoại"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(conv.updatedAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-blue-600 rounded-t-lg">
        <div className="p-2 bg-blue-500 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">Trợ lý AI</h2>
          <p className="text-sm text-blue-100">Hỗ trợ quản lý cửa hàng</p>
        </div>
        <button
          onClick={() => {
            loadConversations();
            setShowHistory(true);
          }}
          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition"
          title="Lịch sử hội thoại"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : msg.isError
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.isStreaming && !msg.content ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.data && renderDataTable(msg.data, msg.functionCalled)}
                </>
              )}
            </div>
          </div>
        ))}



        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiChat;
