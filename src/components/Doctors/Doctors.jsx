import React, { useState, useEffect } from "react";
import "./Doctors.css";
import axios from "axios";

// Hardcode BASE_URL thay vì import từ config
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/doctors/featured`);
        setDoctors(response.data);
        setLoading(false);
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
                      src={doctor.imageUrl || "/images/default-doctor.jpg"}
                      alt={`Bác sĩ ${doctor.fullName || doctor.name || 'Không có tên'}`}
                    />
                  </div>
                  <div className="dth-doctor-info">
                    <h3>{doctor.fullName || doctor.name || 'Không có tên'}</h3>
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
