import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import chatService from '../services/chatService';

const MessagePage = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    useEffect(() => {
        const handleNewMessage = (message) => {
            setMessages(prev => [...prev, message]);
        };

        chatService.connectWebSocket(user.id, handleNewMessage);

        // Load existing messages
        loadMessages();

        return () => {
            chatService.disconnectWebSocket();
        };
    }, []);

    const loadMessages = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/messages/${user.id}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Không thể tải tin nhắn');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const message = {
                senderId: user.id,
                receiverId: user.role === 'PATIENT' ? 1 : user.id, // Store management ID
                content: newMessage
            };

            chatService.sendMessage(message);
            setNewMessage('');
            toast.success('Tin nhắn đã được gửi');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Không thể gửi tin nhắn');
        }
    };

    return (
        <div className="container mt-4">
            <h2>{user.role === 'PATIENT' ? 'Tin nhắn với quản lý cửa hàng' : 'Tin nhắn với bệnh nhân'}</h2>
            
            <div className="messages-container mt-3" style={{
                maxHeight: '500px',
                overflowY: 'auto',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                {messages.map((msg, index) => (
                    <div 
                        key={index}
                        className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                        style={{
                            marginBottom: '1rem',
                            maxWidth: '80%',
                            wordWrap: 'break-word'
                        }}
                    >
                        <div className="message-content">
                            <p>{msg.content}</p>
                            <small>{new Date(msg.sentAt).toLocaleString()}</small>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Gửi
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessagePage;
