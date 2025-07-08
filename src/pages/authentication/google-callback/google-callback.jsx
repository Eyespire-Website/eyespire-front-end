import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authService';
import './google-callback.css';

export default function GoogleCallback() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const isProcessingRef = useRef(false);

    useEffect(() => {
        const processGoogleCallback = async () => {
            // Ngăn chặn xử lý trùng lặp
            if (isProcessingRef.current) {
                return;
            }
            
            isProcessingRef.current = true;
            
            try {
                // Lấy code từ URL parameters
                const queryParams = new URLSearchParams(location.search);
                const code = queryParams.get('code');

                if (!code) {
                    setError('Không nhận được mã xác thực từ Google');
                    setLoading(false);
                    isProcessingRef.current = false;
                    return;
                }

                // Gửi code đến backend để xác thực
                const result = await authService.handleGoogleCallback(code);
                
                // Chỉ chuyển hướng khi đăng nhập thành công
                if (result && result.id) {
                    console.log("Google login successful:", result);
                    console.log("User role:", result.role);
                    
                    // Chuyển hướng dựa trên vai trò người dùng
                    const redirectPath = authService.getRoleBasedRedirectPath(result.role);
                    console.log("Redirect path:", redirectPath);
                    navigate(redirectPath);
                } else {
                    // Nếu không có kết quả hợp lệ, hiển thị lỗi
                    setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Google login error:', error);
                setError('Đăng nhập bằng Google thất bại: ' + (error.response?.data || error.message));
                setLoading(false);
                isProcessingRef.current = false;
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
