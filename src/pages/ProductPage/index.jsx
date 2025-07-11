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
import { toast } from "react-toastify";
import ChatBox from "../../components/ChatBox/ChatBox";
import "./index.css";

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

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Lấy thông tin sản phẩm từ API
        const productData = await productService.getProductById(id);
        setProduct(productData);
        
        // Nếu sản phẩm có màu sắc, thiết lập màu mặc định
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        
        // Lấy các sản phẩm liên quan (cùng loại)
        if (productData.type) {
          const relatedProducts = await productService.getProductsByType(productData.type);
          // Lọc ra các sản phẩm khác với sản phẩm hiện tại
          const filteredProducts = relatedProducts.filter(p => p.id !== productData.id).slice(0, 4);
          setRelatedProductsData(filteredProducts);
        }
        
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
      // Hiển thị trạng thái đang thêm vào giỏ hàng
      setAddingToCart(true);
      
      // Thêm sản phẩm vào giỏ hàng và đợi kết quả
      await cartService.addToCart(product, selectedColor, quantity);
      
      // Hiển thị thông báo thành công
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
      
      // Kích hoạt sự kiện storage để cập nhật số lượng trên Header
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="pr-product-detail-page">
      <ProductHeader productName={product.name} />

      {/* Main Product Section */}
      <div className="pr-main-content">
        <div className="pr-container">
          <div className="pr-product-layout">
            {/* Product Gallery */}
            <ProductGallery
              images={product.images || [product.imageUrl || "/placeholder.svg?height=400&width=400"]}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              productName={product.name}
            />

            {/* Product Info */}
            <ProductInfo
              product={product}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              addingToCart={addingToCart}
            />
          </div>

          {/* Product Tabs (Description, Specifications, Reviews) */}
          <ProductTabs
            description={product.description}
            specifications={product.specifications}
            reviews={product.reviews || []}
          />

          {/* Related Products */}
          <RelatedProducts products={relatedProductsData} />
        </div>
      </div>

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />
      <ChatBox />
    </div>
  );
}
