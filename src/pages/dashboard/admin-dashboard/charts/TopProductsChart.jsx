import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Eye, Droplets, AlertCircle } from "lucide-react";
import dashboardService from '../../../../services/dashboardService';

const TopProductsChart = () => {
  const [productsData, setProductsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    fetchTopProducts();
  }, [period]);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching top products...');
      
      const data = await dashboardService.getTopProducts(period);
      console.log('Top products data received:', data);
      
      if (data.error) {
        setError(data.error);
      }
      
      setProductsData(data);
    } catch (err) {
      console.error('Error fetching top products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner">
        <p>
          <AlertCircle size={16} />
          Lỗi khi tải dữ liệu sản phẩm: {error}
        </p>
      </div>
    );
  }

  if (!productsData || !productsData.products) {
    return (
      <div className="error-banner">
        <p>
          <AlertCircle size={16} />
          Không có dữ liệu sản phẩm
        </p>
      </div>
    );
  }

  const { products, summary } = productsData;
  const { totalProducts, totalSold, totalRevenue, totalOrders } = summary;
  
  // Debug products data
  console.log('Products received in chart:', products);
  if (products.length > 0) {
    console.log('Sample product in chart:', products[0]);
  }

  const getCategoryIcon = (category) => {
    const categoryUpper = (category || 'OTHER').toString().toUpperCase();
    switch (categoryUpper) {
      case "MEDICINE":
      case "DROPS":
      case "EYE_DROPS":
        return <Droplets size={16} className="category-icon medicine" />
      case "EYEWEAR":
      case "GLASSES":
      case "SUNGLASSES":
      case "READING_GLASSES":
        return <Eye size={16} className="category-icon eyewear" />
      case "LENS":
      case "CONTACT_LENS":
      case "CONTACT_LENSES":
        return <Eye size={16} className="category-icon eyewear" />
      case "FRAMES":
      case "EYEGLASS_FRAMES":
        return <Eye size={16} className="category-icon eyewear" />
      default:
        return <Package size={16} className="category-icon" />
    }
  }

  const getCategoryLabel = (category) => {
    const categoryUpper = (category || 'OTHER').toString().toUpperCase();
    switch (categoryUpper) {
      case "MEDICINE":
      case "DROPS":
      case "EYE_DROPS":
        return "Thuốc nhỏ mắt"
      case "EYEWEAR":
      case "GLASSES":
      case "SUNGLASSES":
        return "Kính mắt"
      case "READING_GLASSES":
        return "Kính lão"
      case "LENS":
      case "CONTACT_LENS":
      case "CONTACT_LENSES":
        return "Kính áp tròng"
      case "FRAMES":
      case "EYEGLASS_FRAMES":
        return "Gọng kính"
      default:
        return "Sản phẩm khác"
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatGrowth = (growth) => {
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}%`
  }

  const getGrowthClass = (growth) => {
    if (growth > 0) return 'positive'
    if (growth < 0) return 'negative'
    return 'neutral'
  }

  return (
    <div className="top-products-chart">
      <div className="products-summary">
        <div className="summary-item">
          <div className="summary-value">{totalSold}</div>
          <div className="summary-label">Tổng sản phẩm bán</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{formatCurrency(totalRevenue)}</div>
          <div className="summary-label">Tổng doanh thu</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{totalOrders}</div>
          <div className="summary-label">Đơn hàng hoàn thành</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{totalProducts}</div>
          <div className="summary-label">Loại sản phẩm</div>
        </div>
      </div>

      <div className="products-list">
        {products.map((product, index) => {
          console.log(`Product ${index + 1}:`, {
            name: product.name,
            image: product.image,
            category: product.category,
            allFields: Object.keys(product)
          });
          return (
          <div key={product.id} className="product-item">
            <div className="product-rank">
              <span className="rank-number">#{index + 1}</span>
              {index < 3 && <TrendingUp size={12} className="trending-icon" />}
            </div>
            
            <div className="product-image">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    console.log(`Image failed to load: ${product.image}`);
                    // Nếu lỗi load hình, hiển thị icon
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    console.log(`Image loaded successfully: ${product.image}`);
                    // Ẩn icon khi image load thành công
                    e.target.nextSibling.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="product-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
                {getCategoryIcon(product.category)}
              </div>
            </div>

            <div className="product-details">
              <div className="product-name">{product.name}</div>
              <div className="product-category">
                {getCategoryIcon(product.category)}
                <span>{getCategoryLabel(product.category)}</span>
              </div>
            </div>

            <div className="product-metrics">
              <div className="metric-item">
                <span className="metric-value">{product.soldQuantity}</span>
                <span className="metric-label">đã bán</span>
              </div>

              <div className="metric-item">
                <span className="metric-value">{product.orders}</span>
                <span className="metric-label">đơn hàng</span>
              </div>
            </div>

            <div className={`product-growth ${getGrowthClass(product.growth)}`}>
              {formatGrowth(product.growth)}
            </div>
          </div>
          );
        })}
      </div>

      <div className="chart-footer">
        <div className="footer-note">
          <Package size={14} />
          <span>Dữ liệu từ 30 ngày qua</span>
        </div>
      </div>
    </div>
  )
}

export default TopProductsChart
