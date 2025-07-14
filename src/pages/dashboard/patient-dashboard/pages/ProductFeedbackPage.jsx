import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Send, Trash2, Package, Edit2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import authService from "../../../../services/authService";
import orderService from "../../../../services/orderService";
import feedbackService from "../../../../services/feedbackService";
import '../styles/product-feedback.css';

export default function ProductFeedbackPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [feedbackData, setFeedbackData] = useState({});
    const [editingProductId, setEditingProductId] = useState(null);

    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    const fallbackImage = "https://placehold.co/60x60?text=Image";

    const getFullUrl = (url) => {
        if (!url || url.trim() === "" || url === "/placeholder.svg") {
            console.log("Image URL is invalid, using fallback:", fallbackImage);
            return fallbackImage;
        }
        return url.startsWith("http") ? url.trim() : `${baseUrl}${url.startsWith("/") ? url : "/" + url}`;
    };

    const handleImageError = (e) => {
        console.error(`Failed to load image: ${e.target.src}`);
        e.target.src = fallbackImage;
    };

    useEffect(() => {
        const fetchOrderAndFeedbacks = async () => {
            try {
                setLoading(true);
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                const orderData = await orderService.getOrderById(orderId);
                if (orderData.status !== 'COMPLETED') {
                    toast.error("Chỉ có thể đánh giá đơn hàng đã hoàn thành!");
                    navigate('/dashboard/patient/orders');
                    return;
                }
                setOrder(orderData);

                const feedbackPromises = orderData.items.map(item =>
                    feedbackService.getFeedbackByProductId(item.productId)
                );
                const feedbackResults = await Promise.all(feedbackPromises);
                const feedbackMap = {};
                const initialFeedbackData = {};
                orderData.items.forEach((item, index) => {
                    feedbackMap[item.productId] = feedbackResults[index] || [];
                    initialFeedbackData[item.productId] = { rating: 0, comment: '' };
                });
                setFeedbacks(feedbackMap);
                console.log('Feedbacks loaded:', feedbackMap);
                setFeedbackData(initialFeedbackData);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin:", error);
                toast.error("Không thể tải thông tin. Vui lòng thử lại sau!");
                setLoading(false);
            }
        };
        fetchOrderAndFeedbacks();
    }, [orderId, navigate]);

    const handleBackClick = () => {
        navigate('/dashboard/patient/orders');
    };

    const handleFeedbackSubmit = async (productId) => {
        const { rating, comment } = feedbackData[productId];
        if (!rating || rating < 1 || rating > 5) {
            toast.error("Vui lòng chọn số sao đánh giá (1-5)!");
            return;
        }

        setSubmitting(true);
        try {
            const feedbackDTO = {
                productId,
                patientId: authService.getCurrentUser().id,
                rating,
                comment
            };

            let feedback;
            const existingFeedback = feedbacks[productId]?.find(fb => fb.patientId === feedbackDTO.patientId);
            if (existingFeedback) {
                feedbackDTO.id = existingFeedback.id;
                feedback = await feedbackService.updateFeedback(feedbackDTO);
            } else {
                feedback = await feedbackService.createFeedback(feedbackDTO);
            }

            setFeedbacks(prev => ({
                ...prev,
                [productId]: existingFeedback
                    ? prev[productId].map(fb => fb.id === feedback.id ? feedback : fb)
                    : [...(prev[productId] || []), feedback]
            }));
            setFeedbackData(prev => ({
                ...prev,
                [productId]: { rating: 0, comment: '' }
            }));
            setEditingProductId(null);
            toast.success(existingFeedback ? "Đã cập nhật đánh giá thành công!" : "Đã gửi đánh giá thành công!");
        } catch (error) {
            console.error("Lỗi khi gửi/cập nhật đánh giá:", error);
            toast.error("Không thể gửi/cập nhật đánh giá. Vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditFeedback = (productId, feedback) => {
        console.log('Edit clicked for productId:', productId, 'feedback:', feedback);
        setEditingProductId(productId);
        setFeedbackData(prev => ({
            ...prev,
            [productId]: {
                rating: feedback.rating,
                comment: feedback.comment
            }
        }));
    };

    const handleCancelEdit = (productId) => {
        setEditingProductId(null);
        setFeedbackData(prev => ({
            ...prev,
            [productId]: { rating: 0, comment: '' }
        }));
    };

    const handleDeleteFeedback = async (productId, feedbackId) => {
        try {
            await feedbackService.deleteFeedback(feedbackId);
            setFeedbacks(prev => ({
                ...prev,
                [productId]: prev[productId].filter(fb => fb.id !== feedbackId)
            }));
            toast.success("Đã xóa đánh giá!");
        } catch (error) {
            console.error("Lỗi khi xóa đánh giá:", error);
            toast.error("Không thể xóa đánh giá. Vui lòng thử lại!");
        }
    };

    const renderStars = (rating, setRating) => {
        return (
            <div className="ptfb-star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={20}
                        className={star <= rating ? "ptfb-star-filled" : "ptfb-star-empty"}
                        onClick={() => setRating && setRating(star)}
                        style={{ cursor: setRating ? 'pointer' : 'default' }}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="ptfb-loading-container">
                <div className="ptfb-loading-spinner">Đang tải thông tin...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="ptfb-error-container">
                <h2>Không tìm thấy đơn hàng</h2>
                <p>Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
                <button className="ptfb-back-button eop-btn eop-bg-gray-500 eop-text-white eop-hover:bg-gray-600 eop-flex eop-items-center eop-gap-2" onClick={handleBackClick}>
                    <ArrowLeft size={16} />
                    Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    return (
        <div className="ptfb-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="ptfb-header">
                <h1 className="ptfb-title">Đánh giá sản phẩm - Đơn hàng #{order.id}</h1>
                <button className="ptfb-back-button eop-btn eop-bg-gray-500 eop-text-white eop-hover:bg-gray-600 eop-flex eop-items-center eop-gap-2" onClick={handleBackClick}>
                    <ArrowLeft size={16} />
                    Quay lại danh sách đơn hàng
                </button>
            </div>

            <div className="ptfb-products-section">
                <h2 className="ptfb-section-title">Sản phẩm đã đặt</h2>
                <div className="ptfb-products-card">
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => {
                            const userFeedback = feedbacks[item.productId]?.find(fb => fb.patientId === authService.getCurrentUser().id);

                            return (
                                <div key={index} className="ptfb-product-item">
                                    <div className="ptfb-product-image">
                                        <img
                                            src={getFullUrl(item.image)}
                                            alt={item.productName}
                                            className="eop-w-12 eop-h-12 eop-object-cover eop-rounded"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="ptfb-product-details">
                                        <h3 className="ptfb-product-name">{item.productName}</h3>
                                        <p className="ptfb-product-price">
                                            {orderService.formatCurrency(item.price)} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="ptfb-feedback-section">
                                        {userFeedback && editingProductId !== item.productId ? (
                                            <div className="ptfb-existing-feedback">
                                                <div className="ptfb-feedback-header">
                                                    <span>Đánh giá của bạn</span>
                                                    <div className="ptfb-feedback-actions">
                                                        <Edit2
                                                            size={16}
                                                            className="ptfb-edit-feedback"
                                                            onClick={() => {
                                                                console.log('Edit icon clicked for productId:', item.productId);
                                                                handleEditFeedback(item.productId, userFeedback);
                                                            }}
                                                        />
                                                        <Trash2
                                                            size={16}
                                                            className="ptfb-delete-feedback"
                                                            onClick={() => handleDeleteFeedback(item.productId, userFeedback.id)}
                                                        />
                                                    </div>
                                                </div>
                                                {renderStars(userFeedback.rating)}
                                                <p className="ptfb-feedback-comment">{userFeedback.comment}</p>
                                                <p className="ptfb-feedback-date">
                                                    {new Date(userFeedback.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="ptfb-feedback-form">
                                                <h4 className="ptfb-feedback-title">{userFeedback ? "Chỉnh sửa đánh giá" : "Gửi đánh giá của bạn"}</h4>
                                                {renderStars(feedbackData[item.productId]?.rating || 0, (rating) =>
                                                    setFeedbackData(prev => ({
                                                        ...prev,
                                                        [item.productId]: { ...prev[item.productId], rating }
                                                    }))
                                                )}
                                                <textarea
                                                    className="ptfb-feedback-textarea"
                                                    placeholder="Nhập nhận xét của bạn..."
                                                    value={feedbackData[item.productId]?.comment || ''}
                                                    onChange={(e) =>
                                                        setFeedbackData(prev => ({
                                                            ...prev,
                                                            [item.productId]: { ...prev[item.productId], comment: e.target.value }
                                                        }))
                                                    }
                                                />
                                                <div className="ptfb-form-actions">
                                                    <button
                                                        className="ptfb-submit-button eop-btn eop-bg-red-500 eop-text-white eop-hover:bg-red-600 eop-flex eop-items-center eop-gap-2"
                                                        onClick={() => handleFeedbackSubmit(item.productId)}
                                                        disabled={submitting}
                                                    >
                                                        <Send size={16} />
                                                        {submitting ? (userFeedback ? "Đang cập nhật..." : "Đang gửi...") : (userFeedback ? "Cập nhật đánh giá" : "Gửi đánh giá")}
                                                    </button>
                                                    {editingProductId === item.productId && (
                                                        <button
                                                            className="ptfb-cancel-button eop-btn eop-bg-gray-500 eop-text-white eop-hover:bg-gray-600 eop-flex eop-items-center eop-gap-2"
                                                            onClick={() => handleCancelEdit(item.productId)}
                                                        >
                                                            Hủy
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="ptfb-no-products">
                            <Package size={32} />
                            <p>Không có thông tin sản phẩm</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}