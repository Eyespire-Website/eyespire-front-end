"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import {
  Stethoscope,
  Calendar,
  Clock,
  ClockIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Phone,
  Search,
  X,
  User,
} from "lucide-react"
import adminService from "../../../../services/adminService"

const ScheduleContent = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState("all")
  const [viewMode, setViewMode] = useState("week") // week, day
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [showViewModal, setShowViewModal] = useState(false)
  const [showMoreModal, setShowMoreModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [moreAppointments, setMoreAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadAppointments()
      loadAvailabilities()
    }
  }, [selectedDate, selectedDoctor])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const doctorsData = await adminService.getAllDoctors()
      console.log("Doctors data from API:", doctorsData)

      const processedDoctors = [
        { id: "all", name: "Tất cả bác sĩ", color: "#3b82f6" },
        ...doctorsData.map((doctor) => ({
          ...doctor,
          color: getRandomColor(),
          specialty: doctor.specialization,
        })),
      ]

      console.log("Processed doctors:", processedDoctors)
      setDoctors(processedDoctors)
    } catch (err) {
      console.error("Error loading doctors:", err)
      setError("Lỗi khi tải dữ liệu ban đầu")
      toast.error("Lỗi khi tải dữ liệu ban đầu")
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const appointmentsData = await adminService.getAppointmentsByDate(selectedDate)

      console.log("Raw appointments data:", appointmentsData)

      // Normalize dữ liệu appointments với field names chính xác từ API
      const normalizedAppointments = appointmentsData.map((apt, index) => {
        console.log(`Processing appointment ${index}:`, JSON.stringify(apt, null, 2))

        return {
          id: apt.id || index + 1,
          time: apt.timeSlot || "09:00", // API sử dụng timeSlot
          date: apt.appointmentDate || new Date().toISOString().split("T")[0], // API sử dụng appointmentDate
          duration: "60", // Default duration vì API không có field này
          doctorId: apt.doctorId || 1,
          patient: apt.patientName || apt.patient?.name || "Bệnh nhân", // API sử dụng patientName
          service: apt.service || "Khám tổng quát", // Sử dụng service field từ API
          status: apt.status?.toLowerCase() || "pending", // Convert status to lowercase
          phone: apt.patientPhone || apt.patient?.phone || "0123456789", // API sử dụng patientPhone
        }
      })

      console.log("Normalized appointments:", normalizedAppointments)
      setAppointments(normalizedAppointments)
    } catch (err) {
      console.error("Error loading appointments:", err)
      toast.error("Lỗi khi tải danh sách cuộc hẹn")
      setAppointments([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const loadAvailabilities = async () => {
    try {
      if (selectedDoctor && selectedDoctor !== "all") {
        const availabilityData = await adminService.getAvailableTimeSlots(selectedDoctor, selectedDate)
        setAvailabilities(availabilityData)
      }
    } catch (err) {
      toast.error("Lỗi khi tải lịch làm việc")
    }
  }

  const getRandomColor = () => {
    const colors = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const getWeekDays = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const getAppointmentsForDateTime = (date, time) => {
    if (!date) return []
    const dateStr = formatDate(date)

    return appointments.filter((apt) => {
      // Kiểm tra các thuộc tính bắt buộc của appointment
      if (!apt || !apt.time || !apt.date || !apt.duration) {
        console.warn("Invalid appointment object:", apt)
        return false
      }

      const aptTime = apt.time
      const duration = typeof apt.duration === "string" ? Number.parseInt(apt.duration) : apt.duration

      // Kiểm tra duration hợp lệ
      if (isNaN(duration) || duration <= 0) {
        console.warn("Invalid duration for appointment:", apt)
        return false
      }

      const aptEndTime = addMinutesToTime(aptTime, duration)

      return (
          apt.date === dateStr &&
          time >= aptTime &&
          time < aptEndTime &&
          (selectedDoctor === "all" || apt.doctorId === selectedDoctor)
      )
    })
  }

  const addMinutesToTime = (time, minutes) => {
    // Kiểm tra nếu time là undefined, null hoặc không phải string
    if (!time || typeof time !== "string") {
      console.warn("Invalid time provided to addMinutesToTime:", time)
      return "00:00"
    }

    // Kiểm tra nếu minutes không phải số
    if (isNaN(minutes) || minutes === null || minutes === undefined) {
      console.warn("Invalid minutes provided to addMinutesToTime:", minutes)
      minutes = 0
    }

    const timeParts = time.split(":")
    if (timeParts.length !== 2) {
      console.warn("Invalid time format:", time)
      return "00:00"
    }

    const [hours, mins] = timeParts.map(Number)

    // Kiểm tra nếu hours hoặc mins không phải số hợp lệ
    if (isNaN(hours) || isNaN(mins)) {
      console.warn("Invalid time components:", { hours, mins })
      return "00:00"
    }

    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`
  }

  const timeToMinutes = (time) => {
    // Kiểm tra nếu time là undefined, null hoặc không phải string
    if (!time || typeof time !== "string") {
      console.warn("Invalid time provided to timeToMinutes:", time)
      return 0
    }

    const timeParts = time.split(":")
    if (timeParts.length !== 2) {
      console.warn("Invalid time format:", time)
      return 0
    }

    const [hours, minutes] = timeParts.map(Number)

    // Kiểm tra nếu hours hoặc minutes không phải số hợp lệ
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn("Invalid time components:", { hours, minutes })
      return 0
    }

    return hours * 60 + minutes
  }

  const getDoctorColor = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    return doctor ? doctor.color : "#64748b"
  }

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    return doctor ? doctor.name : "Unknown"
  }

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

  const navigateWeek = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + direction * 7)
      return newDate
    })
  }

  const navigateDay = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + direction)
      return newDate
    })
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getWeekRange = () => {
    const weekDays = getWeekDays(currentDate)
    const start = weekDays[0]
    const end = weekDays[6]
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`
  }

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value)
    setSelectedDate(e.target.value)
    setCurrentDate(newDate)
  }

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowViewModal(true)
  }

  const handleShowMoreAppointments = (appointments) => {
    setMoreAppointments(appointments)
    setShowMoreModal(true)
  }

  const handleCloseMoreModal = () => {
    setShowMoreModal(false)
    setMoreAppointments([])
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedAppointment(null)
  }

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ xác nhận"
      case "completed":
        return "Hoàn thành"
      case "canceled":
        return "Đã hủy"
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle size={16} />
      case "pending":
        return <Clock size={16} />
      case "completed":
        return <CheckCircle size={16} />
      case "canceled":
        return <X size={16} />
      default:
        return null
    }
  }

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctor((prev) => (prev === doctorId ? "all" : doctorId))
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const MAX_VISIBLE_APPOINTMENTS = 1

    return (
        <div className="week-view">
          <div className="week-header">
            <div className="time-column-header">Giờ</div>
            {weekDays.map((day, index) => (
                <div key={index} className={`day-header ${isToday(day) ? "today" : ""}`}>
                  <div className="day-name">{dayNames[index]}</div>
                  <div className="day-date">
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                </div>
            ))}
          </div>
          <div className="week-body">
            {timeSlots.map((time) => (
                <div key={time} className="time-row">
                  <div className="time-label">{time}</div>
                  {weekDays.map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDateTime(day, time)
                    const visibleAppointments = dayAppointments.slice(0, MAX_VISIBLE_APPOINTMENTS)
                    const hiddenAppointments = dayAppointments.slice(MAX_VISIBLE_APPOINTMENTS)

                    return (
                        <div key={dayIndex} className="time-cell">
                          {dayAppointments.length > 0 && (
                              <div className="appointment-group">
                                {visibleAppointments.map((apt) => {
                                  const doctor = doctors.find((d) => d.id === apt.doctorId)
                                  return (
                                      <div
                                          key={apt.id}
                                          className={`appointment-block ${apt.status}`}
                                          style={{
                                            backgroundColor: doctor?.color + "20",
                                            borderLeft: `4px solid ${doctor?.color}`,
                                            height: `${apt.duration}px`,
                                            flex: `1 1 ${100 / Math.min(dayAppointments.length, MAX_VISIBLE_APPOINTMENTS)}%`,
                                            minWidth: "80px",
                                          }}
                                          onClick={() => handleViewAppointment(apt)}
                                          title={`${doctor?.name}: ${apt.patient} - ${apt.service}`}
                                      >
                                        <div className="apt-time">{apt.time}</div>
                                        <div className="apt-patient">{apt.patient}</div>
                                        <div className="apt-doctor">{doctor?.name}</div>
                                      </div>
                                  )
                                })}
                                {hiddenAppointments.length > 0 && (
                                    <div
                                        className="appointment-block more"
                                        style={{
                                          height: `${visibleAppointments[0]?.duration || 60}px`,
                                          flex: `1 1 ${100 / Math.min(dayAppointments.length, MAX_VISIBLE_APPOINTMENTS)}%`,
                                          minWidth: "50px",
                                          backgroundColor: "#e2e8f0",
                                          borderLeft: "4px solid #64748b",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontWeight: 600,
                                          color: "#1e293b",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => handleShowMoreAppointments(dayAppointments)}
                                    >
                                      +{hiddenAppointments.length}
                                    </div>
                                )}
                              </div>
                          )}
                        </div>
                    )
                  })}
                </div>
            ))}
          </div>
        </div>
    )
  }

  const renderDayView = () => {
    const dayAppointments = appointments
        .filter(
            (apt) => apt.date === formatDate(currentDate) && (selectedDoctor === "all" || apt.doctorId === selectedDoctor),
        )
        .sort((a, b) => a.time.localeCompare(b.time))

    return (
        <div className="day-view">
          <div className="day-header-single">
            <h3>
              {dayNames[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]} - {currentDate.getDate()}/
              {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
            </h3>
          </div>
          <div className="day-schedule">
            {timeSlots.map((time) => {
              const timeAppointments = dayAppointments.filter((apt) => apt.time === time)
              return (
                  <div key={time} className="day-time-slot">
                    <div className="day-time-label">{time}</div>
                    <div className="day-time-content">
                      {timeAppointments.length > 0 ? (
                          timeAppointments.map((apt) => {
                            const doctor = doctors.find((d) => d.id === apt.doctorId)
                            return (
                                <div
                                    key={apt.id}
                                    className={`day-appointment ${apt.status}`}
                                    style={{ borderLeft: `4px solid ${doctor?.color}` }}
                                    onClick={() => handleViewAppointment(apt)}
                                >
                                  <div className="day-apt-header">
                            <span className="day-apt-time">
                              {apt.time} - {addMinutesToTime(apt.time, Number.parseInt(apt.duration))}
                            </span>
                                    <span className={`day-apt-status ${apt.status}`}>
                              {getStatusIcon(apt.status)}
                                      {getStatusText(apt.status)}
                            </span>
                                  </div>
                                  <div className="day-apt-patient">{apt.patient}</div>
                                  <div className="day-apt-service">{apt.service}</div>
                                  <div className="day-apt-doctor" style={{ color: doctor?.color }}>
                                    {doctor?.name}
                                  </div>
                                  <div className="day-apt-phone">
                                    <Phone size={14} /> {apt.phone}
                                  </div>
                                </div>
                            )
                          })
                      ) : (
                          <div className="empty-slot">Trống</div>
                      )}
                    </div>
                  </div>
              )
            })}
          </div>
        </div>
    )
  }

  if (error) return <div className="error-message">{error}</div>

  return (
      <div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Tổng bác sĩ</span>
              <Stethoscope size={24} className="stat-icon" />
            </div>
            <div className="stat-value">{doctors.length - 1}</div>
            <div className="stat-change positive">Đang hoạt động</div>
          </div>
          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Lịch hẹn hôm nay</span>
              <Calendar size={24} className="stat-icon" />
            </div>
            <div className="stat-value">{appointments.filter((apt) => apt.date === formatDate(new Date())).length}</div>
            <div className="stat-change positive">
              +
              {appointments.filter((apt) => apt.date === formatDate(new Date())).length -
                  appointments.filter((apt) => {
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    return apt.date === formatDate(yesterday)
                  }).length}{" "}
              từ hôm qua
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Giờ làm việc</span>
              <Clock size={24} className="stat-icon" />
            </div>
            <div className="stat-value">9h</div>
            <div className="stat-change">08:00 - 17:00</div>
          </div>
          <div className="stat-card">
            <div className="stat-hdr">
              <span className="stat-title">Slot</span>
              <ClockIcon size={24} className="stat-icon" />
            </div>
            <div className="stat-value">{timeSlots.length}</div>
            <div className="stat-change">Slot/ngày</div>
          </div>
        </div>

        <div className="schedule-container">
          <div className="card">
            <div className="card-hdr">
              <div className="schedule-controls">
                <div className="view-controls">
                  <button
                      className={`btn ${viewMode === "day" ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setViewMode("day")}
                      disabled={loading}
                  >
                    Ngày
                  </button>
                  <button
                      className={`btn ${viewMode === "week" ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setViewMode("week")}
                      disabled={loading}
                  >
                    Tuần
                  </button>
                </div>
                <div className="date-navigation">
                  <button
                      className="btn btn-secondary"
                      onClick={() => (viewMode === "week" ? navigateWeek(-1) : navigateDay(-1))}
                      disabled={loading}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="date-picker-container">
                    <input
                        type="date"
                        className="date-picker"
                        value={selectedDate}
                        onChange={handleDateChange}
                        disabled={loading}
                    />
                    <span className="current-period">
                    {viewMode === "week"
                        ? getWeekRange()
                        : `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`}
                  </span>
                  </div>
                  <button
                      className="btn btn-secondary"
                      onClick={() => (viewMode === "week" ? navigateWeek(1) : navigateDay(1))}
                      disabled={loading}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              {loading ? (
                  <div className="loading">Đang tải...</div>
              ) : viewMode === "week" ? (
                  renderWeekView()
              ) : (
                  renderDayView()
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <h3 className="card-title">Bác sĩ</h3>
            </div>
            <div className="card-content">
              <div className="search-box doctor-search-box" style={{ marginBottom: "16px" }}>
                <Search size={16} className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm bác sĩ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                />
              </div>
              <div className="doctor-legend">
                {doctors
                    .filter((doctor) => doctor.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((doctor) => (
                        <div
                            key={doctor.id}
                            className={`legend-item ${selectedDoctor === doctor.id ? "active" : ""}`}
                            onClick={() => handleSelectDoctor(doctor.id)}
                        >
                          <div className="legend-color" style={{ backgroundColor: doctor.color }}></div>
                          <div className="legend-info">
                            <div className="legend-name">{doctor.name}</div>
                            {doctor.specialty && <div className="legend-specialty">{doctor.specialty}</div>}
                          </div>
                        </div>
                    ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal xem chi tiết lịch hẹn */}
        {showViewModal && selectedAppointment && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Xem chi tiết lịch hẹn</h3>
                  <button className="modal-close" onClick={handleCloseViewModal} aria-label="Đóng modal" disabled={loading}>
                    <X size={18} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form">
                    <div className="admin-detail-section">
                      <h4 className="admin-detail-section-title">
                        <User size={18} /> Thông tin lịch hẹn
                      </h4>
                      <div className="admin-detail-grid">
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Bác sĩ:</span>
                          <span className="admin-detail-value">{getDoctorName(selectedAppointment.doctorId)}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Ngày:</span>
                          <span className="admin-detail-value">{selectedAppointment.date}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Giờ:</span>
                          <span className="admin-detail-value">
                        {selectedAppointment.time} -{" "}
                            {addMinutesToTime(selectedAppointment.time, Number.parseInt(selectedAppointment.duration))}
                      </span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Thời gian:</span>
                          <span className="admin-detail-value">{selectedAppointment.duration} phút</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Bệnh nhân:</span>
                          <span className="admin-detail-value">{selectedAppointment.patient}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Dịch vụ:</span>
                          <span className="admin-detail-value">{selectedAppointment.service}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Số điện thoại:</span>
                          <span className="admin-detail-value">{selectedAppointment.phone}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Trạng thái:</span>
                          <span className={`status ${selectedAppointment.status}`}>
                        {getStatusIcon(selectedAppointment.status)}
                            {getStatusText(selectedAppointment.status)}
                      </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseViewModal} disabled={loading}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Modal xem danh sách lịch hẹn trùng */}
        {showMoreModal && moreAppointments.length > 0 && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Danh sách lịch hẹn</h3>
                  <button className="modal-close" onClick={handleCloseMoreModal} aria-label="Đóng modal" disabled={loading}>
                    <X size={18} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="appointment-list">
                    {moreAppointments.map((apt) => {
                      const doctor = doctors.find((d) => d.id === apt.doctorId)
                      return (
                          <div
                              key={apt.id}
                              className={`appointment-item ${apt.status}`}
                              style={{ borderLeft: `4px solid ${doctor?.color}` }}
                              onClick={() => {
                                handleViewAppointment(apt)
                                setShowMoreModal(false)
                              }}
                          >
                            <div className="apt-header">
                              <span className="apt-time">{apt.time}</span>
                              <span className={`apt-status ${apt.status}`}>
                          {getStatusIcon(apt.status)}
                                {getStatusText(apt.status)}
                        </span>
                            </div>
                            <div className="apt-patient">{apt.patient}</div>
                            <div className="apt-service">{apt.service}</div>
                            <div className="apt-doctor" style={{ color: doctor?.color }}>
                              {doctor?.name}
                            </div>
                          </div>
                      )
                    })}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseMoreModal} disabled={loading}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export default ScheduleContent
