import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AddressSelector.css';
import logo from '../../assets/logo2.png';

// Component to handle map resizing
const MapResizer = () => {
  const map = useMap();
  
  useEffect(() => {
    const resizeMap = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };
    
    // Resize map when component mounts
    resizeMap();
    
    // Listen for window resize
    window.addEventListener('resize', resizeMap);
    
    return () => {
      window.removeEventListener('resize', resizeMap);
    };
  }, [map]);
  
  return null;
};

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom store icon using Eyespire logo
const storeIcon = new L.Icon({
  iconUrl: logo,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'store-marker-icon'
});

// Custom delivery icon
const deliveryIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="#28a745" stroke="white" stroke-width="2"/>
      <path d="M16 8 L20 14 L12 14 Z" fill="white"/>
      <rect x="15" y="14" width="2" height="8" fill="white"/>
      <circle cx="16" cy="24" r="2" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to fit map bounds
const MapBoundsController = ({ storeCoords, deliveryCoords }) => {
  const map = useMap();
  
  useEffect(() => {
    if (deliveryCoords) {
      // Fit map to show both store and delivery location
      const bounds = L.latLngBounds([
        [storeCoords.lat, storeCoords.lng],
        [deliveryCoords.lat, deliveryCoords.lng]
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      // Center on store location
      map.setView([storeCoords.lat, storeCoords.lng], 13);
    }
  }, [map, storeCoords, deliveryCoords]);
  
  return null;
};

const AddressSelector = ({ onAddressSelect, onDistanceCalculated, defaultAddress = '' }) => {
  const [address, setAddress] = useState(defaultAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  
  const searchTimeoutRef = useRef(null);
  
  // Địa chỉ cửa hàng Eyespire
  const STORE_ADDRESS = "137 Trần Văn Giảng, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng";
  const STORE_COORDINATES = { lat: 15.9851099, lng: 108.2703416 };
  
  // Cấu hình phí ship (VND/km)
  const SHIPPING_RATE_PER_KM = 2000; // 2,000 VND per km
  const BASE_SHIPPING_FEE = 10000; // 10,000 VND base fee
  const MAX_SHIPPING_FEE = 50000; // 50,000 VND max fee

  // Get route between two points (using straight line for now)
  const getRoute = async (startCoords, endCoords) => {
    // Return straight line between points (no API call needed)
    return [
      [startCoords.lat, startCoords.lng],
      [endCoords.lat, endCoords.lng]
    ];
  };
  
  // Note: To enable real routing, get a free API key from https://openrouteservice.org/
  // and replace the getRoute function with the API call

  // Search addresses using Nominatim API (OpenStreetMap)
  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // Nominatim API for Vietnam addresses
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=vn&q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search addresses');
      }
      
      const data = await response.json();
      
      const formattedSuggestions = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name
      }));
      
      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
      setError(null);
    } catch (err) {
      console.error('Error searching addresses:', err);
      setError('Không thể tìm kiếm địa chỉ. Vui lòng thử lại.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Reset distance and shipping fee when user types
    setDistance(null);
    setShippingFee(0);
    setSelectedLocation(null);
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 500);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    setAddress(suggestion.display_name);
    const deliveryCoords = { lat: suggestion.lat, lng: suggestion.lon };
    setSelectedLocation(deliveryCoords);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Calculate distance and shipping fee
    calculateDistance(deliveryCoords);
    
    // Get route coordinates
    const route = await getRoute(STORE_COORDINATES, deliveryCoords);
    setRouteCoordinates(route);
    
    // Callback to parent component
    if (onAddressSelect) {
      onAddressSelect({
        address: suggestion.display_name,
        coordinates: deliveryCoords
      });
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (destinationCoords) => {
    try {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (destinationCoords.lat - STORE_COORDINATES.lat) * Math.PI / 180;
      const dLon = (destinationCoords.lng - STORE_COORDINATES.lng) * Math.PI / 180;
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(STORE_COORDINATES.lat * Math.PI / 180) * Math.cos(destinationCoords.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceInKm = R * c;
      
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
          duration: `${Math.round(distanceInKm * 2)} phút` // Estimate 2 minutes per km
        });
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
      setError('Lỗi khi tính khoảng cách.');
    }
  };

  // Get current location with high accuracy
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Options for high accuracy geolocation
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 60000 // Accept cached position up to 1 minute old
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`Current position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          // Reverse geocoding using Nominatim with Vietnam preference
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&countrycodes=vn&accept-language=vi`
          );
          
          if (!response.ok) {
            throw new Error('Failed to get address from coordinates');
          }
          
          const data = await response.json();
          let currentAddress = data.display_name;
          
          // If no Vietnam address found, try without country restriction
          if (!currentAddress || !currentAddress.includes('Việt Nam')) {
            const fallbackResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=vi`
            );
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              currentAddress = fallbackData.display_name || `${latitude}, ${longitude}`;
            }
          }
          
          const currentCoords = { lat: latitude, lng: longitude };
          setAddress(currentAddress);
          setSelectedLocation(currentCoords);
          setSuggestions([]);
          setShowSuggestions(false);
          
          // Calculate distance from current location
          calculateDistance(currentCoords);
          
          // Get route coordinates
          const route = await getRoute(STORE_COORDINATES, currentCoords);
          setRouteCoordinates(route);
          
          if (onAddressSelect) {
            onAddressSelect({
              address: currentAddress,
              coordinates: currentCoords
            });
          }
          
          setError(null);
        } catch (err) {
          console.error('Error getting current address:', err);
          setError('Không thể lấy địa chỉ từ vị trí hiện tại. Vui lòng thử lại.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Không thể lấy vị trí hiện tại.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vui lòng cho phép truy cập vị trí trong trình duyệt.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Hết thời gian chờ lấy vị trí. Vui lòng thử lại.';
            break;
          default:
            errorMessage = 'Lỗi không xác định khi lấy vị trí.';
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      options
    );
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="address-selector">
      <div className="address-input-container">
        <label htmlFor="address-input" className="address-label">
          Địa chỉ giao hàng *
        </label>
        
        <div className="address-input-wrapper" onClick={(e) => e.stopPropagation()}>
          <input
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
            ⌖
          </button>
          
          {/* Address Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="address-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="address-suggestion-item"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.display_name}
                </div>
              ))}
            </div>
          )}
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
      
      {/* Map Display - Always show store location */}
      <div className="map-container">
        <MapContainer
          center={[STORE_COORDINATES.lat, STORE_COORDINATES.lng]}
          zoom={13}
        >
          <MapResizer />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Store marker - always visible */}
          <Marker 
            position={[STORE_COORDINATES.lat, STORE_COORDINATES.lng]}
            icon={storeIcon}
          >
            <Popup>
              <div className="popup-content">
                <strong>Cửa hàng Eyespire</strong><br/>
                {STORE_ADDRESS}
              </div>
            </Popup>
          </Marker>
          
          {/* Delivery marker - only when location selected */}
          {selectedLocation && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={deliveryIcon}
            >
              <Popup>
                <div className="popup-content">
                  <strong>Địa chỉ giao hàng</strong><br/>
                  {address}
                  {distance && (
                    <div className="popup-distance">
                      <br/>Khoảng cách: {distance.toFixed(1)} km<br/>
                      Phí ship: {shippingFee.toLocaleString('vi-VN')} VND
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Route line */}
          {routeCoordinates.length > 0 && (
            <Polyline 
              positions={routeCoordinates} 
              color="#007bff" 
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
          
          {/* Map bounds controller */}
          <MapBoundsController 
            storeCoords={STORE_COORDINATES} 
            deliveryCoords={selectedLocation} 
          />
        </MapContainer>
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
