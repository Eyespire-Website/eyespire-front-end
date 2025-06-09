"use client";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/shop/Header-shop";
import Footer from "../../components/Footer/Footer";
import HeroBanner from "../../components/ProductShop/HeroBanner";
import ProductGallery from "../../components/ProductShop/ProductGallery";
import ProductInfo from "../../components/ProductShop/ProductInfo";
import ProductTabs from "../../components/ProductShop/ProductTabs";
import RelatedProducts from "../../components/ProductShop/RelatedProducts";
import CallToAction from "../../components/ProductShop/CallToAction";
import "./index.css";

const productData = {
  id: 1,
  name: "Neil",
  price: 129,
  originalPrice: 279,
  rating: 5,
  reviewCount: 1,
  colors: [
    { id: "black", name: "Black", color: "#000000" },
    { id: "white", name: "White", color: "#ffffff" },
    { id: "brown", name: "Brown", color: "#8b4513" },
  ],
  images: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
  description: `Phasellus massa massa ultrices mi quis hendrerit. Lobortis mattis aliquam faucibus purus in massa tempor nec. In hac habitasse platea dictumst vestibulum rhoncus.

Mauris pharetra et ultrices neque ornare aenean euismod elementum nisi. Quis ipsum suspendisse ultrices gravida dictum fusce. Curabitur vitae nunc sed velit dignissim sodales ut eu sem. Pellentesque ut amet porttitor eget dolor.`,
  specifications: {
    "Frame Material": "Acetate",
    "Lens Width": "52mm",
    "Bridge Width": "18mm",
    "Temple Length": "145mm",
    "Frame Color": "Multiple Options",
    "Lens Type": "Prescription Ready",
  },
  reviews: [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent quality glasses! Very comfortable and stylish.",
    },
  ],
};

const relatedProducts = [
  {
    id: 2,
    name: "Glasses POV (890)",
    price: 195,
    colors: ["black", "white", "brown"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Glasses YUH 2390",
    price: 125,
    colors: ["black", "white", "brown"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Sunglasses CKY 8339",
    price: 140,
    colors: ["black", "white", "brown"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Glasses LD 8339",
    price: 160,
    colors: ["black", "white", "brown"],
    image: "/placeholder.svg?height=200&width=200",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState(productData.colors[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Ở đây bạn có thể gọi API để lấy chi tiết sản phẩm dựa vào id
    // Tạm thời dùng dữ liệu mẫu
    setProduct(productData);
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }
  const handleAddToCart = () => {
    console.log("Adding to cart:", {
      product: productData,
      color: selectedColor,
      quantity,
    });
    // Implement cart logic here
  };

  return (
    <div className="pr-product-detail-page">
      <Header />

      {/* Hero Banner */}
      <HeroBanner
        title="Single Product"
        breadcrumb={["Home", "Shop", "Single Product"]}
      />

      {/* Main Product Section */}
      <div className="pr-main-content">
        <div className="pr-container">
          <div className="pr-product-layout">
            {/* Product Gallery */}
            <ProductGallery
              images={productData.images}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              productName={productData.name}
            />

            {/* Product Info */}
            <ProductInfo
              product={productData}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Product Tabs */}
          <ProductTabs
            description={productData.description}
            specifications={productData.specifications}
            reviews={productData.reviews}
          />
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />

      {/* Call to Action Sections */}
      <CallToAction />

      <Footer />
    </div>
  );
}
