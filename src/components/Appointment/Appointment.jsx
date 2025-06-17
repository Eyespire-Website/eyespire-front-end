import React, { useState, useEffect } from "react";
import "./Appointment.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";
import { useNavigate } from "react-router-dom";

const Appointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceId: "",
    doctorId: "",
    appointmentDate: "",
    hourSlot: "",
    notes: ""
  });

  // Khung giờ từ 8h đến 16h
  const allTimeSlots = [
    { value: 8, label: "8:00" },
    { value: 9, label: "9:00" },
    { value: 10, label: "10:00" },
    { value: 11, label: "11:00" },
    { value: 12, label: "12:00" },
    { value: 13, label: "13:00" },
    { value: 14, label: "14:00" },
    { value: 15, label: "15:00" },
    { value: 16, label: "16:00" },
  ];

  // Lấy danh sách bác sĩ và dịch vụ khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorsData = await appointmentService.getDoctors();
        const servicesData = await appointmentService.getMedicalServices();
        setDoctors(doctorsData);
        setServices(servicesData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Không thể tải dữ liệu bác sĩ và dịch vụ");
      }
    };

    fetchData();
  }, []);

  // Xử lý khi người dùng thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Nếu thay đổi bác sĩ hoặc ngày, cần cập nhật lại danh sách khung giờ trống
    if (name === "doctorId" || name === "appointmentDate") {
      if (formData.doctorId && formData.appointmentDate) {
        fetchAvailableTimeSlots(name === "doctorId" ? value : formData.doctorId, name === "appointmentDate" ? value : formData.appointmentDate);
      }
    }
  };

  // Lấy danh sách khung giờ trống của bác sĩ theo ngày
  const fetchAvailableTimeSlots = async (doctorId, date) => {
    try {
      setLoading(true);
      const availabilities = await appointmentService.getAvailableTimeSlots(doctorId, date);
      setAvailableTimeSlots(availabilities);
    } catch (error) {
      console.error("Lỗi khi lấy khung giờ trống:", error);
      toast.error("Không thể tải khung giờ trống của bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra xem khung giờ có khả dụng không
  const isTimeSlotAvailable = (hourSlot) => {
    // Chuyển hourSlot từ số nguyên thành chuỗi định dạng giờ (ví dụ: 8 -> "08:00")
    const hourString = hourSlot < 10 ? `0${hourSlot}:00` : `${hourSlot}:00`;
    
    return availableTimeSlots.some(slot => {
      // Kiểm tra nếu time khớp với hourString và status là AVAILABLE
      return slot.time === hourString && slot.status === "AVAILABLE";
    });
  };

  // Xử lý khi người dùng gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra người dùng đã đăng nhập chưa
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để đặt lịch khám");
      navigate("/login");
      return;
    }

    // Kiểm tra các trường bắt buộc
    if (!formData.fullName || !formData.email || !formData.phone || !formData.serviceId || 
        !formData.doctorId || !formData.appointmentDate || !formData.hourSlot) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      
      // Chuyển đổi hourSlot từ số nguyên thành chuỗi định dạng "HH:mm"
      const hourSlotValue = parseInt(formData.hourSlot);
      const timeSlot = hourSlotValue < 10 ? `0${hourSlotValue}:00` : `${hourSlotValue}:00`;
      
      // Chuẩn bị dữ liệu để gửi lên server
      const appointmentData = {
        userId: currentUser.id,
        doctorId: parseInt(formData.doctorId),
        serviceId: parseInt(formData.serviceId),
        appointmentDate: formData.appointmentDate,
        timeSlot: timeSlot,
        patientName: formData.fullName,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        notes: formData.notes
      };

      // Gọi API đặt lịch
      const response = await appointmentService.bookAppointment(appointmentData);
      
      toast.success("Đặt lịch khám thành công!");
      
      // Reset form sau khi đặt lịch thành công
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        serviceId: "",
        doctorId: "",
        appointmentDate: "",
        hourSlot: "",
        notes: ""
      });
      
      // Nếu đặt lịch thành công và người dùng đã đăng nhập, chuyển hướng đến trang lịch hẹn
      setTimeout(() => {
        navigate("/dashboard/patient/appointments");
      }, 2000);
      
    } catch (error) {
      console.error("Lỗi khi đặt lịch khám:", error);
      toast.error("Đặt lịch khám thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin người dùng nếu đã đăng nhập
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || ""
      }));
    }
  }, []);

  // Tạo ngày tối thiểu cho input date (ngày hiện tại)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="appointment-container" id="appointment">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="appointment-content">
        <div className="appointment-left">
          <h2 className="appointment-title">Đặt lịch khám</h2>
          <p className="appointment-description">
            Đặt lịch khám mắt với các bác sĩ chuyên khoa giàu kinh nghiệm của chúng tôi. Chúng tôi cung cấp các dịch vụ chăm sóc mắt toàn diện để đảm bảo sức khỏe thị giác của bạn.
          </p>
          <div className="appointment-contact">
            <div className="contact-item">
              <img 
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/phone-icon.png" 
                alt="Phone" 
                className="contact-icon" 
              />
              <span>+84 123 456 789</span>
            </div>
            <div className="contact-item">
              <img 
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/email-icon.png" 
                alt="Email" 
                className="contact-icon" 
              />
              <span>info@eyespire.com</span>
            </div>
          </div>
        </div>
        <div className="appointment-right">
          <form className="appointment-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Họ và tên" 
                className="form-input" 
              />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Địa chỉ email" 
                className="form-input" 
              />
            </div>
            <div className="form-row">
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Số điện thoại" 
                className="form-input" 
              />
              <select 
                className="form-input"
                name="serviceId"
                value={formData.serviceId}
                onChange={handleInputChange}
              >
                <option value="">Chọn dịch vụ</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <select 
                className="form-input"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
              >
                <option value="">Chọn bác sĩ</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    BS. {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
              <input 
                type="date" 
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                min={today}
                className="form-input" 
              />
            </div>
            <div className="form-row">
              <select 
                className="form-input"
                name="hourSlot"
                value={formData.hourSlot}
                onChange={handleInputChange}
                disabled={!formData.doctorId || !formData.appointmentDate}
              >
                <option value="">Chọn giờ khám</option>
                {allTimeSlots.map(slot => (
                  <option 
                    key={slot.value} 
                    value={slot.value}
                    disabled={!isTimeSlotAvailable(slot.value)}
                  >
                    {slot.label} {!isTimeSlotAvailable(slot.value) && formData.doctorId && formData.appointmentDate ? "(Đã đặt)" : ""}
                  </option>
                ))}
              </select>
              <div className="form-input time-slot-info">
                {formData.doctorId && formData.appointmentDate ? (
                  loading ? "Đang tải..." : (
                    availableTimeSlots.length > 0 ? 
                      `${availableTimeSlots.filter(slot => slot.status === "AVAILABLE").length} khung giờ trống` : 
                      "Không có khung giờ trống"
                  )
                ) : "Vui lòng chọn bác sĩ và ngày khám"}
              </div>
            </div>
            <textarea 
              placeholder="Thông tin bổ sung" 
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-textarea"
            ></textarea>
            <button 
              type="submit" 
              className="appointment-button"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt lịch khám"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
