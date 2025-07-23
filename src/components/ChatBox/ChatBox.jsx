import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';
import chatService from '../../services/chatService';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', content: '🤖 Xin chào! Tôi là trợ lý AI Eyespire. Tôi có thể giúp bạn:\n\n🔍 Tìm kiếm thông tin về lịch hẹn của bạn\n📋 Xem hồ sơ bệnh án và kết quả khám\n🛍️ Tìm sản phẩm, thuốc, kính mắt phù hợp\n💬 Tư vấn về các vấn đề mắt\n\nHãy thử hỏi: "Lịch hẹn của tôi hôm nay" hoặc "Thuốc nhỏ mắt nào phù hợp?"', id: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions] = useState(chatService.getSuggestedQueries());
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
    const userMessage = { role: 'user', content: message, id: Date.now(), timestamp: new Date() };
    setChatHistory([...chatHistory, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      // Gửi tin nhắn đến API và nhận phản hồi với AI capabilities
      const response = await chatService.sendMessage(currentMessage);
      
      // Format response với emoji và styling
      const formattedResponse = chatService.formatResponse(response);
      
      // Thêm phản hồi từ bot vào lịch sử
      const botMessage = { 
        role: 'bot', 
        content: formattedResponse, 
        id: Date.now(),
        timestamp: new Date(),
        isAIQuery: response.isAIQuery,
        success: response.success
      };
      setChatHistory(prev => [...prev, botMessage]);
      
      // Log AI query detection
      if (response.isAIQuery) {
        console.log('🤖 AI Query detected and processed:', currentMessage);
      }
      
    } catch (error) {
      console.error('Error:', error);
      // Thêm thông báo lỗi vào lịch sử
      const errorMessage = { 
        role: 'bot', 
        content: '❌ Xin lỗi, tôi đang gặp vấn đề kỹ thuật. Vui lòng thử lại sau.',
        id: Date.now(),
        timestamp: new Date(),
        success: false
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý click suggestion
  const handleSuggestionClick = (query) => {
    setMessage(query);
    setShowSuggestions(false);
    // Auto submit suggestion
    setTimeout(() => {
      const event = { preventDefault: () => {} };
      handleSubmit(event);
    }, 100);
  };

  // Toggle suggestions
  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
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
    <div className="aibox-chat-box-container">
      {/* Nút chat */}
      <button 
        className={`aibox-chat-button ${isOpen ? 'active' : ''}`} 
        onClick={toggleChat}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        <div className="aibox-chat-button-content">
          {!isOpen && (
            <>
              <i className="fas fa-comments"></i>
              <span className="aibox-chat-button-text">Chat với AI</span>
            </>
          )}
          {isOpen && <i className="fas fa-times"></i>}
        </div>
      </button>

      {/* Hộp chat */}
      <div className={`aibox-chat-container ${isOpen ? 'open' : ''}`}>
        <div className="aibox-chat-header">
          <div className="aibox-chat-title">
            <div className="aibox-chat-logo">
              <i className="fas fa-eye"></i>
            </div>
            <div className="aibox-chat-title-text">
              <h3>Eyespire Assistant</h3>
              <div className="aibox-chat-status">
                <span className="aibox-status-dot"></span>
                Đang hoạt động
              </div>
            </div>
          </div>
          <div className="aibox-header-actions">
            <button 
              className="aibox-minimize-button" 
              onClick={toggleChat}
              aria-label="Thu nhỏ chat"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button 
              className="aibox-close-button" 
              onClick={toggleChat}
              aria-label="Đóng chat"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="aibox-chat-messages" ref={chatContainerRef}>
          {chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`aibox-message ${chat.role === 'user' ? 'aibox-user-message' : 'aibox-bot-message'}`}
            >
              {chat.role === 'bot' && (
                <div className="aibox-bot-avatar">
                  <i className="fas fa-eye"></i>
                </div>
              )}
              <div className="aibox-message-bubble">
                <div className="aibox-message-content">
                  {chat.content}
                </div>
                <div className="aibox-message-footer">
                  <div className="aibox-message-time">
                    {getCurrentTime()}
                  </div>
                  {chat.role === 'bot' && (
                    <button 
                      className={`aibox-message-speak-button ${speakingMessageId === chat.id ? 'speaking' : ''}`}
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
            <div className="aibox-message aibox-bot-message">
              <div className="aibox-bot-avatar">
                <i className="fas fa-eye"></i>
              </div>
              <div className="aibox-message-bubble">
                <div className="aibox-message-content aibox-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* AI Suggestions Panel */}
        {showSuggestions && (
          <div className="aibox-suggestions-panel">
            <div className="aibox-suggestions-header">
              <span>🤖 Gợi ý câu hỏi thông minh</span>
              <button 
                type="button" 
                className="aibox-suggestions-close"
                onClick={toggleSuggestions}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="aibox-suggestions-content">
              {suggestions.map((category, categoryIndex) => (
                <div key={categoryIndex} className="aibox-suggestion-category">
                  <h4 className="aibox-category-title">{category.category}</h4>
                  <div className="aibox-suggestion-list">
                    {category.queries.map((query, queryIndex) => (
                      <button
                        key={queryIndex}
                        type="button"
                        className="aibox-suggestion-item"
                        onClick={() => handleSuggestionClick(query)}
                      >
                        <i className="fas fa-lightbulb"></i>
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="aibox-chat-footer">
          <div className="aibox-input-actions">
            <button
              type="button"
              className={`aibox-suggestions-button ${showSuggestions ? 'active' : ''}`}
              onClick={toggleSuggestions}
              title="Hiển thị gợi ý câu hỏi"
            >
              <i className="fas fa-lightbulb"></i>
            </button>
          </div>
          <form className="aibox-chat-input-container" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={message}
              onChange={handleInputChange}
              disabled={isLoading || isListening}
              className="aibox-chat-input"
            />
            <button
              type="button"
              className={`aibox-mic-button ${isListening ? 'listening' : ''}`}
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
              className="aibox-send-button"
              aria-label="Gửi tin nhắn"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          <div className="aibox-chat-footer-text">
            Powered by Eyespire Assistant
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
