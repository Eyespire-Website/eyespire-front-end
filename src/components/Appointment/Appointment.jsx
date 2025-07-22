import React, { useState, useEffect } from "react";
import "./Appointment.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";
import paymentService from '../../services/paymentService';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCalendarAlt, faClock, faCheckCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

// Custom components for proper UTF-8 handling
const Input = ({ className = "", ...props }) => <input className={`form-input ${className}`} {...props} />;
const Textarea = ({ className = "", ...props }) => <textarea className={`form-textarea ${className}`} {...props} />;

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceId: "", // Keep empty to allow "not selected" option
    doctorId: "",
    appointmentDate: "",
    hourSlot: "",
    notes: ""
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Time slots from 8:00 to 16:00
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

  // Fetch doctors and services on component mount
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

    // Auto-fill user info if logged in
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    if (user && user.role && user.role.toLowerCase() === 'patient') {
      setIsPatient(true);
      // If patient, auto-fill personal info
      setFormData(prevState => ({
        ...prevState,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, []);

  // Fetch available time slots for doctor and date
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (formData.appointmentDate) {
        try {
          setLoading(true);
          let slots;

          if (formData.doctorId) {
            // If doctor selected, check availability for that specific doctor
            slots = await appointmentService.getAvailableTimeSlots(formData.doctorId, formData.appointmentDate);
          } else {
            // If no doctor selected, check global availability
            slots = await appointmentService.getAvailableTimeSlotsForDate(formData.appointmentDate);
          }

          // Kiểm tra nếu không có slot nào
          if (!slots || slots.length === 0) {
            toast.info("Không thể tải thông tin khung giờ. Vui lòng thử lại sau.");
            setAvailableTimeSlots([]);
          } else {
            // Debug: Log API response to understand structure
            console.log('=== API RESPONSE DEBUG ===');
            console.log('Doctor ID:', formData.doctorId);
            console.log('Date:', formData.appointmentDate);
            console.log('Slots received:', slots);
            
            // Log detailed slot structure
            if (slots && slots.length > 0) {
              console.log('=== DETAILED SLOT ANALYSIS ===');
              slots.forEach((slot, index) => {
                console.log(`Slot ${index + 1}:`, {
                  time: slot.time,
                  status: slot.status,
                  availableCount: slot.availableCount,
                  doctorId: slot.doctorId,
                  allFields: slot
                });
              });
              console.log('================================');
            }
            console.log('========================');
            
            // Hiển thị tất cả các slot, bất kể trạng thái
            setAvailableTimeSlots(slots);
            
            // Chỉ hiển thị thông báo nếu không có slot nào có trạng thái AVAILABLE
            if (!slots.some(slot => slot.status === "AVAILABLE")) {
              toast.info("Không có lịch khám trống trong ngày này. Các khung giờ hiển thị không thể đặt lịch.");
            }
          }
        } catch (error) {
          console.error("Lỗi khi lấy khung giờ trống:", error);
          toast.error("Không thể tải khung giờ trống. Vui lòng chọn ngày khác.");
          setAvailableTimeSlots([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTimeSlots();
  }, [formData.doctorId, formData.appointmentDate]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Debug UTF-8 encoding for text fields with Vietnamese characters
    if (name === 'notes') {
      console.log('[UTF-8 DEBUG] Homepage handleInputChange - notes value:', value);
      console.log('[UTF-8 DEBUG] Homepage handleInputChange - notes length:', value ? value.length : 0);
      if (value) {
        console.log('[UTF-8 DEBUG] Homepage handleInputChange - notes bytes:', new TextEncoder().encode(value));
      }
    }
    if (name === 'fullName') {
      console.log('[UTF-8 DEBUG] Homepage handleInputChange - fullName value:', value);
      console.log('[UTF-8 DEBUG] Homepage handleInputChange - fullName length:', value ? value.length : 0);
      if (value) {
        console.log('[UTF-8 DEBUG] Homepage handleInputChange - fullName bytes:', new TextEncoder().encode(value));
      }
    }
    
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

    // Validate required fields: name and phone (as specified in requirements)
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    // Validate email if provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate appointment date and time
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Vui lòng chọn ngày khám';
    } else {
      // Check if selected date is not in the past
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Không thể chọn ngày trong quá khứ';
      }
    }

    if (!formData.hourSlot) {
      newErrors.hourSlot = 'Vui lòng chọn giờ khám';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    
    // If there are validation errors, display them and prevent submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Show toast message for validation errors
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên và Số điện thoại)');
      
      // Scroll to first error field
      const firstErrorField = document.querySelector('.form-input.error, .error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    
    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };
  
  // Handle actual submission after confirmation
  const handleConfirmedSubmit = async () => {
    if (!agreedToTerms) {
      toast.error("Vui lòng đồng ý với điều khoản của công ty để tiếp tục.");
      return;
    }
    
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    try {
      // Debug UTF-8 encoding for Vietnamese characters
      console.log('[UTF-8 DEBUG] Frontend fullName:', formData.fullName);
      console.log('[UTF-8 DEBUG] Frontend fullName length:', formData.fullName ? formData.fullName.length : 0);
      if (formData.fullName) {
        console.log('[UTF-8 DEBUG] Frontend fullName bytes:', new TextEncoder().encode(formData.fullName));
      }
      
      console.log('[UTF-8 DEBUG] Frontend notes:', formData.notes);
      console.log('[UTF-8 DEBUG] Frontend notes length:', formData.notes ? formData.notes.length : 0);
      if (formData.notes) {
        console.log('[UTF-8 DEBUG] Frontend notes bytes:', new TextEncoder().encode(formData.notes));
      }
      
      // Prepare appointment data
      const appointmentData = {
        patientId: currentUser.id,
        doctorId: formData.doctorId || null,
        serviceId: formData.serviceId || "2", // Mặc định là service ID = 2 nếu không chọn
        appointmentDate: formData.appointmentDate,
        hourSlot: formData.hourSlot,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || "",
        userId: currentUser.id
      };

      // Create appointment and get payment URL
      const response = await paymentService.createPayOSDeposit(appointmentData);
      
      if (response && response.paymentUrl) {
        setPayosUrl(response.paymentUrl);
        setRedirectToPayOS(true);
        
        // Redirect to PayOS payment page
        window.location.href = response.paymentUrl;
      } else {
        toast.error("Không thể tạo link thanh toán. Vui lòng thử lại sau.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
      toast.error("Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.");
      setIsSubmitting(false);
    }
  };
  
  // Close confirmation modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setAgreedToTerms(false);
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (hourSlot) => {
    const hourString = hourSlot < 10 ? `0${hourSlot}:00` : `${hourSlot}:00`;
    
    // Debug logging
    const slotsForTime = availableTimeSlots.filter(slot => slot.time === hourString);
    console.log(`=== AVAILABILITY CHECK for ${hourString} ===`);
    console.log('Doctor selected:', formData.doctorId);
    console.log('Slots for this time:', slotsForTime);
    
    const result = availableTimeSlots.some(slot => {
      if (slot.time === hourString && slot.status === "AVAILABLE") {
        console.log('Found AVAILABLE slot:', slot);
        // Ràng buộc mới: Đảm bảo số bác sĩ available > số appointment đã đặt
        // Áp dụng cho cả 2 trường hợp: có chọn bác sĩ và không chọn bác sĩ
        return slot.availableCount > 0;
      }
      return false;
    });
    
    console.log('Final result:', result);
    console.log('=====================================');
    return result;
  };

  // Check if time slot is unavailable (not working or booked)
  const isTimeSlotUnavailable = (hourSlot) => {
    const hourString = hourSlot < 10 ? `0${hourSlot}:00` : `${hourSlot}:00`;
    return availableTimeSlots.some(slot => {
      return slot.time === hourString && (slot.status === "UNAVAILABLE" || slot.status === "BOOKED");
    });
  };

  // Get slot status for styling
  const getSlotStatus = (hourSlot) => {
    const hourString = hourSlot < 10 ? `0${hourSlot}:00` : `${hourSlot}:00`;
    const slot = availableTimeSlots.find(slot => slot.time === hourString);
    return slot ? slot.status : "UNKNOWN";
  };

  // Render time slot options
  const renderTimeSlots = () => {
    if (!formData.appointmentDate) {
      return (
          <div className="time-slot-container">
            <div className="time-slot-header">
              <div className="time-slot-title">
                <FontAwesomeIcon icon={faClock} />
                <span>Khung giờ khám</span>
              </div>
            </div>
            <div className="time-slot-message">Vui lòng chọn ngày khám</div>
          </div>
      );
    }

    if (loading) {
      return (
          <div className="time-slot-container">
            <div className="time-slot-header">
              <div className="time-slot-title">
                <FontAwesomeIcon icon={faClock} />
                <span>Khung giờ khám</span>
              </div>
            </div>
            <div className="time-slot-message">Đang tải khung giờ...</div>
          </div>
      );
    }

    if (availableTimeSlots.length === 0) {
      return (
          <div className="time-slot-container">
            <div className="time-slot-header">
              <div className="time-slot-title">
                <FontAwesomeIcon icon={faClock} />
                <span>Khung giờ khám</span>
              </div>
            </div>
            <div className="time-slot-message">Không có khung giờ trống</div>
          </div>
      );
    }

    const availableCount = availableTimeSlots.filter(slot => slot.status === "AVAILABLE").length;

    return (
        <div className="time-slot-container">
          <div className="time-slot-header">
            <div className="time-slot-title">
              <FontAwesomeIcon icon={faClock} />
              <span>Chọn giờ khám</span>
            </div>
            <div className="time-slot-count">{availableCount} khung giờ trống</div>
          </div>
          <div className="time-slot-grid">
            {allTimeSlots.map(slot => {
              const isAvailable = isTimeSlotAvailable(slot.value);
              const isUnavailable = isTimeSlotUnavailable(slot.value);
              const slotStatus = getSlotStatus(slot.value);
              const isSelected = formData.hourSlot === slot.value.toString();

              return (
                  <div
                      key={slot.value}
                      className={`time-slot-item ${isSelected ? 'selected' : ''} ${isAvailable ? "available" : ""} ${isUnavailable ? "unavailable" : ""} ${slotStatus.toLowerCase()}`}
                      onClick={() => {
                        if (isAvailable) {
                          setFormData({
                            ...formData,
                            hourSlot: slot.value.toString()
                          });

                          // Clear error when user selects
                          if (errors.hourSlot) {
                            setErrors({
                              ...errors,
                              hourSlot: ''
                            });
                          }
                        }
                      }}
                  >
                    {slot.label}
                    {isSelected && <FontAwesomeIcon icon={faCheckCircle} style={{ marginLeft: '5px' }} />}
                    {isUnavailable && <div className="unavailable-text">
                      {slotStatus === "BOOKED" ? "Đã đặt" : "Không khả dụng"}
                    </div>}
                  </div>
              );
            })}
          </div>
        </div>
    );
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
      <div className="appointment-container" id="appointment-section">
        <ToastContainer position="top-right" autoClose={5000} />

        {/* Modal xác nhận thanh toán */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <div className="confirm-modal-header">
                <h3>Xác nhận thanh toán</h3>
                <button className="close-button" onClick={closeConfirmModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="confirm-modal-content">
                <p>Quý khách vui lòng tham khảo trước các <a href="#" onClick={(e) => e.preventDefault()}>điều khoản của công ty</a>.</p>
                
                <ol className="terms-list">
                  <li>
                    <strong>Đặt lịch:</strong> Khách hàng có thể đặt lịch hẹn thông qua website.
                  </li>
                  <li>
                    <strong>Hủy lịch hẹn:</strong> Việc hủy hoặc thay đổi lịch hẹn phải được thực hiện ít nhất 1 ngày trước ngày hẹn.
                  </li>
                  <li>
                    <strong>Chính sách hoàn tiền:</strong>
                    <ul>
                      <li><strong>Hủy lịch trước 24 giờ kể từ lịch hẹn:</strong> Hoàn tiền 100%.</li>
                      <li><strong>Hủy lịch ít hơn 24 giờ kể từ lịch hẹn:</strong> Không hoàn tiền.</li>
                      <li><strong>Không đến mà không báo trước:</strong> Không hoàn tiền.</li>
                    </ul>
                  </li>
                </ol>
                
                <div className="terms-agreement">
                  <input 
                    type="checkbox" 
                    id="agree-terms" 
                    checked={agreedToTerms}
                    onChange={() => setAgreedToTerms(!agreedToTerms)}
                  />
                  <label htmlFor="agree-terms">Tôi đã đọc và đồng ý với điều khoản của công ty</label>
                </div>
              </div>
              
              <div className="confirm-modal-footer">
                <button className="cancel-button" onClick={closeConfirmModal}>Thoát</button>
                <button 
                  className={`confirm-button ${!agreedToTerms ? 'disabled' : ''}`}
                  onClick={handleConfirmedSubmit}
                  disabled={!agreedToTerms}
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <div className="form-field">
                      <Input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Họ và tên *"
                          className={errors.fullName ? 'error' : ''}
                          required
                      />
                      {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>
                    <div className="form-field">
                      <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Địa chỉ email"
                          className={`form-input ${errors.email ? 'error' : ''}`}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Số điện thoại *"
                          className={`form-input ${errors.phone ? 'error' : ''}`}
                          required
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                    <div className="form-field">
                      <select
                          className={`form-input ${errors.serviceId ? 'error' : ''}`}
                          name="serviceId"
                          value={formData.serviceId}
                          onChange={handleInputChange}
                      >
                        <option value="">Chọn dịch vụ (không bắt buộc)</option>
                        {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                        ))}
                      </select>
                      {errors.serviceId && <span className="error-message">{errors.serviceId}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <select
                          className={`form-input ${errors.doctorId ? 'error' : ''}`}
                          name="doctorId"
                          value={formData.doctorId}
                          onChange={handleInputChange}
                      >
                        <option value="">Chọn bác sĩ (không bắt buộc)</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                              BS. {doctor.name} - {doctor.specialization}
                            </option>
                        ))}
                      </select>
                      {errors.doctorId && <span className="error-message">{errors.doctorId}</span>}
                    </div>
                    <div className="form-field">
                      <input
                          type="date"
                          name="appointmentDate"
                          value={formData.appointmentDate}
                          onChange={handleInputChange}
                          min={today}
                          className={`form-input ${errors.appointmentDate ? 'error' : ''}`}
                          required
                      />
                      {errors.appointmentDate && <span className="error-message">{errors.appointmentDate}</span>}
                    </div>
                  </div>
                  {renderTimeSlots()}
                  {errors.hourSlot && <span className="error-message">{errors.hourSlot}</span>}
                  <Textarea
                      placeholder="Thông tin bổ sung"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                  />
                  <button
                      type="submit"
                      className="appointment-button"
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Thanh toán đặt cọc và đặt lịch"}
                  </button>
                  <div className="info-note">
                    <div className="info-icon">ℹ</div>
                    <p>
                      <strong>Lưu ý:</strong> Nếu không chọn bác sĩ, lễ tân sẽ chỉ định bác sĩ phù hợp cho bạn.
                      Nếu không chọn dịch vụ, mặc định sẽ là Khám tổng quát, và bác sĩ sẽ tư vấn thêm khi khám.
                    </p>
                  </div>
                </form>
            )}
          </div>
        </div>
      </div>
  );
};

export default Appointment;