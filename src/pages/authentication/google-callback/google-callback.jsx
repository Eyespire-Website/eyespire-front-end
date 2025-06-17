import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authService';
import './google-callback.css';

export default function GoogleCallback() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const processGoogleCallback = async () => {
            try {
                // Lấy code từ URL parameters
                const queryParams = new URLSearchParams(location.search);
                const code = queryParams.get('code');

                if (!code) {
                    setError('Không nhận được mã xác thực từ Google');
                    setLoading(false);
                    return;
                }

                // Gửi code đến backend để xác thực và lưu kết quả trả về
                const result = await authService.handleGoogleCallback(code);
                
                // Kiểm tra kết quả trả về trước khi chuyển hướng
                if (result) {
                    // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
                    navigate('/');
                } else {
                    // Nếu không có kết quả trả về, hiển thị lỗi
                    setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Google login error:', error);
                setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
                setLoading(false);
            }
        };

        processGoogleCallback();
    }, [location, navigate]);

    return (
        <div className="google-callback-container">
            <div className="callback-content">
                {loading ? (
                    <>
                        <div className="loading-spinner"></div>
                        <h2>Đang xử lý đăng nhập...</h2>
                        <p>Vui lòng đợi trong giây lát</p>
                    </>
                ) : (
                    <>
                        <div className="error-icon">❌</div>
                        <h2>Đăng nhập thất bại</h2>
                        <p>{error}</p>
                        <button 
                            className="back-to-login" 
                            onClick={() => navigate('/login')}
                        >
                            Quay lại trang đăng nhập
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
