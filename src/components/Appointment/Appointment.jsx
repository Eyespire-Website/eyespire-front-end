import React, { useState, useEffect } from "react";
import "./Appointment.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";
import paymentService from '../../services/paymentService';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const Appointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectToPayOS, setRedirectToPayOS] = useState(false);
  const [payosUrl, setPayosUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isPatient, setIsPatient] = useState(false);

  // Form data state
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

  // Validation state
  const [errors, setErrors] = useState({});

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
    
    // Tự động điền thông tin người dùng nếu đã đăng nhập
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    if (user && user.role && user.role.toLowerCase() === 'patient') {
      setIsPatient(true);
      // Nếu là bệnh nhân, tự động điền thông tin cá nhân
      setFormData(prevState => ({
        ...prevState,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, []);

  // Lấy danh sách khung giờ trống của bác sĩ theo ngày
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (formData.doctorId && formData.appointmentDate) {
        try {
          setLoading(true);
          const slots = await appointmentService.getAvailableTimeSlots(formData.doctorId, formData.appointmentDate);
          setAvailableTimeSlots(slots);
        } catch (error) {
          console.error("Lỗi khi lấy khung giờ trống:", error);
          toast.error("Không thể tải khung giờ trống");
          setAvailableTimeSlots([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTimeSlots();
  }, [formData.doctorId, formData.appointmentDate]);

  // Xử lý khi người dùng thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại phải có 10 chữ số';
    
    if (!formData.serviceId) newErrors.serviceId = 'Vui lòng chọn dịch vụ';
    if (!formData.doctorId) newErrors.doctorId = 'Vui lòng chọn bác sĩ';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Vui lòng chọn ngày khám';
    if (!formData.hourSlot) newErrors.hourSlot = 'Vui lòng chọn giờ khám';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi người dùng gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Tạo thanh toán đặt cọc qua PayOS
      const paymentResponse = await paymentService.createPayOSDeposit(formData);
      
      if (paymentResponse && paymentResponse.paymentUrl) {
        setPayosUrl(paymentResponse.paymentUrl);
        setRedirectToPayOS(true);
        
        // Chuyển hướng người dùng đến trang thanh toán PayOS
        window.location.href = paymentResponse.paymentUrl;
      } else {
        toast.error('Không thể tạo thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi đặt lịch:', error);
      toast.error('Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
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

  // Render time slot options
  const renderTimeSlots = () => {
    if (!formData.doctorId || !formData.appointmentDate) {
      return <option value="">Vui lòng chọn bác sĩ và ngày khám</option>;
    }
    
    if (loading) {
      return <option value="">Đang tải khung giờ...</option>;
    }
    
    if (availableTimeSlots.length === 0) {
      return <option value="">Không có khung giờ trống</option>;
    }
    
    return (
      <>
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
      </>
    );
  };

  // Tạo ngày tối thiểu cho input date (ngày hiện tại)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="appointment-container" id="appointment-section">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="appointment-content">
        <div className="appointment-left">
          <h2 className="appointment-title">Đặt lịch khám</h2>
          <p className="appointment-description">
            Đặt lịch khám trực tuyến tại Eyespire giúp bạn tiết kiệm thời gian và được ưu tiên khám trước. Chúng tôi cam kết mang đến dịch vụ chăm sóc mắt chuyên nghiệp và tận tâm.
          </p>
          <div className="appointment-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Tiết kiệm thời gian</h4>
                <p>Không cần xếp hàng chờ đợi, ưu tiên khám theo giờ hẹn</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Bác sĩ chuyên khoa</h4>
                <p>Đội ngũ bác sĩ giàu kinh nghiệm, được đào tạo chuyên sâu</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Trang thiết bị hiện đại</h4>
                <p>Hệ thống máy móc nhập khẩu, công nghệ tiên tiến</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h4>Đặt cọc trực tuyến</h4>
                <p>Thanh toán đặt cọc an toàn qua PayOS, đảm bảo lịch hẹn</p>
              </div>
            </div>
          </div>
        </div>
        <div className="appointment-right">
          {!currentUser ? (
            <div className="auth-login-required">
              <div className="auth-login-icon">
                <FontAwesomeIcon icon={faLock} size="3x" />
              </div>
              <h3>Vui lòng đăng nhập để đặt lịch khám</h3>
              <p>Bạn cần đăng nhập với tài khoản bệnh nhân để có thể đặt lịch hẹn khám mắt.</p>
              <button 
                className="auth-login-button" 
                onClick={() => navigate('/login')}
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : !isPatient ? (
            <div className="auth-patient-only">
              <div className="auth-patient-icon">
                <FontAwesomeIcon icon={faCalendarAlt} size="3x" />
              </div>
              <h3>Chỉ bệnh nhân mới có thể đặt lịch</h3>
              <p>Tính năng đặt lịch khám chỉ dành cho tài khoản có vai trò bệnh nhân.</p>
            </div>
          ) : redirectToPayOS ? (
            <div className="redirect-payos">
              <div className="loading-spinner"></div>
              <h3>Đang chuyển hướng đến cổng thanh toán PayOS...</h3>
              <p>Vui lòng không đóng trình duyệt trong quá trình thanh toán.</p>
            </div>
          ) : (
            <form className="appointment-form" onSubmit={handleSubmit}>
              <div className="deposit-info">
                <div className="info-icon">ℹ</div>
                <p>Để đảm bảo lịch hẹn, bạn cần đặt cọc <strong>10.000 VND</strong> qua PayOS. Số tiền này sẽ được trừ vào hóa đơn dịch vụ sau khi khám.</p>
              </div>
              <div className="form-row">
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Họ và tên" 
                  className="form-input" 
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ email" 
                  className="form-input" 
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
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
                {errors.phone && <span className="error-message">{errors.phone}</span>}
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
                {errors.serviceId && <span className="error-message">{errors.serviceId}</span>}
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
                {errors.doctorId && <span className="error-message">{errors.doctorId}</span>}
                <input 
                  type="date" 
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  min={today}
                  className="form-input" 
                />
                {errors.appointmentDate && <span className="error-message">{errors.appointmentDate}</span>}
              </div>
              <div className="form-row">
                <select 
                  className="form-input"
                  name="hourSlot"
                  value={formData.hourSlot}
                  onChange={handleInputChange}
                  disabled={!formData.doctorId || !formData.appointmentDate || loading}
                >
                  {renderTimeSlots()}
                </select>
                {errors.hourSlot && <span className="error-message">{errors.hourSlot}</span>}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Thanh toán đặt cọc và đặt lịch"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointment;
