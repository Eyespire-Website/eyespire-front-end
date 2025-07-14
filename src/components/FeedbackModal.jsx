import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { X } from 'lucide-react';
import serviceFeedbackService from '../services/serviceFeedbackService';
import authService from '../services/authService';
import './FeedbackModal.css';

const FeedbackModal = ({ 
    show, 
    onHide, 
    appointment, 
    existingFeedback = null, 
    onFeedbackSubmitted 
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const currentUser = authService.getCurrentUser();

    // Reset form khi modal mở/đóng hoặc có feedback hiện tại
    useEffect(() => {
        if (show) {
            if (existingFeedback) {
                setRating(existingFeedback.rating || 0);
                setComment(existingFeedback.comment || '');
            } else {
                setRating(0);
                setComment('');
            }
            setError('');
            setSuccess('');
        }
    }, [show, existingFeedback]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const feedbackData = {
                appointmentId: appointment.id,
                patientId: currentUser.id,
                rating: rating,
                comment: comment.trim()
            };

            let result;
            if (existingFeedback) {
                // Cập nhật feedback hiện tại
                result = await serviceFeedbackService.updateFeedback(existingFeedback.id, feedbackData);
                setSuccess('Cập nhật đánh giá thành công!');
            } else {
                // Tạo feedback mới
                result = await serviceFeedbackService.createFeedback(feedbackData);
                setSuccess('Gửi đánh giá thành công!');
            }

            // Gọi callback để cập nhật UI parent
            if (onFeedbackSubmitted) {
                onFeedbackSubmitted(result);
            }

            // Đóng modal sau 1.5 giây
            setTimeout(() => {
                onHide();
            }, 1500);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError(typeof error === 'string' ? error : 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className="star-rating"
                    style={{ 
                        cursor: 'pointer', 
                        fontSize: '24px', 
                        color: '#ffc107',
                        marginRight: '5px'
                    }}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {i <= (hoverRating || rating) ? <FaStar /> : <FaRegStar />}
                </span>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Xử lý hiển thị dịch vụ - hỗ trợ cả mảng dịch vụ và chuỗi dịch vụ
    const renderServices = (services) => {
        // Nếu services là một chuỗi, trả về trực tiếp
        if (typeof services === 'string') return services;
        
        // Nếu services là một mảng
        if (Array.isArray(services)) {
            if (services.length === 0) return 'Không có thông tin dịch vụ';
            if (services.length === 1) {
                // Kiểm tra nếu là object với thuộc tính name
                return typeof services[0] === 'object' && services[0]?.name ? 
                    services[0].name : services[0].toString();
            }
            // Xử lý mảng các object hoặc mảng các chuỗi
            return services.map(service => 
                typeof service === 'object' && service?.name ? 
                    service.name : service.toString()
            ).join(', ');
        }
        
        // Fallback
        return 'Không có thông tin dịch vụ';
    };
    
    // Xử lý hiển thị thông tin bác sĩ
    const renderDoctor = (doctor) => {
        if (!doctor) return 'Không có thông tin';
        
        // Nếu doctor là một chuỗi, trả về trực tiếp
        if (typeof doctor === 'string') return doctor;
        
        // Nếu doctor là một object
        if (typeof doctor === 'object') {
            if (doctor.name) return doctor.name;
            if (doctor.fullName) return doctor.fullName;
        }
        
        // Fallback
        return 'Không có thông tin';
    };

    if (!show) return null;

    return (
        <div className="feedback-modal-overlay">
            <div className="feedback-modal-container">
                <div className="feedback-modal-header">
                    <h3 className="feedback-modal-title">
                        {existingFeedback ? 'Cập nhật đánh giá dịch vụ' : 'Đánh giá dịch vụ'}
                    </h3>
                    <button className="feedback-modal-close" onClick={onHide}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="feedback-modal-body">
                    {/* Thông tin cuộc hẹn */}
                    <div className="appointment-info">
                        <h6>Thông tin cuộc hẹn</h6>
                        <div className="appointment-details">
                            <div className="appointment-col">
                                <p><strong>Dịch vụ:</strong> {renderServices(appointment?.service || appointment?.services)}</p>
                                <p><strong>Bác sĩ:</strong> {renderDoctor(appointment?.doctor)}</p>
                            </div>
                            <div className="appointment-col">
                                <p><strong>Ngày:</strong> {formatDate(appointment?.appointmentTime)}</p>
                                <p><strong>Giờ:</strong> {formatTime(appointment?.appointmentTime)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form đánh giá */}
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        {/* Rating sao */}
                        <div className="form-group">
                            <label className="form-label"><strong>Đánh giá chất lượng dịch vụ *</strong></label>
                            <div className="rating-container">
                                {renderStars()}
                                <span className="rating-text">
                                    {rating > 0 && (
                                        rating === 1 ? 'Rất không hài lòng' :
                                        rating === 2 ? 'Không hài lòng' :
                                        rating === 3 ? 'Bình thường' :
                                        rating === 4 ? 'Hài lòng' :
                                        'Rất hài lòng'
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Bình luận */}
                        <div className="form-group">
                            <label className="form-label"><strong>Nhận xét chi tiết</strong></label>
                            <textarea
                                className="form-textarea"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                                maxLength={1000}
                            />
                            <div className="character-count">
                                {comment.length}/1000 ký tự
                            </div>
                        </div>
                    </form>
                </div>

                <div className="feedback-modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={onHide} 
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                    >
                        {loading ? 'Đang xử lý...' : (existingFeedback ? 'Cập nhật' : 'Gửi đánh giá')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;