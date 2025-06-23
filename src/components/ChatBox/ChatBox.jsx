import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';
import chatService from '../../services/chatService';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', content: 'Xin chào! Tôi là trợ lý Eyespire. Tôi có thể giúp gì cho bạn về các vấn đề liên quan đến mắt?', id: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Focus vào input khi mở chatbox
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Khởi tạo Web Speech API
  useEffect(() => {
    // Kiểm tra trình duyệt có hỗ trợ Speech Recognition không
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Thêm tin nhắn của người dùng vào lịch sử
    const userMessage = { role: 'user', content: message, id: Date.now() };
    setChatHistory([...chatHistory, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Gửi tin nhắn đến API và nhận phản hồi
      const response = await chatService.sendMessage(message);
      
      // Thêm phản hồi từ bot vào lịch sử
      const botMessage = { role: 'bot', content: response.response, id: Date.now() };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Thêm thông báo lỗi vào lịch sử
      const errorMessage = { 
        role: 'bot', 
        content: 'Xin lỗi, tôi đang gặp vấn đề kỹ thuật. Vui lòng thử lại sau.',
        id: Date.now()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Bắt đầu ghi âm
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    } else {
      alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
    }
  };

  // Dừng ghi âm
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Đọc văn bản cụ thể
  const speakMessage = (text, messageId) => {
    if ('speechSynthesis' in window) {
      // Nếu đang đọc tin nhắn này, dừng lại
      if (speakingMessageId === messageId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }
      
      // Dừng tất cả các phát âm đang diễn ra
      window.speechSynthesis.cancel();
      
      // Đặt ID tin nhắn đang đọc
      setSpeakingMessageId(messageId);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Thiết lập ngôn ngữ tiếng Việt
      utterance.lang = 'vi-VN';
      
      // Tùy chỉnh giọng nói
      utterance.volume = 1; // 0 đến 1
      utterance.rate = 1.0; // 0.1 đến 10
      utterance.pitch = 1.0; // 0 đến 2
      
      // Xử lý sự kiện
      utterance.onstart = () => console.log('Bắt đầu đọc');
      utterance.onend = () => {
        console.log('Đọc xong');
        setSpeakingMessageId(null);
      };
      utterance.onerror = (e) => {
        console.error('Lỗi khi đọc:', e);
        setSpeakingMessageId(null);
      };
      
      // Kiểm tra và chọn giọng tiếng Việt nếu có
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(voice => voice.lang.includes('vi') || voice.name.includes('Vietnamese'));
        if (viVoice) {
          utterance.voice = viVoice;
        }
        
        // Phát âm
        window.speechSynthesis.speak(utterance);
      }, 100); // Đợi một chút để đảm bảo voices đã được tải
    } else {
      console.error('Trình duyệt không hỗ trợ Text-to-Speech');
    }
  };

  // Hàm để hiển thị thời gian tin nhắn
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="chat-box-container">
      {/* Nút chat */}
      <button 
        className={`chat-button ${isOpen ? 'active' : ''}`} 
        onClick={toggleChat}
        aria-label="Chat với trợ lý Eyespire"
      >
        {isOpen ? (
          <i className="fas fa-times"></i>
        ) : (
          <div className="chat-button-content">
            <span className="chat-button-text">Chat ngay</span>
            <i className="fas fa-comment-dots"></i>
          </div>
        )}
      </button>

      {/* Hộp chat */}
      <div className={`chat-container ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <div className="chat-logo">
              <i className="fas fa-eye"></i>
            </div>
            <div className="chat-title-text">
              <h3>Trợ lý Eyespire</h3>
              <span className="chat-status">
                <span className="status-dot"></span>
                Đang hoạt động
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="minimize-button" 
              onClick={toggleChat}
              aria-label="Thu nhỏ chat"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button 
              className="close-button" 
              onClick={toggleChat}
              aria-label="Đóng chat"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="chat-messages" ref={chatContainerRef}>
          {chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`message ${chat.role === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {chat.role === 'bot' && (
                <div className="bot-avatar">
                  <i className="fas fa-eye"></i>
                </div>
              )}
              <div className="message-bubble">
                <div className="message-content">
                  {chat.content}
                </div>
                <div className="message-footer">
                  <div className="message-time">
                    {getCurrentTime()}
                  </div>
                  {chat.role === 'bot' && (
                    <button 
                      className={`message-speak-button ${speakingMessageId === chat.id ? 'speaking' : ''}`}
                      onClick={() => speakMessage(chat.content, chat.id)}
                      aria-label={speakingMessageId === chat.id ? "Dừng đọc tin nhắn" : "Đọc tin nhắn này"}
                      title={speakingMessageId === chat.id ? "Dừng đọc tin nhắn" : "Đọc tin nhắn này"}
                    >
                      <i className={`fas ${speakingMessageId === chat.id ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="bot-avatar">
                <i className="fas fa-eye"></i>
              </div>
              <div className="message-bubble">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="chat-footer">
          <form className="chat-input-container" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={message}
              onChange={handleInputChange}
              disabled={isLoading || isListening}
              className="chat-input"
            />
            <button
              type="button"
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              aria-label={isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              title={isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
            >
              <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !message.trim() || isListening} 
              className="send-button"
              aria-label="Gửi tin nhắn"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          <div className="chat-footer-text">
            Powered by Eyespire Assistant
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
