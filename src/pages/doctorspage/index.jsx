import React, { useState, useEffect } from "react";
import "./index.css";
import Footer from "../../components/Footer/Footer";
import DoctorCard from "../../components/Doctors/DoctorCard";
import axios from "axios";
import DoctorsHeader from "./DoctorsHeader";
import ChatBox from "../../components/ChatBox/ChatBox";

// Hardcode BASE_URL thay vì import từ config
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/doctors`);
        setDoctors(response.data);
        
        // Lấy danh sách các chuyên khoa duy nhất, xử lý trường hợp specialty là đối tượng
        const uniqueSpecialties = [...new Set(response.data.map(doctor => {
          if (doctor.specialty && typeof doctor.specialty === 'object') {
            return doctor.specialty.name || '';
          }
          return doctor.specialty || doctor.specialization || '';
        }).filter(spec => spec !== ''))];
        
        setSpecialties(uniqueSpecialties);
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bác sĩ:", error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Lọc bác sĩ theo tìm kiếm và chuyên khoa
  const filteredDoctors = doctors.filter(doctor => {
    // Xử lý trường hợp specialty là đối tượng
    const doctorSpecialty = doctor.specialty && typeof doctor.specialty === 'object' ? 
                           (doctor.specialty.name || '') : 
                           (doctor.specialty || doctor.specialization || '');
    
    const matchesSearch = (doctor.fullName || doctor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doctor.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialty === "" || doctorSpecialty.includes(specialty);
    
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div>
      <DoctorsHeader />
      
      <div className="dth-filter-section">
        <div className="dth-container">
          <div className="dth-filter-controls">
            <div className="dth-search-box">
              <input 
                type="text" 
                placeholder="Tìm kiếm bác sĩ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="dth-specialty-filter">
              <select 
                value={specialty} 
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">Tất cả chuyên khoa</option>
                {specialties.map((spec, index) => (
                  <option key={index} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <section className="dth-doctors-page-section">
        <div className="dth-container">
          {loading ? (
            <div className="dth-loading-spinner">
              <div className="dth-spinner"></div>
            </div>
          ) : (
            <div className="dth-doctors-grid">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ) : (
                <p className="dth-no-doctors">Không tìm thấy bác sĩ phù hợp.</p>
              )}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
      <ChatBox />
    </div>
  );
};

export default DoctorsPage;
