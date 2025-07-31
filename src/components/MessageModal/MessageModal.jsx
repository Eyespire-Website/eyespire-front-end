import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUser, 
  faPaperPlane, 
  faImage,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import webSocketService from '../../services/webSocketService';
import userService from '../../services/userService';
import './MessageModal.css';


const MessageModal = ({ isOpen, onClose }) => {
  const [storeManagers, setStoreManagers] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState('managers'); // 'managers' hoặc 'receptionists'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const stompClient = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
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

  // Fetch contacts khi modal mở và lock body scroll
  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      connectWebSocket();
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      disconnectWebSocket();

      // Unlock body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      disconnectWebSocket();
      // Cleanup: unlock body scroll
      document.body.style.overflow = 'unset';

    };
  }, [isOpen]);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Lấy store managers
      const managersData = await webSocketService.getStoreManagers();
      console.log('Fetched store managers:', managersData);
      
      // Lấy user profiles để có Google avatars
      const managersWithAvatars = await Promise.all(
        managersData.map(async (manager) => {
          try {
            const userProfile = await userService.getPatientById(manager.id);
            return {
              ...manager,
              avatarUrl: userProfile?.avatarUrl || manager.avatarUrl
            };
          } catch (error) {
            console.log(`Could not fetch profile for manager ${manager.id}:`, error);
            return manager;
          }
        })
      );
      setStoreManagers(managersWithAvatars);
      
      // Lấy receptionists
      const receptionistsData = await webSocketService.getReceptionists();
      console.log('Fetched receptionists:', receptionistsData);
      
      // Lấy user profiles để có Google avatars
      const receptionistsWithAvatars = await Promise.all(
        receptionistsData.map(async (receptionist) => {
          try {
            const userProfile = await userService.getPatientById(receptionist.id);
            return {
              ...receptionist,
              avatarUrl: userProfile?.avatarUrl || receptionist.avatarUrl
            };
          } catch (error) {
            console.log(`Could not fetch profile for receptionist ${receptionist.id}:`, error);
            return receptionist;
          }
        })
      );
      setReceptionists(receptionistsWithAvatars);
      
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStoreManagers([]);
      setReceptionists([]);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!user.id) return;

    const socket = new SockJS(`${baseUrl}/ws`);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP Debug: ', str),
    });

    stompClient.current.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      
      // Subscribe to receive messages
      stompClient.current.subscribe(`/user/${user.id}/queue/messages`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        handleNewMessage(receivedMessage);
      });
    };

    stompClient.current.onStompError = (error) => {
      console.error('STOMP error:', error);
      setIsConnected(false);
    };

    stompClient.current.activate();
  };

  const disconnectWebSocket = () => {
    if (stompClient.current?.active) {
      stompClient.current.deactivate();
      setIsConnected(false);
    }
  };

  // Xử lý tin nhắn mới giống MessagesPage
  const handleNewMessage = (message) => {
    console.log('Received message:', message);
    const sentAt = new Date(message.sentAt);
    const newMsg = {
      id: message.id.toString(),
      content: message.content,
      imageUrls: message.imageUrls ? message.imageUrls.split(';').filter(url => url.trim() !== '') : [],
      timestamp: sentAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }),
      sender: message.sender.id === user.id ? 'user' : 'staff',
      status: message.isRead ? 'read' : message.sender.id === user.id ? 'sent' : 'delivered',
      senderId: message.sender.id,
      sentAt: message.sentAt
    };

    // Dispatch event để Header có thể update unread count
    if (message.sender.id !== user.id) {
      window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
    }

    // Chỉ thêm tin nhắn nếu đang xem cuộc trò chuyện với người gửi
    if (selectedContact && 
        (message.senderId === selectedContact.id || message.senderId === user.id)) {
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const handleContactSelect = async (contact) => {
    setSelectedContact(contact);
    setMessages([]);
    setLoading(true);
    
    try {
      // Sử dụng getConversation cho tất cả staff
      const conversation = await webSocketService.getConversation(contact.id);
      
      // Transform messages thành UI format
      const transformedMessages = conversation.map(msg => {
        const sentAt = new Date(msg.sentAt);
        return {
          id: msg.id.toString(),
          content: msg.content,
          imageUrls: msg.imageUrls ? msg.imageUrls.split(';').filter(url => url.trim() !== '') : [],
          timestamp: sentAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          sender: msg.sender.id === user.id ? 'user' : 'staff',
          status: msg.isRead ? 'read' : msg.sender.id === user.id ? 'sent' : 'delivered',
          senderId: msg.sender.id,
          sentAt: msg.sentAt
        };
      });
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedContact) return;
    if (!stompClient.current?.active) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      // Tạo message object giống MessagesPage
      const message = {
        sender: { id: user.id },
        receiver: { id: selectedContact.id },
        content: newMessage.trim() || '',
        sentAt: new Date().toISOString(),
        isRead: false
      };

      // Tạo FormData giống MessagesPage
      const formData = new FormData();
      formData.append('message', JSON.stringify(message));
      
      if (selectedFile) {
        formData.append('images', selectedFile);
      }
      
      // Gửi qua REST API
      const savedMessage = await webSocketService.sendMessage(formData);
      console.log('Saved message:', savedMessage);
      
      // Gửi qua WebSocket giống MessagesPage
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
          destination: '/app/chat',
          body: JSON.stringify(wsMessage),
          headers: { 'content-type': 'application/json' },
        });
      }
      
      // Reset form
      setNewMessage('');
      setSelectedFile(null);
      
      // Thêm tin nhắn vào danh sách
      handleNewMessage(savedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const placeholderImg = "/Uploads/avatar.jpg";

  const getAvatarUrl = (url) => {
    if (!url) return `${baseUrl}${placeholderImg}`;
    return url.startsWith("http") ? url : `${baseUrl}${url.replace("/Uploads", "/images")}`;
  };



  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  // Render modal using portal to document.body
  return ReactDOM.createPortal(
    <div className="webchat-message-modal-overlay" onClick={onClose}>
      <div className="webchat-message-modal" onClick={(e) => e.stopPropagation()}>
        <div className="webchat-message-modal-header">
          <h3>Tin nhắn với Nhân viên</h3>
          <button className="webchat-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="webchat-message-modal-body">
          {!selectedContact ? (
            // Danh sách contacts với tabs
            <div className="webchat-managers-list">
              {/* Tab Navigation */}
              <div className="webchat-tabs">
                <button 
                  className={`webchat-tab ${activeTab === 'managers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('managers')}
                >
                  Quản lý cửa hàng ({storeManagers.length})
                </button>
                <button 
                  className={`webchat-tab ${activeTab === 'receptionists' ? 'active' : ''}`}
                  onClick={() => setActiveTab('receptionists')}
                >
                  Lễ tân ({receptionists.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="webchat-tab-content">
                {activeTab === 'managers' && (
                  <div className="webchat-tab-panel">
                    <h4>Chọn quản lý cửa hàng để bắt đầu trò chuyện:</h4>
                    {loading ? (
                      <div className="webchat-loading">Đang tải...</div>
                    ) : (
                      <div className="webchat-managers-grid">
                        {storeManagers.map(manager => (
                          <div 
                            key={manager.id}
                            className="webchat-manager-card"
                            onClick={() => handleContactSelect(manager)}
                          >
                            <div className="webchat-manager-avatar">
                              <img 
                                src={getAvatarUrl(manager.avatarUrl)} 
                                alt={manager.name}
                              />
                              <div className="webchat-online-status">
                                <FontAwesomeIcon icon={faCircle} className="webchat-online-dot" />
                              </div>
                            </div>
                            <div className="webchat-manager-info">
                              <h5>{manager.name}</h5>
                              <p>{manager.email}</p>
                              <span className="webchat-role-badge">Quản lý cửa hàng</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'receptionists' && (
                  <div className="webchat-tab-panel">
                    <h4>Chọn lễ tân để bắt đầu trò chuyện:</h4>
                    {loading ? (
                      <div className="webchat-loading">Đang tải...</div>
                    ) : (
                      <div className="webchat-managers-grid">
                        {receptionists.map(receptionist => (
                          <div 
                            key={receptionist.id}
                            className="webchat-manager-card"
                            onClick={() => handleContactSelect(receptionist)}
                          >
                            <div className="webchat-manager-avatar">
                              <img 
                                src={getAvatarUrl(receptionist.avatarUrl)} 
                                alt={receptionist.name}
                              />
                              <div className="webchat-online-status">
                                <FontAwesomeIcon icon={faCircle} className="webchat-online-dot" />
                              </div>
                            </div>
                            <div className="webchat-manager-info">
                              <h5>{receptionist.name}</h5>
                              <p>{receptionist.email}</p>
                              <span className="webchat-role-badge">Lễ tân</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Chat interface
            <div className="webchat-chat-interface">
              <div className="webchat-chat-header">
                <button 
                  className="webchat-back-btn"
                  onClick={() => setSelectedContact(null)}
                >
                  ← Quay lại
                </button>
                <div className="webchat-chat-user-info">
                  <img 
                    src={getAvatarUrl(selectedContact.avatarUrl)} 
                    alt={selectedContact.name}
                    className="webchat-chat-avatar"
                  />
                  <div>
                    <h5>{selectedContact.name}</h5>
                    <span className={`webchat-status ${isConnected ? 'online' : 'offline'}`}>
                      {isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="webchat-messages-container">
                {loading ? (
                  <div className="webchat-loading">Đang tải tin nhắn...</div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div 
                        key={message.id || index}
                        className={`webchat-message ${message.sender === 'user' ? 'sent' : 'received'}`}
                      >
                        <div className="webchat-message-content">
                          {message.imageUrls && message.imageUrls.length > 0 && (
                            <div className="webchat-message-images">
                              {message.imageUrls.map((imageUrl, imgIndex) => (
                                <img 
                                  key={imgIndex}
                                  src={`${baseUrl}${imageUrl}`} 
                                  alt="Attachment"
                                  className="webchat-message-image"
                                />
                              ))}
                            </div>
                          )}
                          {message.content && <p>{message.content}</p>}
                          <small className="webchat-message-time">
                            {message.timestamp}
                          </small>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="webchat-input-area">
                {selectedFile && (
                  <div className="webchat-file-preview">
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
                    <button className="webchat-remove-file" onClick={() => setSelectedFile(null)}>×</button>
                  </div>
                )}
                
                <div className="webchat-input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="webchat-message-input"
                    rows={1}
                  />
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="webchat-file-input"
                  />
                  
                  <div className="webchat-input-buttons">
                    <button 
                      className="webchat-file-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Gửi hình ảnh"
                    >
                      <FontAwesomeIcon icon={faImage} />
                    </button>
                    
                    <button 
                      className="webchat-send-btn"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && !selectedFile}
                      title="Gửi tin nhắn"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MessageModal;
