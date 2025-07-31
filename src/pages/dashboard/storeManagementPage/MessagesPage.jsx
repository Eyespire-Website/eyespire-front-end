"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import webSocketService from "../../../services/webSocketService";
import userService from "../../../services/userService";
import SearchBox from "../../../components/storeManagement/SearchBox";
import {
    MessageSquare,
    Send,
    Phone,
    Video,
    Smile,
    MoreVertical,
    Search,
    Check,
    CheckCheck,
    Image as ImageIcon,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import "./STM-Style/STM-MessagesPage.css";

const placeholderImg = "/Uploads/avatar.jpg";

const MessagesPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageContainerRef = useRef(null);
    const stompClient = useRef(null);
    const navigate = useNavigate();

    // Automatically detect protocol and use secure WebSocket for HTTPS
    const getBaseUrl = () => {
        if (process.env.REACT_APP_API_BASE_URL) {
            return process.env.REACT_APP_API_BASE_URL;
        }
        // For production deployment, use the secure backend URL
        if (window.location.protocol === 'https:') {
            return 'https://eyespire-back-end.onrender.com';
        }
        // For local development
        return 'http://localhost:8080';
    };
    
    const baseUrl = getBaseUrl();
    const fallbackImage = "https://placehold.co/50x50?text=Image";

    const emojis = ["😀", "😂", "😍", "👍", "❤️", "😊", "🎉", "👏", "🔥", "💯", "😎", "🤔", "😢", "😡", "🙏", "✨"];

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    const getAvatarUrl = (url) => {
        if (!url) return `${baseUrl}${placeholderImg}`;
        return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "online": return "#10b981";
            case "away": return "#f59e0b";
            case "offline": return "#6b7280";
            default: return "#6b7280";
        }
    };

    useEffect(() => {
        if (!userId) {
            navigate("/");
            return;
        }

        fetchConversations();

        const socket = new SockJS(`${baseUrl}/ws`);
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log("STOMP Debug: ", str),
        });

        stompClient.current.onConnect = (frame) => {
            setIsConnected(true);
            stompClient.current.subscribe(`/user/${userId}/queue/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                handleNewMessage(receivedMessage);
            });

            stompClient.current.subscribe(`/user/${userId}/queue/messages/read`, (message) => {
                const updatedMessage = JSON.parse(message.body);
                handleMessageRead(updatedMessage);
            });
        };

        stompClient.current.onStompError = (error) => {
            setIsConnected(false);
            setTimeout(connectWebSocket, 5000);
        };

        const connectWebSocket = () => {
            stompClient.current.activate();
        };

        connectWebSocket();

        return () => {
            if (stompClient.current?.active) {
                stompClient.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [userId, navigate]);

    const fetchConversations = async () => {
        try {
            const messages = await webSocketService.getMessages(userId);
            const uniqueUserIds = [...new Set(messages.map(msg =>
                msg.sender.id === userId ? msg.receiver.id : msg.sender.id
            ))];

            const userDataPromises = uniqueUserIds.map(id => userService.getPatientById(id).catch(() => null));
            const usersData = await Promise.all(userDataPromises);
            const userDataMap = usersData.reduce((acc, data, index) => {
                if (data) acc[uniqueUserIds[index]] = data;
                return acc;
            }, {});

            const conversationsMap = messages.reduce((acc, msg) => {
                const otherUserId = msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
                const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;
                const userData = userDataMap[otherUserId] || {};

                if (!acc[otherUserId]) {
                    const sentAt = new Date(msg.sentAt);
                    acc[otherUserId] = {
                        id: otherUserId.toString(),
                        name: userData.name || otherUser.name || `User ${otherUserId}`,
                        avatar: getAvatarUrl(userData.avatarUrl || otherUser.avatar),
                        lastMessage: msg.content || (msg.imageUrls ? "Đã gửi hình ảnh" : ""),
                        timestamp: sentAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                        unreadCount: msg.isRead || msg.sender.id === userId ? 0 : 1,
                        status: userData.status || otherUser.status || "offline",
                        lastSeen: userData.status === "online" ? "Đang hoạt động" : sentAt.toLocaleTimeString("vi-VN", {
                            hour: "2-digit", minute: "2-digit" }),
                    };
                } else {
                    const sentAt = new Date(msg.sentAt);
                    acc[otherUserId].lastMessage = msg.content || (msg.imageUrls ? "Đã gửi hình ảnh" : "");
                    acc[otherUserId].timestamp = sentAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                    acc[otherUserId].lastSeen = userData.status === "online" ? "Đang hoạt động" : sentAt.toLocaleTimeString("vi-VN", {
                        hour: "2-digit", minute: "2-digit" });
                    if (!msg.isRead && msg.sender.id !== userId) {
                        acc[otherUserId].unreadCount += 1;
                    }
                }
                return acc;
            }, {});

            const conversationsList = Object.values(conversationsMap);
            setConversations(conversationsList);

            const messagesByConversation = messages.reduce((acc, msg) => {
                const convId = msg.sender.id === userId ? msg.receiver.id.toString() : msg.sender.id.toString();
                if (!acc[convId]) acc[convId] = [];
                acc[convId].push({
                    id: msg.id.toString(),
                    content: msg.content,
                    imageUrls: msg.imageUrls ? msg.imageUrls.split(";").filter(url => url.trim() !== "") : [],
                    timestamp: new Date(msg.sentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                    sender: msg.sender.id === userId ? "admin" : "user",
                    status: msg.isRead ? "read" : msg.sender.id === userId ? "sent" : "delivered",
                });
                return acc;
            }, {});
            setMessages(messagesByConversation);

            if (conversationsList.length > 0 && !selectedConversation) {
                setSelectedConversation(conversationsList[0].id);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const handleNewMessage = (message) => {
        console.log("Received message:", message);
        const convId = message.sender.id === userId ? message.receiver.id.toString() : message.sender.id.toString();
        const sentAt = new Date(message.sentAt);
        const newMsg = {
            id: message.id.toString(),
            content: message.content,
            imageUrls: message.imageUrls ? message.imageUrls.split(";").filter(url => url.trim() !== "") : [],
            timestamp: sentAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            sender: message.sender.id === userId ? "admin" : "user",
            status: message.isRead ? "read" : message.sender.id === userId ? "sent" : "delivered",
        };

        setMessages((prev) => ({
            ...prev,
            [convId]: [...(prev[convId] || []), newMsg],
        }));

        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === convId
                    ? {
                        ...conv,
                        lastMessage: message.content || (message.imageUrls ? "Đã gửi hình ảnh" : ""),
                        timestamp: sentAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                        lastSeen: conv.status === "online" ? "Đang hoạt động" : sentAt.toLocaleTimeString("vi-VN", {
                            hour: "2-digit", minute: "2-digit" }),
                        unreadCount: message.isRead || message.sender.id === userId ? conv.unreadCount : conv.unreadCount + 1,
                    }
                    : conv
            )
        );
    };

    const handleMessageRead = (message) => {
        const convId = message.sender.id === userId ? message.receiver.id.toString() : message.sender.id.toString();
        setMessages((prev) => ({
            ...prev,
            [convId]: (prev[convId] || []).map((msg) =>
                msg.id === message.id.toString() ? { ...msg, status: "read" } : msg
            ),
        }));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedConversation]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles((prev) => [...prev, ...files]);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && selectedFiles.length === 0) return;
        if (!selectedConversation || !isConnected) return;

        try {
            const message = {
                sender: { id: userId },
                receiver: { id: parseInt(selectedConversation) },
                content: newMessage.trim() || "",
                sentAt: new Date().toISOString(),
                isRead: false,
            };

            const formData = new FormData();
            formData.append("message", JSON.stringify(message));
            selectedFiles.forEach((file) => formData.append("images", file));

            const savedMessage = await webSocketService.sendMessage(formData);
            console.log("Saved message:", savedMessage);
            if (stompClient.current?.active) {
                const wsMessage = {
                    id: savedMessage.id,
                    sender: { id: savedMessage.sender.id },
                    receiver: { id: savedMessage.receiver.id },
                    content: savedMessage.content,
                    imageUrls: savedMessage.imageUrls,
                    sentAt: savedMessage.sentAt,
                    isRead: savedMessage.isRead,
                };
                stompClient.current.publish({
                    destination: "/app/chat",
                    body: JSON.stringify(wsMessage),
                    headers: { "content-type": "application/json" },
                });
            }
            setNewMessage("");
            setSelectedFiles([]);
            setShowEmojiPicker(false);
            handleNewMessage(savedMessage);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const markAsRead = async (conversationId) => {
        const unreadMessages = (messages[conversationId] || []).filter(
            (msg) => msg.sender === "user" && msg.status !== "read"
        );
        for (const msg of unreadMessages) {
            try {
                const updatedMessage = await webSocketService.markMessageAsRead(parseInt(msg.id));
                if (stompClient.current?.active) {
                    const wsMessage = {
                        id: updatedMessage.id,
                        sender: { id: updatedMessage.sender.id },
                        receiver: { id: updatedMessage.receiver.id },
                        content: updatedMessage.content,
                        imageUrls: updatedMessage.imageUrls,
                        sentAt: updatedMessage.sentAt,
                        isRead: updatedMessage.isRead,
                    };
                    stompClient.current.publish({
                        destination: "/app/chat.read",
                        body: JSON.stringify(wsMessage),
                        headers: { "content-type": "application/json" },
                    });
                }
            } catch (error) {
                console.error("Error marking message as read:", error);
            }
        }

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

    const handleEmojiClick = (emoji) => {
        setNewMessage((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    const getFullUrl = (url) => {
        if (!url || url.trim() === "") {
            console.log("Image URL is null or empty, using fallback:", fallbackImage);
            return fallbackImage;
        }
        return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
    };

    const handleImageClick = (url) => {
        const fullUrl = getFullUrl(url);
        console.log("Clicked image URL:", fullUrl);
        setSelectedImage(fullUrl);
        setZoomLevel(1);
    };

    const handlePreviewImageClick = (file) => {
        const previewUrl = URL.createObjectURL(file);
        console.log("Clicked preview image URL:", previewUrl);
        setSelectedImage(previewUrl);
        setZoomLevel(1);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
        setZoomLevel(1);
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
    };

    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
        };

        const imageContainer = imageContainerRef.current;
        if (selectedImage && imageContainer) {
            imageContainer.addEventListener("wheel", handleWheel, { passive: false });
        }

        return () => {
            if (imageContainer) {
                imageContainer.removeEventListener("wheel", handleWheel);
            }
        };
    }, [selectedImage]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleCloseModal();
        };
        if (selectedImage) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage]);

    const selectedConv = conversations.find((conv) => conv.id === selectedConversation);
    const currentMessages = messages[selectedConversation] || [];

    return (
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
                <div className="conversations-list">
                    {conversations.filter((conv) => conv.name.toLowerCase().includes(searchTerm.toLowerCase())).map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`conversation-item ${selectedConversation === conversation.id ? "active" : ""}`}
                            onClick={() => handleConversationSelect(conversation.id)}
                        >
                            <div className="conversation-avatar">
                                <img src={getAvatarUrl(conversation.avatar)} alt={conversation.name} />
                                <div className="status-indicator" style={{ backgroundColor: getStatusColor(conversation.status) }}></div>
                            </div>
                            <div className="conversation-content">
                                <div className="conversation-header">
                                    <h4 className="conversation-name">{conversation.name}</h4>
                                    <span className="conversation-time">{conversation.lastSeen}</span>
                                </div>
                                <div className="conversation-preview">
                                    <p className="last-message">{conversation.lastMessage}</p>
                                    {conversation.unreadCount > 0 && (
                                        <span className="unread-badge">{conversation.unreadCount}</span>
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
                                    src={getAvatarUrl(selectedConv.avatar)}
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
                                    className={`message ${message.sender === "admin" ? "sent" : "received"}`}
                                >
                                    <div className="message-content">
                                        {message.imageUrls && message.imageUrls.length > 0 && (
                                            <div className="image-grid">
                                                {message.imageUrls.map((url, index) => (
                                                    <div key={index} className="message-image-wrapper">
                                                        <img
                                                            src={getFullUrl(url)}
                                                            alt="Message attachment"
                                                            className="message-image"
                                                            onClick={() => handleImageClick(url)}
                                                            onError={(e) => {
                                                                console.error("Image failed to load:", url);
                                                                e.target.src = fallbackImage;
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {message.content && <p>{message.content}</p>}
                                    </div>
                                    <div className="message-meta">
                                        <span className="message-time">{message.timestamp}</span>
                                        {message.sender === "admin" && (
                                            <span className="message-status">
                                                {message.status === "sent" && <Check size={14} />}
                                                {message.status === "delivered" && <CheckCheck size={14} />}
                                                {message.status === "read" && <CheckCheck size={14} className="read" />}
                                            </span>
                                        )}
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
                                    <div className="message-meta">
                                        <span className="message-time"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input">
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
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                    multiple
                                    accept="image/*"
                                />
                                <button
                                    className="btn btn-icon"
                                    onClick={() => fileInputRef.current.click()}
                                    title="Gửi hình ảnh"
                                >
                                    <ImageIcon size={18} />
                                </button>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleSendMessage}
                                disabled={(!newMessage.trim() && selectedFiles.length === 0) || !isConnected}
                                title="Gửi tin nhắn"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        {selectedFiles.length > 0 && (
                            <div className="selected-files-preview">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="file-preview">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            className="file-preview-image"
                                            onClick={() => handlePreviewImageClick(file)}
                                        />
                                        <button
                                            className="file-remove"
                                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-conversation">
                        <MessageSquare size={64} />
                        <h3>Chọn một cuộc trò chuyện</h3>
                        <p>Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="stm-modal-overlay" onClick={handleCloseModal}>
                    <div className="stm-image-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="stm-image-modal-close" onClick={handleCloseModal}>
                            <X size={24} />
                        </button>
                        <div className="stm-image-modal-content" ref={imageContainerRef}>
                            <img
                                src={selectedImage}
                                alt="Zoomed message image"
                                style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s" }}
                                onError={(e) => {
                                    console.error("Modal image failed to load:", selectedImage);
                                    e.target.src = fallbackImage;
                                }}
                            />
                        </div>
                        <div className="stm-image-modal-controls">
                            <button onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                                <ZoomIn size={20} />
                            </button>
                            <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                                <ZoomOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;