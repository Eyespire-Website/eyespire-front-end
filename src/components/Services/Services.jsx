import React, { useState, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import "./Services.css";
import medicalServiceService from "../../services/medicalServiceService";
import { toast } from 'react-toastify';

const Services = () => {
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch services from database on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log('Fetching services from database...');
        const services = await medicalServiceService.getAllMedicalServices();
        console.log('Services fetched:', services);
        
        // Helper function to process image URLs
        const processImageUrl = (imageUrl) => {
          if (!imageUrl) return null;
          
          // If it's already a full URL, return as is
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
          }
          
          // If it starts with /, add the base URL
          if (imageUrl.startsWith('/')) {
            return `http://localhost:8080${imageUrl}`;
          }
          
          // Otherwise, assume it's a relative path and add base URL
          return `http://localhost:8080/${imageUrl}`;
        };
        
        // Transform API data to match component expectations
        const transformedServices = services.map((service, index) => {
          const processedImageUrl = processImageUrl(service.imageUrl || service.image);
          
          console.log(`Service ${service.id} image processing:`, {
            original: service.imageUrl || service.image,
            processed: processedImageUrl,
            serviceName: service.name
          });
          
          return {
            id: service.id,
            title: service.name || service.serviceName || `Service ${service.id}`,
            number: String(index + 1).padStart(2, '0'),
            imageUrl: processedImageUrl,
            description: service.description || service.details || 'Dịch vụ chăm sóc mắt chuyên nghiệp',
            price: service.price || null,
            duration: service.duration || null
          };
        });
        
        setServicesData(transformedServices);
        setError(null);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Không thể tải danh sách dịch vụ');
        toast.error('Không thể tải danh sách dịch vụ từ cơ sở dữ liệu');
        
        // Fallback to empty array or show error message
        setServicesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="column7">
        <div className="row-view10">
          <span className="text17">{"Dịch Vụ Chăm Sóc Mắt Của Chúng Tôi"}</span>
          <span className="text18">
            {"Đang tải danh sách dịch vụ..."}
          </span>
        </div>
        <div className="row-view11">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', fontSize: '18px', color: '#666' }}>
            Đang tải dịch vụ từ cơ sở dữ liệu...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="column7">
        <div className="row-view10">
          <span className="text17">{"Dịch Vụ Chăm Sóc Mắt Của Chúng Tôi"}</span>
          <span className="text18">
            {"Có lỗi xảy ra khi tải danh sách dịch vụ"}
          </span>
        </div>
        <div className="row-view11">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px', fontSize: '16px', color: '#e74c3c' }}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '10px', 
                padding: '10px 20px', 
                backgroundColor: '#3498db', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no services
  if (servicesData.length === 0) {
    return (
      <div className="column7">
        <div className="row-view10">
          <span className="text17">{"Dịch Vụ Chăm Sóc Mắt Của Chúng Tôi"}</span>
          <span className="text18">
            {"Hiện tại chưa có dịch vụ nào trong cơ sở dữ liệu"}
          </span>
        </div>
        <div className="row-view11">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', fontSize: '16px', color: '#666' }}>
            Chưa có dịch vụ nào được thêm vào hệ thống.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="column7">
      <div className="row-view10">
        <span className="text17">{"Dịch Vụ Chăm Sóc Mắt Của Chúng Tôi"}</span>
        <span className="text18">
          {"Chúng tôi cung cấp các dịch vụ chăm sóc mắt chuyên nghiệp và hiện đại"}
        </span>
      </div>
      <div className="row-view11">
        {servicesData.slice(0, 3).map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            number={service.number}
            imageUrl={service.imageUrl}
            description={service.description}
            service={service}
          />
        ))}
      </div>
      {servicesData.length > 3 && (
        <div className="row-view14">
          {servicesData.slice(3, 6).map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              number={service.number}
              imageUrl={service.imageUrl}
              description={service.description}
              service={service}
            />
          ))}
        </div>
      )}
      {servicesData.length > 6 && (
        <div className="row-view14">
          {servicesData.slice(6, 9).map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              number={service.number}
              imageUrl={service.imageUrl}
              description={service.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
