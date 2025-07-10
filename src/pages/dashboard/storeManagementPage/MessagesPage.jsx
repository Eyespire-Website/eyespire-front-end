"use client";
import placeholderImg from "../../../components/storeManagement/img/placeholder.svg";
import { useState, useRef, useEffect } from "react";
import SearchBox from "../../../components/storeManagement/SearchBox";
import StatCard from "../../../components/storeManagement/StatCard";
import {
  MessageSquare,
  Send,
  Users,
  Clock,
  Phone,
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Check,
  CheckCheck,
  ImageIcon,
  File,
} from "lucide-react";

const MessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("1");
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [conversations, setConversations] = useState([
    {
      id: "1",
      name: "Nguyễn Văn A",
      avatar: placeholderImg,
      lastMessage: "Cảm ơn bạn đã tư vấn cho tôi",
      timestamp: "10:30",
      unreadCount: 2,
      status: "online",
      type: "customer",
      lastSeen: "Đang hoạt động",
    },
    {
      id: "2",
      name: "Trần Thị B",
      avatar: placeholderImg,
      lastMessage: "Khi nào có thể đặt hàng?",
      timestamp: "09:45",
      unreadCount: 0,
      status: "offline",
      type: "customer",
      lastSeen: "5 phút trước",
    },
    {
      id: "3",
      name: "Nhóm Quản lý",
      avatar: placeholderImg,
      lastMessage: "Báo cáo doanh thu tuần này",
      timestamp: "08:20",
      unreadCount: 5,
      status: "online",
      type: "group",
      lastSeen: "Đang hoạt động",
    },
    {
      id: "4",
      name: "Lê Văn C",
      avatar: placeholderImg,
      lastMessage: "Sản phẩm có còn hàng không?",
      timestamp: "Hôm qua",
      unreadCount: 1,
      status: "away",
      type: "customer",
      lastSeen: "2 giờ trước",
    },
    {
      id: "5",
      name: "Nhân viên kho",
      avatar: placeholderImg,
      lastMessage: "Đã cập nhật số lượng tồn kho",
      timestamp: "Hôm qua",
      unreadCount: 0,
      status: "offline",
      type: "staff",
      lastSeen: "1 ngày trước",
    },
  ]);

  const [messages, setMessages] = useState({
    1: [
      {
        id: "1",
        content: "Chào bạn, tôi muốn hỏi về sản phẩm thức ăn cá Koi",
        timestamp: "10:25",
        sender: "user",
        type: "text",
        status: "read",
      },
      {
        id: "2",
        content: "Chào anh! Tôi có thể giúp gì cho anh?",
        timestamp: "10:26",
        sender: "admin",
        type: "text",
        status: "read",
      },
      {
        id: "3",
        content: "Tôi muốn mua thức ăn cao cấp cho cá nhà mình",
        timestamp: "10:27",
        sender: "user",
        type: "text",
        status: "read",
      },
      {
        id: "4",
        content:
          "Anh có thể xem sản phẩm SP001 - Thức ăn cá Koi cao cấp của chúng tôi",
        timestamp: "10:28",
        sender: "admin",
        type: "text",
        status: "read",
      },
      {
        id: "5",
        content: "Cảm ơn bạn đã tư vấn cho tôi",
        timestamp: "10:30",
        sender: "user",
        type: "text",
        status: "delivered",
      },
    ],
    2: [
      {
        id: "6",
        content: "Xin chào, tôi muốn đặt hàng",
        timestamp: "09:40",
        sender: "user",
        type: "text",
        status: "read",
      },
      {
        id: "7",
        content: "Chào chị! Chị muốn đặt sản phẩm gì ạ?",
        timestamp: "09:42",
        sender: "admin",
        type: "text",
        status: "read",
      },
      {
        id: "8",
        content: "Khi nào có thể đặt hàng?",
        timestamp: "09:45",
        sender: "user",
        type: "text",
        status: "delivered",
      },
    ],
    3: [
      {
        id: "9",
        content: "Báo cáo doanh thu tuần này",
        timestamp: "08:20",
        sender: "user",
        type: "text",
        status: "read",
      },
    ],
    4: [
      {
        id: "10",
        content: "Sản phẩm có còn hàng không?",
        timestamp: "Hôm qua",
        sender: "user",
        type: "text",
        status: "delivered",
      },
    ],
    5: [
      {
        id: "11",
        content: "Đã cập nhật số lượng tồn kho",
        timestamp: "Hôm qua",
        sender: "user",
        type: "text",
        status: "read",
      },
    ],
  });

  const emojis = [
    "😀",
    "😂",
    "😍",
    "👍",
    "❤️",
    "😊",
    "🎉",
    "👏",
    "🔥",
    "💯",
    "😎",
    "🤔",
    "😢",
    "😡",
    "🙏",
    "✨",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "#10b981";
      case "away":
        return "#f59e0b";
      case "offline":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getConversationsByTab = () => {
    switch (activeTab) {
      case "customers":
        return filteredConversations.filter((conv) => conv.type === "customer");
      case "staff":
        return filteredConversations.filter((conv) => conv.type === "staff");
      case "groups":
        return filteredConversations.filter((conv) => conv.type === "group");
      default:
        return filteredConversations;
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageId = Date.now().toString();
      const currentTime = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newMsg = {
        id: messageId,
        content: newMessage.trim(),
        timestamp: currentTime,
        sender: "admin",
        type: "text",
        status: "sent",
      };

      // Thêm tin nhắn mới
      setMessages((prev) => ({
        ...prev,
        [selectedConversation]: [...(prev[selectedConversation] || []), newMsg],
      }));

      // Cập nhật cuộc trò chuyện
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? {
              ...conv,
              lastMessage: newMessage.trim(),
              timestamp: currentTime,
              unreadCount: 0,
            }
            : conv
        )
      );

      setNewMessage("");
      setShowEmojiPicker(false);

      // Mô phỏng phản hồi tự động sau 2-3 giây
      setTimeout(() => {
        simulateUserResponse();
      }, Math.random() * 2000 + 1000);
    }
  };

  const simulateUserResponse = () => {
    const responses = [
      "Cảm ơn bạn!",
      "Tôi hiểu rồi",
      "Được, tôi sẽ xem xét",
      "Bạn có thể tư vấn thêm không?",
      "Giá cả như thế nào?",
      "Khi nào có hàng?",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    const messageId = Date.now().toString();
    const currentTime = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const responseMsg = {
      id: messageId,
      content: randomResponse,
      timestamp: currentTime,
      sender: "user",
      type: "text",
      status: "delivered",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversation]: [
        ...(prev[selectedConversation] || []),
        responseMsg,
      ],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
            ...conv,
            lastMessage: randomResponse,
            timestamp: currentTime,
            unreadCount: conv.unreadCount + 1,
          }
          : conv
      )
    );
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const messageId = Date.now().toString();
      const currentTime = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const fileMsg = {
        id: messageId,
        content: file.name,
        timestamp: currentTime,
        sender: "admin",
        type: file.type.startsWith("image/") ? "image" : "file",
        status: "sent",
        fileUrl: URL.createObjectURL(file),
        fileSize: (file.size / 1024).toFixed(1) + " KB",
      };

      setMessages((prev) => ({
        ...prev,
        [selectedConversation]: [
          ...(prev[selectedConversation] || []),
          fileMsg,
        ],
      }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? {
              ...conv,
              lastMessage: `📎 ${file.name}`,
              timestamp: currentTime,
            }
            : conv
        )
      );
    }
  };

  const markAsRead = (conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const handleConversationSelect = (conversationId) => {
    setSelectedConversation(conversationId);
    markAsRead(conversationId);
  };

  const selectedConv = conversations.find(
    (conv) => conv.id === selectedConversation
  );
  const currentMessages = messages[selectedConversation] || [];

  // Tính toán thống kê động
  const totalMessages = Object.values(messages).flat().length;
  const totalConversations = conversations.length;
  const unreadMessages = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );
  const avgResponseTime = "2.5 phút";

  return (
    <div>
      <div className="messages-container">
        <div className="conversations-panel">
          <div className="conversations-header">
            <h3>Tin nhắn</h3>
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm cuộc trò chuyện..."
            />
          </div>

          <div className="conversation-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả ({filteredConversations.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "customers" ? "active" : ""}`}
              onClick={() => setActiveTab("customers")}
            >
              Khách hàng (
              {
                filteredConversations.filter((c) => c.type === "customer")
                  .length
              }
              )
            </button>
            <button
              className={`tab-btn ${activeTab === "staff" ? "active" : ""}`}
              onClick={() => setActiveTab("staff")}
            >
              Nhân viên (
              {filteredConversations.filter((c) => c.type === "staff").length})
            </button>
            <button
              className={`tab-btn ${activeTab === "groups" ? "active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              Nhóm (
              {filteredConversations.filter((c) => c.type === "group").length})
            </button>
          </div>

          <div className="conversations-list">
            {getConversationsByTab().map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation === conversation.id ? "active" : ""
                  }`}
                onClick={() => handleConversationSelect(conversation.id)}
              >
                <div className="conversation-avatar">
                  <img
                    src={conversation.avatar || "/placeholder.svg"}
                    alt={conversation.name}
                  />
                  <div
                    className="status-indicator"
                    style={{
                      backgroundColor: getStatusColor(conversation.status),
                    }}
                  ></div>
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h4 className="conversation-name">{conversation.name}</h4>
                    <span className="conversation-time">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="conversation-preview">
                    <p className="last-message">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-panel">
          {selectedConv ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <img
                    src={selectedConv.avatar || "/placeholder.svg"}
                    alt={selectedConv.name}
                    className="chat-avatar"
                  />
                  <div>
                    <h4 className="chat-user-name">{selectedConv.name}</h4>
                    <span className={`chat-user-status ${selectedConv.status}`}>
                      {selectedConv.lastSeen}
                    </span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="btn btn-icon" title="Gọi điện">
                    <Phone size={18} />
                  </button>
                  <button className="btn btn-icon" title="Video call">
                    <Video size={18} />
                  </button>
                  <button className="btn btn-icon" title="Tìm kiếm">
                    <Search size={18} />
                  </button>
                  <button className="btn btn-icon" title="Thêm">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === "admin" ? "sent" : "received"
                      }`}
                  >
                    <div className="message-content">
                      {message.type === "image" ? (
                        <div className="message-image">
                          <ImageIcon
                            src={message.fileUrl || "/placeholder.svg"}
                            alt={message.content}
                          />
                          <p>{message.content}</p>
                        </div>
                      ) : message.type === "file" ? (
                        <div className="message-file">
                          <File size={20} />
                          <div>
                            <p>{message.content}</p>
                            <span className="file-size">
                              {message.fileSize}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <div className="message-meta">
                        <span className="message-time">
                          {message.timestamp}
                        </span>
                        {message.sender === "admin" && (
                          <span className="message-status">
                            {message.status === "sent" && <Check size={14} />}
                            {message.status === "delivered" && (
                              <CheckCheck size={14} />
                            )}
                            {message.status === "read" && (
                              <CheckCheck size={14} className="read" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message received">
                    <div className="message-content typing">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  className="btn btn-icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Đính kèm file"
                >
                  <Paperclip size={18} />
                </button>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <div className="emoji-picker-container">
                    <button
                      className="btn btn-icon"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      title="Emoji"
                    >
                      <Smile size={18} />
                    </button>
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            className="emoji-btn"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  title="Gửi tin nhắn"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <MessageSquare size={64} />
              <h3>Chọn một cuộc trò chuyện</h3>
              <p>Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
