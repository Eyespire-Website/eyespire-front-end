import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import './AddressSelector.css';

const AddressSelector = ({ onAddressSelect, onDistanceCalculated, defaultAddress = '' }) => {
  const [address, setAddress] = useState(defaultAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  
  // Địa chỉ cửa hàng (có thể thay đổi theo địa chỉ thực tế của bạn)
  const STORE_ADDRESS = "Đại học FPT, Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội";
  const STORE_COORDINATES = { lat: 21.0124, lng: 105.5252 }; // Tọa độ FPT University
  
  // Cấu hình phí ship (VND/km)
  const SHIPPING_RATE_PER_KM = 5000; // 5,000 VND per km
  const BASE_SHIPPING_FEE = 15000; // 15,000 VND base fee
  const MAX_SHIPPING_FEE = 100000; // 100,000 VND max fee

  useEffect(() => {
    initializeGoogleMaps();
  }, []);

  const initializeGoogleMaps = async () => {
    try {
      setIsLoading(true);
      
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      const google = await loader.load();
      
      // Initialize autocomplete
      if (inputRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'vn' }, // Restrict to Vietnam
          fields: ['formatted_address', 'geometry', 'name'],
          types: ['address']
        });

        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      setError('Không thể tải Google Maps. Vui lòng kiểm tra API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place.geometry) {
      setError('Không tìm thấy địa chỉ. Vui lòng chọn từ danh sách gợi ý.');
      return;
    }

    const selectedAddress = place.formatted_address;
    const coordinates = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    setAddress(selectedAddress);
    setError(null);
    
    // Calculate distance and shipping fee
    calculateDistance(coordinates);
    
    // Callback to parent component
    if (onAddressSelect) {
      onAddressSelect({
        address: selectedAddress,
        coordinates: coordinates
      });
    }
  };

  const calculateDistance = async (destinationCoords) => {
    try {
      const google = window.google;
      const service = new google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [STORE_COORDINATES],
        destinations: [destinationCoords],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status === 'OK') {
          const element = response.rows[0].elements[0];
          
          if (element.status === 'OK') {
            const distanceInKm = element.distance.value / 1000; // Convert to km
            const calculatedFee = Math.min(
              BASE_SHIPPING_FEE + (distanceInKm * SHIPPING_RATE_PER_KM),
              MAX_SHIPPING_FEE
            );
            
            setDistance(distanceInKm);
            setShippingFee(Math.round(calculatedFee));
            
            // Callback to parent component
            if (onDistanceCalculated) {
              onDistanceCalculated({
                distance: distanceInKm,
                shippingFee: Math.round(calculatedFee),
                duration: element.duration.text
              });
            }
          } else {
            setError('Không thể tính khoảng cách đến địa chỉ này.');
          }
        } else {
          setError('Lỗi khi tính khoảng cách. Vui lòng thử lại.');
        }
      });
    } catch (err) {
      console.error('Error calculating distance:', err);
      setError('Lỗi khi tính khoảng cách.');
    }
  };

  const handleInputChange = (e) => {
    setAddress(e.target.value);
    // Reset distance and shipping fee when user types
    setDistance(null);
    setShippingFee(0);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const google = window.google;
          const geocoder = new google.maps.Geocoder();
          
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                const currentAddress = results[0].formatted_address;
                setAddress(currentAddress);
                
                // Calculate distance from current location
                calculateDistance({ lat: latitude, lng: longitude });
                
                if (onAddressSelect) {
                  onAddressSelect({
                    address: currentAddress,
                    coordinates: { lat: latitude, lng: longitude }
                  });
                }
              } else {
                setError('Không thể lấy địa chỉ từ vị trí hiện tại.');
              }
              setIsLoading(false);
            }
          );
        } catch (err) {
          setError('Lỗi khi lấy địa chỉ hiện tại.');
          setIsLoading(false);
        }
      },
      (error) => {
        setError('Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="address-selector">
      <div className="address-input-container">
        <label htmlFor="address-input" className="address-label">
          Địa chỉ giao hàng *
        </label>
        
        <div className="address-input-wrapper">
          <input
            ref={inputRef}
            id="address-input"
            type="text"
            value={address}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ giao hàng..."
            className="address-input"
            disabled={isLoading}
          />
          
          <button
            type="button"
            onClick={getCurrentLocation}
            className="current-location-btn"
            disabled={isLoading}
            title="Sử dụng vị trí hiện tại"
          >
            📍
          </button>
        </div>
        
        {isLoading && (
          <div className="loading-indicator">
            <span>Đang tải...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      {distance && (
        <div className="distance-info">
          <div className="distance-details">
            <p><strong>Khoảng cách:</strong> {distance.toFixed(1)} km</p>
            <p><strong>Phí vận chuyển:</strong> {shippingFee.toLocaleString('vi-VN')} VND</p>
          </div>
          
          <div className="shipping-note">
            <small>
              * Phí ship = {BASE_SHIPPING_FEE.toLocaleString('vi-VN')} VND (cơ bản) + {SHIPPING_RATE_PER_KM.toLocaleString('vi-VN')} VND/km
            </small>
          </div>
        </div>
      )}
      
      <div className="store-info">
        <small>
          <strong>Giao hàng từ:</strong> {STORE_ADDRESS}
        </small>
      </div>
    </div>
  );
};

export default AddressSelector;
