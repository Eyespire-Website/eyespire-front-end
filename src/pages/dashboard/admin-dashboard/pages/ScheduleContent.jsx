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
  Edit,
  Trash2,
  Search,
  X,
  User,
} from "lucide-react"

const ScheduleContent = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState("all")
  const [viewMode, setViewMode] = useState("week") // week, day
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showMoreModal, setShowMoreModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [moreAppointments, setMoreAppointments] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    duration: "60",
    patient: "",
    service: "",
    status: "pending",
    phone: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const doctors = [
    { id: "all", name: "Tất cả bác sĩ", color: "#3b82f6" },
    { id: "dr1", name: "BS. Nguyễn Văn An", color: "#10b981", specialty: "Bác sĩ thú y chính" },
    { id: "dr2", name: "BS. Trần Thị Bình", color: "#f59e0b", specialty: "Chuyên gia điều trị" },
    { id: "dr3", name: "BS. Lê Văn Cường", color: "#ef4444", specialty: "Bác sĩ phẫu thuật" },
    { id: "dr4", name: "BS. Phạm Thị D", color: "#8b5cf6", specialty: "Chuyên gia tư vấn" },
    { id: "dr5", name: "BS. Hoàng Văn E", color: "#ec4899", specialty: "Bác sĩ nội khoa" },
  ]

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00",
  ]

  // Giả lập API với 5 lịch hẹn trùng tại 09:00 ngày 2024-01-15
  useEffect(() => {
    setLoading(true)
    const initialData = [
      {
        id: "1",
        doctorId: "dr1",
        date: "2024-01-15",
        time: "09:00",
        duration: 60,
        patient: "Nguyễn Văn A",
        service: "Khám tổng quát",
        status: "confirmed",
        phone: "0901234567",
      },
      {
        id: "2",
        doctorId: "dr1",
        date: "2024-01-15",
        time: "10:30",
        duration: 90,
        patient: "Trần Thị B",
        service: "Điều trị bệnh",
        status: "confirmed",
        phone: "0912345678",
      },
      {
        id: "3",
        doctorId: "dr2",
        date: "2024-01-15",
        time: "09:00",
        duration: 60,
        patient: "Lê Văn C",
        service: "Tư vấn",
        status: "pending",
        phone: "0923456789",
      },
      {
        id: "4",
        doctorId: "dr3",
        date: "2024-01-15",
        time: "09:00",
        duration: 60,
        patient: "Phạm Thị D",
        service: "Phẫu thuật",
        status: "confirmed",
        phone: "0934567890",
      },
      {
        id: "5",
        doctorId: "dr4",
        date: "2024-01-15",
        time: "09:00",
        duration: 60,
        patient: "Hoàng Văn E",
        service: "Khám định kỳ",
        status: "completed",
        phone: "0945678901",
      },
      {
        id: "6",
        doctorId: "dr5",
        date: "2024-01-15",
        time: "09:00",
        duration: 60,
        patient: "Võ Thị F",
        service: "Tái khám",
        status: "confirmed",
        phone: "0956789012",
      },
      {
        id: "7",
        doctorId: "dr3",
        date: "2024-01-16",
        time: "08:00",
        duration: 120,
        patient: "Đặng Văn G",
        service: "Điều trị chuyên sâu",
        status: "pending",
        phone: "0967890123",
      },
    ]
    setTimeout(() => {
      setAppointments(initialData)
      setLoading(false)
    }, 500)
  }, [])

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
      const aptTime = apt.time
      const aptEndTime = addMinutesToTime(apt.time, parseInt(apt.duration))
      return (
          apt.date === dateStr &&
          time >= aptTime &&
          time < aptEndTime &&
          (selectedDoctor === "all" || apt.doctorId === selectedDoctor)
      )
    })
  }

  const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(":").map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`
  }

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const checkAppointmentOverlap = (newApt, isEditing = false) => {
    const newStart = timeToMinutes(newApt.time)
    const newEnd = newStart + parseInt(newApt.duration)
    return appointments.some((apt) => {
      if (isEditing && apt.id === newApt.id) return false
      if (apt.doctorId !== newApt.doctorId || apt.date !== newApt.date) return false
      const aptStart = timeToMinutes(apt.time)
      const aptEnd = aptStart + parseInt(apt.duration)
      return newStart < aptEnd && newEnd > aptStart
    })
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
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
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

  const validateField = (name, value, appointment) => {
    switch (name) {
      case "doctorId":
        return value ? null : "Vui lòng chọn bác sĩ"
      case "patient":
        return value.trim() ? null : "Tên bệnh nhân là bắt buộc"
      case "service":
        return value.trim() ? null : "Dịch vụ là bắt buộc"
      case "phone":
        return value.trim() && /^\d{10}$/.test(value.replace(/[^0-9]/g, ""))
            ? null
            : "Số điện thoại phải có 10 chữ số"
      case "duration":
        const duration = parseInt(value)
        return !isNaN(duration) && duration >= 15 && duration % 15 === 0
            ? null
            : "Thời gian phải từ 15 phút trở lên và là bội số của 15"
      case "time":
        return timeSlots.includes(value)
            ? null
            : "Giờ không hợp lệ, phải nằm trong khoảng 08:00 - 17:00"
      case "date":
        const appointmentDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return appointmentDate >= today ? null : "Không thể đặt lịch trong quá khứ"
      default:
        return null
    }
  }

  const validateForm = (appointment) => {
    const newErrors = {}
    Object.keys(appointment).forEach((key) => {
      if (key !== "id" && key !== "status") {
        const error = validateField(key, appointment[key], appointment)
        if (error) newErrors[key] = error
      }
    })

    if (!newErrors.time && !newErrors.duration) {
      const endTime = timeToMinutes(appointment.time) + parseInt(appointment.duration)
      if (endTime > timeToMinutes("17:30")) {
        newErrors.time = "Lịch hẹn không được kết thúc sau 17:30"
      }
    }

    if (!newErrors.date && !newErrors.time && !newErrors.doctorId && !newErrors.duration) {
      if (checkAppointmentOverlap(appointment, editMode)) {
        newErrors.time = "Lịch hẹn trùng với lịch khác của bác sĩ này"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddAppointment = () => {
    const now = new Date()
    const nextSlot = timeSlots.find(slot => timeToMinutes(slot) >= timeToMinutes(`${now.getHours()}:${now.getMinutes()}`)) || "08:00"
    setNewAppointment({
      id: "",
      doctorId: "",
      date: now.toISOString().split("T")[0],
      time: nextSlot,
      duration: "60",
      patient: "",
      service: "",
      status: "pending",
      phone: "",
    })
    setErrors({})
    setEditMode(false)
    setShowAddModal(true)
  }

  const handleEditAppointment = (appointment) => {
    setNewAppointment({ ...appointment, duration: appointment.duration.toString() })
    setErrors({})
    setEditMode(true)
    setShowAddModal(true)
  }

  const handleDeleteAppointment = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch hẹn này?")) return
    setLoading(true)
    setTimeout(() => {
      setAppointments(appointments.filter(apt => apt.id !== id))
      setLoading(false)
      toast.success("Xóa lịch hẹn thành công")
    }, 500)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAppointment(prev => ({
      ...prev,
      [name]: value,
    }))
    const error = validateField(name, value, { ...newAppointment, [name]: value })
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleInputBlur = () => {
    validateForm(newAppointment)
  }

  const handleSubmit = () => {
    if (!validateForm(newAppointment)) {
      toast.error("Vui lòng sửa các lỗi trong biểu mẫu")
      return
    }
    setLoading(true)
    setTimeout(() => {
      try {
        if (editMode) {
          setAppointments(appointments.map(apt =>
              apt.id === newAppointment.id ? { ...newAppointment, id: apt.id } : apt
          ))
          toast.success("Cập nhật lịch hẹn thành công")
        } else {
          const newId = Date.now().toString()
          setAppointments([...appointments, { ...newAppointment, id: newId }])
          toast.success("Thêm lịch hẹn thành công")
        }
        setShowAddModal(false)
        setErrors({})
      } catch (err) {
        toast.error("Lỗi khi lưu lịch hẹn")
      } finally {
        setLoading(false)
      }
    }, 500)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setNewAppointment({
      id: "",
      doctorId: "",
      date: new Date().toISOString().split("T")[0],
      time: "08:00",
      duration: "60",
      patient: "",
      service: "",
      status: "pending",
      phone: "",
    })
    setErrors({})
    setEditMode(false)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedAppointment(null)
  }

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed": return "Đã xác nhận"
      case "pending": return "Chờ xác nhận"
      case "completed": return "Hoàn thành"
      default: return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return <CheckCircle size={16} />
      case "pending": return <Clock size={16} />
      case "completed": return <CheckCircle size={16} />
      default: return null
    }
  }

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctor(prev => prev === doctorId ? "all" : doctorId)
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const MAX_VISIBLE_APPOINTMENTS = 1 // Giới hạn số khối hiển thị

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
                                            minWidth: '80px',
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
                                          minWidth: '50px',
                                          backgroundColor: '#e2e8f0',
                                          borderLeft: '4px solid #64748b',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontWeight: 600,
                                          color: '#1e293b',
                                          cursor: 'pointer',
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
                              {apt.time} - {addMinutesToTime(apt.time, parseInt(apt.duration))}
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
            <div className="stat-value">
              {appointments.filter(apt => apt.date === formatDate(new Date())).length}
            </div>
            <div className="stat-change positive">
              +{appointments.filter(apt => apt.date === formatDate(new Date())).length -
                appointments.filter(apt => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  return apt.date === formatDate(yesterday)
                }).length} từ hôm qua
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
                  <div className="action-buttons">
                    <button
                        className="action-btn create-btn"
                        onClick={handleAddAppointment}
                        disabled={loading}
                    >
                      <Calendar size={16} />
                      Tạo cuộc hẹn
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-content">
              {loading ? (
                  <div className="loading">Đang tải...</div>
              ) : (
                  viewMode === "week" ? renderWeekView() : renderDayView()
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <h3 className="card-title">Bác sĩ</h3>
            </div>
            <div className="card-content">
              <div className="search-box doctor-search-box" style={{ marginBottom: '16px' }}>
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
                    .filter(doctor => doctor.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((doctor) => (
                        <div
                            key={doctor.id}
                            className={`legend-item ${selectedDoctor === doctor.id ? 'active' : ''}`}
                            onClick={() => handleSelectDoctor(doctor.id)}
                        >
                          <div className="legend-color" style={{ backgroundColor: doctor.color }}></div>
                          <div className="legend-info">
                            <div className="legend-name">{doctor.name}</div>
                            {doctor.specialty && (
                                <div className="legend-specialty">{doctor.specialty}</div>
                            )}
                          </div>
                        </div>
                    ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal thêm/chỉnh sửa lịch hẹn */}
        {showAddModal && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editMode ? "Chỉnh sửa lịch hẹn" : "Thêm lịch hẹn mới"}</h3>
                  <button
                      className="modal-close"
                      onClick={handleCloseModal}
                      aria-label="Đóng modal"
                      disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Bác sĩ</label>
                        <select
                            className={`form-select ${errors.doctorId ? "form-input--error" : ""}`}
                            name="doctorId"
                            value={newAppointment.doctorId}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            disabled={loading}
                        >
                          <option value="">Chọn bác sĩ</option>
                          {doctors.filter(d => d.id !== "all").map(doctor => (
                              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                          ))}
                        </select>
                        {errors.doctorId && <span className="form-error-message">{errors.doctorId}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Ngày</label>
                        <input
                            type="date"
                            className={`form-input ${errors.date ? "form-input--error" : ""}`}
                            name="date"
                            value={newAppointment.date}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            disabled={loading}
                            min={new Date().toISOString().split("T")[0]}
                        />
                        {errors.date && <span className="form-error-message">{errors.date}</span>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Giờ</label>
                        <select
                            className={`form-select ${errors.time ? "form-input--error" : ""}`}
                            name="time"
                            value={newAppointment.time}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            disabled={loading}
                        >
                          {timeSlots.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                        {errors.time && <span className="form-error-message">{errors.time}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Thời gian (phút)</label>
                        <input
                            type="number"
                            className={`form-input ${errors.duration ? "form-input--error" : ""}`}
                            name="duration"
                            value={newAppointment.duration}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            min="15"
                            step="15"
                            disabled={loading}
                        />
                        {errors.duration && <span className="form-error-message">{errors.duration}</span>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bệnh nhân</label>
                      <input
                          type="text"
                          className={`form-input ${errors.patient ? "form-input--error" : ""}`}
                          name="patient"
                          value={newAppointment.patient}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          placeholder="Nhập tên bệnh nhân"
                          disabled={loading}
                      />
                      {errors.patient && <span className="form-error-message">{errors.patient}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dịch vụ</label>
                      <input
                          type="text"
                          className={`form-input ${errors.service ? "form-input--error" : ""}`}
                          name="service"
                          value={newAppointment.service}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          placeholder="Nhập dịch vụ"
                          disabled={loading}
                      />
                      {errors.service && <span className="form-error-message">{errors.service}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại</label>
                      <input
                          type="text"
                          className={`form-input ${errors.phone ? "form-input--error" : ""}`}
                          name="phone"
                          value={newAppointment.phone}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          placeholder="Nhập số điện thoại"
                          disabled={loading}
                      />
                      {errors.phone && <span className="form-error-message">{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Trạng thái</label>
                      <select
                          className="form-select"
                          name="status"
                          value={newAppointment.status}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          disabled={loading}
                      >
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="completed">Hoàn thành</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Modal xem chi tiết lịch hẹn */}
        {showViewModal && selectedAppointment && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Chi tiết lịch hẹn</h3>
                  <button
                      className="modal-close"
                      onClick={handleCloseViewModal}
                      aria-label="Đóng modal"
                      disabled={loading}
                  >
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
                        {selectedAppointment.time} - {addMinutesToTime(selectedAppointment.time, parseInt(selectedAppointment.duration))}
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
                  <button
                      className="btn btn-secondary"
                      onClick={handleCloseViewModal}
                      disabled={loading}
                  >
                    Đóng
                  </button>
                  <button
                      className="btn btn-primary"
                      onClick={() => {
                        handleEditAppointment(selectedAppointment)
                        setShowViewModal(false)
                      }}
                      disabled={loading}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleDeleteAppointment(selectedAppointment.id)
                        setShowViewModal(false)
                      }}
                      disabled={loading}
                  >
                    Xóa
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
                  <button
                      className="modal-close"
                      onClick={handleCloseMoreModal}
                      aria-label="Đóng modal"
                      disabled={loading}
                  >
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
                  <button
                      className="btn btn-secondary"
                      onClick={handleCloseMoreModal}
                      disabled={loading}
                  >
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