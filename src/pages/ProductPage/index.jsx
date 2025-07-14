"use client";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductHeader from "./ProductHeader";
import Footer from "../../components/Footer/Footer";
import ProductGallery from "../../components/ProductShop/ProductGallery";
import ProductInfo from "../../components/ProductShop/ProductInfo";
import ProductTabs from "../../components/ProductShop/ProductTabs";
import RelatedProducts from "../../components/ProductShop/RelatedProducts";
import CallToAction from "../../components/ProductShop/CallToAction";
import productService from "../../services/productService";
import cartService from "../../services/cartService";
import feedbackService from "../../services/feedbackService";
import { toast } from "react-toastify";
import ChatBox from "../../components/ChatBox/ChatBox";
import "./index.css";
import { Star, Send } from "lucide-react";
import authService from "../../services/authService";

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProductsData, setRelatedProductsData] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: "" });
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductById(id);
        setProduct(productData);

        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        if (productData.type) {
          const relatedProducts = await productService.getProductsByType(productData.type);
          const filteredProducts = relatedProducts
              .filter((p) => p.id !== productData.id)
              .slice(0, 4);
          setRelatedProductsData(filteredProducts);
        }

        // Fetch feedbacks from feedbackService
        const feedbackData = await feedbackService.getFeedbackByProductId(id);
        setFeedbacks(feedbackData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  if (loading) {
    return (
        <div className="pr-loading-container">
          <div className="pr-loading-spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="pr-error-container">
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
    );
  }

  if (!product) {
    return (
        <div className="pr-error-container">
          <h2>Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => window.history.back()}>Quay lại</button>
        </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await cartService.addToCart(product, selectedColor, quantity);
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    const { rating, comment } = feedbackData;
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao đánh giá (1-5)!");
      return;
    }

    setSubmitting(true);
    try {
      const feedbackDTO = {
        productId: id,
        patientId: authService.getCurrentUser().id,
        rating,
        comment,
      };

      let feedback;
      if (editingFeedbackId) {
        feedbackDTO.id = editingFeedbackId;
        feedback = await feedbackService.updateFeedback(feedbackDTO);
        setFeedbacks((prev) =>
            prev.map((fb) => (fb.id === editingFeedbackId ? feedback : fb))
        );
        setEditingFeedbackId(null);
      } else {
        feedback = await feedbackService.createFeedback(feedbackDTO);
        setFeedbacks((prev) => [...prev, feedback]);
      }

      setFeedbackData({ rating: 0, comment: "" });
      toast.success(
          editingFeedbackId ? "Đã cập nhật đánh giá thành công!" : "Đã gửi đánh giá thành công!"
      );
    } catch (error) {
      console.error("Lỗi khi gửi/cập nhật đánh giá:", error);
      toast.error("Không thể gửi/cập nhật đánh giá. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedbackId(feedback.id);
    setFeedbackData({
      rating: feedback.rating,
      comment: feedback.comment,
    });
  };

  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
    setFeedbackData({ rating: 0, comment: "" });
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await feedbackService.deleteFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((fb) => fb.id !== feedbackId));
      toast.success("Đã xóa đánh giá!");
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      toast.error("Không thể xóa đánh giá. Vui lòng thử lại!");
    }
  };

  const renderStars = (rating, setRating = null) => {
    return Array.from({ length: 5 }, (_, i) => (
        <Star
            key={i}
            size={20}
            className={i < rating ? "filled" : ""}
            onClick={() => setRating && setRating(i + 1)}
            style={{ cursor: setRating ? "pointer" : "default", color: i < rating ? "#facc15" : "#d1d5db" }}
        />
    ));
  };

  const userFeedback = feedbacks.find((fb) => fb.patientId === authService.getCurrentUser().id);

  return (
      <div className="pr-product-detail-page">
        <ProductHeader productName={product.name} />

        <div className="pr-main-content">
          <div className="pr-container">
            <div className="pr-product-layout">
              <ProductGallery
                  images={product.images && product.images.length > 0 ? product.images : [product.imageUrl]}
                  selectedImage={selectedImage}
                  onImageSelect={setSelectedImage}
                  productName={product.name}
              />

              <ProductInfo
                  product={product}
                  feedbacks={feedbacks} // Pass feedbacks explicitly
                  renderStars={renderStars} // Pass renderStars function
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  onAddToCart={handleAddToCart}
                  addingToCart={addingToCart}
              />
            </div>

            <ProductTabs
                description={product.description}
                specifications={product.specifications}
                reviews={feedbacks}
                userFeedback={userFeedback}
                feedbackData={feedbackData}
                onFeedbackChange={(e) =>
                    setFeedbackData((prev) => ({ ...prev, comment: e.target.value }))
                }
                onRatingChange={(rating) => setFeedbackData((prev) => ({ ...prev, rating }))}
                onFeedbackSubmit={handleFeedbackSubmit}
                onEditFeedback={handleEditFeedback}
                onCancelEdit={handleCancelEdit}
                onDeleteFeedback={handleDeleteFeedback}
                submitting={submitting}
                editingFeedbackId={editingFeedbackId}
                renderStars={renderStars}
            />

            <RelatedProducts products={relatedProductsData} />
          </div>
        </div>

        <CallToAction />
        <Footer />
        <ChatBox />
      </div>
  );
}