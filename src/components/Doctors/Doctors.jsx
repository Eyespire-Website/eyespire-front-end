import React, { useState, useEffect } from "react";
import "./Doctors.css";
import axios from "axios";

// Hardcode BASE_URL thay vì import từ config
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get avatar URL (copied from working profile page)
  const getAvatarUrl = (url) => {
    if (!url) return null;

    // Nếu là URL đầy đủ (bắt đầu bằng http hoặc https)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Nếu là đường dẫn tương đối, thêm base URL
    if (url.startsWith('/')) {
      return `http://localhost:8080${url}`;
    }

    // Trường hợp khác
    return url;
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('=== DOCTORS COMPONENT DEBUG START ===');
        console.log('Fetching doctors from:', `${BASE_URL}/api/doctors/featured`);
        const response = await axios.get(`${BASE_URL}/api/doctors/featured`);
        console.log('Raw API response:', response);
        console.log('Doctor data from API:', response.data);
        
        if (response.data && response.data.length > 0) {
          console.log('Number of doctors:', response.data.length);
          response.data.forEach((doctor, index) => {
            console.log(`Doctor ${index + 1}:`, {
              id: doctor.id,
              name: doctor.name,
              userName: doctor.user?.name,
              avatarUrl: doctor.user?.avatarUrl,
              fullDoctor: doctor
            });
          });
        }
        
        setDoctors(response.data);
        setLoading(false);
        console.log('=== DOCTORS COMPONENT DEBUG END ===');
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bác sĩ:", error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section className="dth-section" id="doctors-section">
      <div className="dth-container">
        <div className="dth-section-header">
          <h2>Đội ngũ bác sĩ</h2>
          <p>Gặp gỡ đội ngũ bác sĩ chuyên nghiệp của chúng tôi</p>
        </div>

        {loading ? (
          <div className="dth-loading-spinner">
            <div className="dth-spinner"></div>
          </div>
        ) : (
          <div className="dth-doctors-container">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div className="dth-doctor-card" key={doctor.id}>
                  <div className="dth-doctor-image">
                    <img
                      src={doctor.user?.avatarUrl ? `http://localhost:8080${doctor.user.avatarUrl}` : '/images/default-doctor.jpg'}
                      alt={`Bác sĩ ${doctor.user?.name || doctor.name || 'Không có tên'}`}
                      onLoad={() => {
                        console.log('SUCCESS: Image loaded for', doctor.user?.name, 'URL:', `http://localhost:8080${doctor.user?.avatarUrl}`);
                      }}
                      onError={(e) => {
                        console.log('ERROR: Image failed for', doctor.user?.name, 'URL:', `http://localhost:8080${doctor.user?.avatarUrl}`);
                        e.target.src = '/images/default-doctor.jpg';
                      }}
                    />
                  </div>
                  <div className="dth-doctor-info">
                    <h3>{doctor.user?.name || 'Không có tên'}</h3>
                    <p className="dth-doctor-specialty">
                      {doctor.specialty && typeof doctor.specialty === 'object' 
                        ? (doctor.specialty.name || 'Chưa có chuyên khoa') 
                        : (doctor.specialty || doctor.specialization || 'Chưa có chuyên khoa')}
                    </p>
                    <p className="dth-doctor-description">{doctor.description || 'Chưa có mô tả'}</p>
                    <div className="dth-doctor-contact">
                      <button className="dth-btn-appointment">Đặt lịch hẹn</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="dth-no-doctors">Hiện tại chưa có thông tin bác sĩ.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Doctors;
