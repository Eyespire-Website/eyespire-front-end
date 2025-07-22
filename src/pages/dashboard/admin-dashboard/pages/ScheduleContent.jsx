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
import userService from "../../../../services/userService"
import "../styles/ScheduleModal.css"

const ScheduleContent = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState("all")
  const [viewMode, setViewMode] = useState("week") // week, day
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availabilities, setAvailabilities] = useState([])

  // Thay thế các state modal riêng biệt bằng state chung
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null) // 'viewAppointment', 'moreAppointments', 'availability'

  // Giữ lại các state dữ liệu
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [moreAppointments, setMoreAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State cho chuyển trang
  const [currentPage, setCurrentPage] = useState("doctors") // "doctors" hoặc "schedule"

  // State cho quản lý lịch làm việc bác sĩ
  const [availabilityMode, setAvailabilityMode] = useState("add") // add, edit
  const [selectedAvailability, setSelectedAvailability] = useState(null)
  const [showAvailabilityTab, setShowAvailabilityTab] = useState(false)

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

  // Hàm xử lý URL avatar
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

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadAppointments()
      loadAvailabilities()
    }
  }, [selectedDate, selectedDoctor, viewMode])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const doctorsData = await adminService.getAllDoctors()
      console.log("Doctors data from API:", doctorsData)

      // Lấy thông tin user đầy đủ cho từng bác sĩ
      const doctorsWithUserInfo = await Promise.all(
        doctorsData.map(async (doctor) => {
          try {
            // Lấy thông tin user từ userId bằng cách gọi API trực tiếp
            const userResponse = await fetch(`http://localhost:8080/api/users/${doctor.userId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            })
            
            if (userResponse.ok) {
              const userData = await userResponse.json()
              return {
                ...doctor,
                color: getRandomColor(),
                specialty: doctor.specialization,
                // Thêm thông tin user
                email: userData.email,
                phone: userData.phone,
                gender: userData.gender,
                avatarUrl: userData.avatarUrl,
                address: userData.addressDetail,
                dateOfBirth: userData.dateOfBirth
              }
            } else {
              console.warn(`Could not fetch user info for doctor ${doctor.id}:`, userResponse.status)
              return {
                ...doctor,
                color: getRandomColor(),
                specialty: doctor.specialization,
                email: null,
                phone: null,
                gender: null,
                avatarUrl: null
              }
            }
          } catch (error) {
            console.error(`Error fetching user info for doctor ${doctor.id}:`, error)
            return {
              ...doctor,
              color: getRandomColor(),
              specialty: doctor.specialization,
              email: null,
              phone: null,
              gender: null,
              avatarUrl: null
            }
          }
        })
      )

      const processedDoctors = [
        { id: "all", name: "Tất cả bác sĩ", color: "#3b82f6" },
        ...doctorsWithUserInfo,
      ]

      console.log("Processed doctors with user info:", processedDoctors)
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
      let appointmentsData = []

      if (viewMode === "week") {
        // Tải dữ liệu cho cả tuần
        const weekDays = getWeekDays(currentDate)
        const promises = weekDays.map(day => {
          const formattedDate = formatDate(day)
          return adminService.getAppointmentsByDate(formattedDate)
        })

        try {
          const results = await Promise.all(promises)
          appointmentsData = results.flat() // Gộp tất cả kết quả từ các ngày
        } catch (error) {
          console.error("Error loading week appointments:", error)
          // Nếu có lỗi khi tải dữ liệu cho tuần, thử tải cho ngày hiện tại
          appointmentsData = await adminService.getAppointmentsByDate(selectedDate)
        }
      } else {
        // Tải dữ liệu cho một ngày
        appointmentsData = await adminService.getAppointmentsByDate(selectedDate)
      }

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
      setLoading(true)
      let availabilityData = []

      if (viewMode === "week") {
        // Tải dữ liệu cho cả tuần
        const weekDays = getWeekDays(currentDate)
        const promises = weekDays.map(day => {
          const formattedDate = formatDate(day)
          if (selectedDoctor && selectedDoctor !== "all") {
            // Lấy lịch làm việc của bác sĩ cụ thể cho từng ngày trong tuần
            return adminService.getDoctorAvailability(selectedDoctor, formattedDate)
          } else {
            // Lấy tất cả lịch làm việc cho từng ngày trong tuần
            return adminService.getAvailabilitiesByDate(formattedDate)
          }
        })

        try {
          const results = await Promise.all(promises)
          availabilityData = results.flat() // Gộp tất cả kết quả từ các ngày
        } catch (error) {
          console.error("Error loading week availabilities:", error)
          // Nếu có lỗi khi tải dữ liệu cho tuần, thử tải cho ngày hiện tại
          if (selectedDoctor && selectedDoctor !== "all") {
            availabilityData = await adminService.getDoctorAvailability(selectedDoctor, selectedDate)
          } else {
            availabilityData = await adminService.getAvailabilitiesByDate(selectedDate)
          }
        }
      } else {
        // Chế độ xem ngày - tải dữ liệu cho ngày được chọn
        if (selectedDoctor && selectedDoctor !== "all") {
          // Lấy lịch làm việc của bác sĩ cụ thể
          availabilityData = await adminService.getDoctorAvailability(selectedDoctor, selectedDate)
        } else {
          // Lấy tất cả lịch làm việc theo ngày
          availabilityData = await adminService.getAvailabilitiesByDate(selectedDate)
        }
      }

      console.log("Availabilities data:", availabilityData)
      setAvailabilities(availabilityData)
    } catch (err) {
      console.error("Error loading availabilities:", err)
      toast.error("Lỗi khi tải lịch làm việc")
      setAvailabilities([]) // Set empty array on error
    } finally {
      setLoading(false)
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

  // Hàm định dạng thởi gian để đảm bảo định dạng HH:MM
  const formatTimeString = (timeStr) => {
    if (!timeStr) return ""

    // Nếu đã đúng định dạng HH:MM thì trả về luôn
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
      return timeStr
    }

    try {
      // Nếu là đối tượng Date
      if (timeStr instanceof Date) {
        return `${String(timeStr.getHours()).padStart(2, '0')}:${String(timeStr.getMinutes()).padStart(2, '0')}`
      }

      // Nếu là chuỗi có định dạng khác, cố gắng chuyển đổi
      if (typeof timeStr === 'string') {
        // Loại bỏ các ký tự không phải số và dấu hai chấm
        const cleanedTime = timeStr.replace(/[^0-9:]/g, '')

        // Tách giờ và phút
        const parts = cleanedTime.split(':')
        if (parts.length >= 2) {
          const hours = parseInt(parts[0], 10)
          const minutes = parseInt(parts[1], 10)

          if (!isNaN(hours) && !isNaN(minutes)) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
          }
        }
      }

      // Nếu không xử lý được, trả về chuỗi gốc
      return timeStr
    } catch (error) {
      console.error("Error formatting time:", error)
      return timeStr
    }
  }

  // Hàm định dạng ngày tháng để đảm bảo định dạng YYYY-MM-DD
  const formatDateString = (dateStr) => {
    if (!dateStr) return ""

    // Nếu đã đúng định dạng YYYY-MM-DD thì trả về luôn
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr
    }

    try {
      // Nếu là đối tượng Date
      if (dateStr instanceof Date) {
        return `${dateStr.getFullYear()}-${String(dateStr.getMonth() + 1).padStart(2, '0')}-${String(dateStr.getDate()).padStart(2, '0')}`
      }

      // Nếu là chuỗi có định dạng khác, cố gắng chuyển đổi
      if (typeof dateStr === 'string') {
        // Loại bỏ các ký tự không phải số và dấu gạch ngang
        const cleanedDate = dateStr.replace(/[^0-9-]/g, '')

        // Tách năm, tháng và ngày
        const parts = cleanedDate.split('-')
        if (parts.length >= 3) {
          const year = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10)
          const day = parseInt(parts[2], 10)

          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          }
        }
      }

      // Nếu không xử lý được, trả về chuỗi gốc
      return dateStr
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateStr
    }
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

      // Cập nhật selectedDate để kích hoạt useEffect tải dữ liệu mới
      const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`
      setSelectedDate(formattedDate)

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
    setModalType("viewAppointment")
    setModalOpen(true)
  }

  const handleShowMoreAppointments = (appointments) => {
    setMoreAppointments(appointments)
    setModalType("moreAppointments")
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    // Đặt timeout để tránh hiệu ứng nhấp nháy khi đóng modal
    setTimeout(() => {
      setModalType(null)
      // Reset các state dữ liệu nếu cần
      if (modalType === "viewAppointment") {
        setSelectedAppointment(null)
      } else if (modalType === "moreAppointments") {
        setMoreAppointments([])
      } else if (modalType === "availability") {
        setSelectedAvailability(null)
      }
    }, 200)
  }

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctor(doctorId)
    if (doctorId !== "all") {
      setCurrentPage("schedule")
    }
  }

  const handleBackToDoctorsList = () => {
    setCurrentPage("doctors")
  }

  // Hàm mở modal thêm lịch làm việc mới
  const handleAddAvailability = () => {
    setAvailabilityMode("add")
    setSelectedAvailability({
      doctorId: selectedDoctor !== "all" ? selectedDoctor : "",
      date: selectedDate,
      startTime: "08:00",
      endTime: "17:00",
      status: "AVAILABLE",
      notes: ""
    })
    setModalType("availability")
    setModalOpen(true)
  }

  // Hàm mở modal chỉnh sửa lịch làm việc
  const handleEditAvailability = (availability) => {
    setAvailabilityMode("edit")
    setSelectedAvailability(availability)
    setModalType("availability")
    setModalOpen(true)
  }

  // Hàm xử lý khi thay đổi thông tin lịch làm việc trong form
  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target
    setSelectedAvailability(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Hàm lưu lịch làm việc (thêm mới hoặc cập nhật)
  const handleSaveAvailability = async () => {
    try {
      setLoading(true)

      // Đảm bảo định dạng dữ liệu phù hợp với backend
      const formattedData = {
        ...selectedAvailability,
        // Đảm bảo date là chuỗi định dạng YYYY-MM-DD
        date: formatDateString(selectedAvailability.date),
        // Đảm bảo thởi gian là chuỗi định dạng HH:MM
        startTime: formatTimeString(selectedAvailability.startTime),
        endTime: formatTimeString(selectedAvailability.endTime),
        // Đảm bảo doctorId là chuỗi
        doctorId: selectedAvailability.doctorId ? selectedAvailability.doctorId.toString() : ""
      }

      console.log("Sending availability data:", formattedData)

      if (availabilityMode === "add") {
        await adminService.createDoctorAvailability(formattedData)
        toast.success("Thêm lịch làm việc thành công")
      } else {
        await adminService.updateDoctorAvailability(formattedData.id, formattedData)
        toast.success("Cập nhật lịch làm việc thành công")
      }

      // Tải lại dữ liệu sau khi thêm/sửa
      loadAvailabilities()
      handleCloseModal()
    } catch (err) {
      console.error("Error saving availability:", err)
      toast.error(err.message || "Lỗi khi lưu lịch làm việc")
    } finally {
      setLoading(false)
    }
  }

  // Hàm xóa lịch làm việc
  const handleDeleteAvailability = async (availabilityId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch làm việc này?")) {
      setLoading(true)
      adminService
        .deleteDoctorAvailability(availabilityId)
        .then(() => {
          toast.success("Xóa lịch làm việc thành công")
          loadAvailabilities()
        })
        .catch((error) => {
          toast.error(`Lỗi khi xóa lịch làm việc: ${error.message}`)
        })
        .finally(() => {
          setLoading(false)
        })
    }
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

  // Render availability day view (grid format)
  const renderAvailabilityDayView = () => {
    const dayAvailabilities = availabilities
      .filter(avail => avail.date === formatDate(currentDate))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    // Group availabilities by time slot
    const availabilitiesByTimeSlot = {}
    timeSlots.forEach(slot => {
      availabilitiesByTimeSlot[slot] = dayAvailabilities.filter(avail => {
        // Check if the availability overlaps with this time slot
        const slotHour = parseInt(slot.split(':')[0])
        const availStartHour = parseInt(avail.startTime.split(':')[0])
        const availEndHour = parseInt(avail.endTime.split(':')[0])

        return availStartHour <= slotHour && availEndHour > slotHour
      })
    })

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
            const slotAvailabilities = availabilitiesByTimeSlot[time]
            return (
              <div key={time} className="day-time-slot">
                <div className="day-time-label">{time}</div>
                <div className="day-time-content">
                  {slotAvailabilities.length > 0 ? (
                    slotAvailabilities.map((avail) => {
                      const doctor = doctors.find((d) => d.id === avail.doctorId)
                      return (
                        <div
                          key={avail.id}
                          className={`day-appointment ${avail.status.toLowerCase()}`}
                          style={{
                            borderLeft: `4px solid ${doctor?.color}`,
                            minHeight: "60px",
                            maxHeight: "80px"
                          }}
                          onClick={() => handleEditAvailability(avail)}
                        >
                          <div className="day-apt-header">
                            <span className="day-apt-time">
                              {avail.startTime} - {avail.endTime}
                            </span>
                            <span className={`day-apt-status ${avail.status.toLowerCase()}`}>
                              {avail.status === "AVAILABLE" ? "Khả dụng" : "Không khả dụng"}
                            </span>
                          </div>
                          <div className="day-apt-doctor" style={{ color: doctor?.color }}>
                            {doctor?.name}
                          </div>
                          {avail.notes && <div className="day-apt-notes">{avail.notes}</div>}
                          <div className="day-apt-actions">
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditAvailability(avail)
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAvailability(avail.id)
                              }}
                            >
                              Xóa
                            </button>
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

  // Render availability week view (grid format)
  const renderAvailabilityWeekView = () => {
    const weekDays = getWeekDays(currentDate)

    // Helper function to get availabilities for a specific day and time slot
    const getAvailabilitiesForDateTime = (day, timeSlot) => {
      const dayFormatted = formatDate(day)
      const hour = parseInt(timeSlot.split(':')[0])

      return availabilities.filter(avail => {
        if (avail.date !== dayFormatted) return false

        const startHour = parseInt(avail.startTime.split(':')[0])
        const endHour = parseInt(avail.endTime.split(':')[0])

        return startHour <= hour && endHour > hour
      })
    }

    return (
      <div className="schct-week-view">
        <div className="schct-week-header">
          <div className="schct-time-column-header">Giờ</div>
          {weekDays.map((day, index) => (
            <div key={index} className={`schct-day-header ${isToday(day) ? "schct-today" : ""}`}>
              <div className="schct-day-name">{dayNames[index]}</div>
              <div className="schct-day-date">
                {day.getDate()}/{day.getMonth() + 1}
              </div>
            </div>
          ))}
        </div>
        <div className="schct-week-body">
          {timeSlots.map((time) => (
            <div key={time} className="schct-time-row">
              <div className="schct-time-label">{time}</div>
              {weekDays.map((day, dayIndex) => {
                const dayAvailabilities = getAvailabilitiesForDateTime(day, time)

                return (
                  <div key={dayIndex} className="schct-time-cell">
                    {dayAvailabilities.length > 0 && (
                      <div className="schct-appointment-group">
                        {dayAvailabilities.map((avail) => {
                          const doctor = doctors.find((d) => d.id === avail.doctorId)
                          const durationHours = parseInt(avail.endTime.split(':')[0]) - parseInt(avail.startTime.split(':')[0])
                          // Giảm độ cao xuống còn 40px mỗi giờ thay vì 60px
                          const durationPixels = durationHours * 40 // 40px per hour

                          return (
                            <div
                              key={avail.id}
                              className={`appointment-block ${avail.status.toLowerCase()}`}
                              style={{
                                backgroundColor: doctor?.color + "20",
                                borderLeft: `4px solid ${doctor?.color}`,
                                height: `${durationPixels}px`,
                                flex: 1,
                                minWidth: "80px",
                                maxHeight: "120px",
                                minHeight: "60px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                padding: "4px",
                                overflow: "hidden"
                              }}
                              onClick={() => handleEditAvailability(avail)}
                              title={`${doctor?.name}: ${avail.startTime} - ${avail.endTime}`}
                            >
                              <div className="apt-time">{avail.startTime} - {avail.endTime}</div>
                              <div className="apt-doctor">{doctor?.name}</div>
                              <div className="apt-status">
                                {avail.status === "AVAILABLE" ? "Khả dụng" : "Không khả dụng"}
                              </div>
                            </div>
                          )
                        })}
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

  // Render week view (grid format)
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const MAX_VISIBLE_APPOINTMENTS = 1

    return (
        <div className="schct-week-view">
          <div className="schct-week-header">
            <div className="schct-time-column-header">Giờ</div>
            {weekDays.map((day, index) => (
                <div key={index} className={`schct-day-header ${isToday(day) ? "schct-today" : ""}`}>
                  <div className="schct-day-name">{dayNames[index]}</div>
                  <div className="schct-day-date">
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                </div>
            ))}
          </div>
          <div className="schct-week-body">
            {timeSlots.map((time) => (
                <div key={time} className="schct-time-row">
                  <div className="schct-time-label">{time}</div>
                  {weekDays.map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDateTime(day, time)
                    const visibleAppointments = dayAppointments.slice(0, MAX_VISIBLE_APPOINTMENTS)
                    const hiddenAppointments = dayAppointments.slice(MAX_VISIBLE_APPOINTMENTS)

                    return (
                        <div key={dayIndex} className="schct-time-cell">
                          {dayAppointments.length > 0 && (
                              <div className="schct-appointment-group">
                                {visibleAppointments.map((apt) => {
                                  const doctor = doctors.find((d) => d.id === apt.doctorId)
                                  return (
                                      <div
                                          key={apt.id}
                                          className={`schct-appointment-block ${apt.status}`}
                                          style={{
                                            backgroundColor: doctor?.color + "20",
                                            borderLeft: `4px solid ${doctor?.color}`,
                                            height: `${apt.duration}px`,
                                            flex: `1 1 ${100 / Math.min(dayAppointments.length, MAX_VISIBLE_APPOINTMENTS)}%`,
                                            minWidth: "80px",
                                          }}
                                          onClick={() => handleViewAppointment(apt)}
                                          title={`${doctor?.name}: ${apt.patient} - ${typeof apt.service === 'string' ? apt.service : apt.service?.name || "Chưa xác định"}`}
                                      >
                                        <div className="schct-apt-time">{apt.time}</div>
                                        <div className="schct-apt-patient">{apt.patient}</div>
                                        <div className="schct-apt-service">{typeof apt.service === 'string' ? apt.service : apt.service?.name || "Chưa xác định"}</div>
                                        <div className="schct-apt-doctor">{doctor?.name}</div>
                                      </div>
                                  )
                                })}
                                {hiddenAppointments.length > 0 && (
                                    <div
                                        className="schct-appointment-block schct-more"
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

  // Render day view (grid format)
  const renderDayView = () => {
    const dayAppointments = appointments
        .filter(
            (apt) => apt.date === formatDate(currentDate) && (selectedDoctor === "all" || apt.doctorId === selectedDoctor),
        )
        .sort((a, b) => a.time.localeCompare(b.time))

    return (
        <div className="schct-day-view">
          <div className="schct-day-header-single">
            <h3>
              {dayNames[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]} - {currentDate.getDate()}/
              {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
            </h3>
          </div>
          <div className="schct-day-schedule">
            {timeSlots.map((time) => {
              const timeAppointments = dayAppointments.filter((apt) => apt.time === time)
              return (
                  <div key={time} className="schct-day-time-slot">
                    <div className="schct-day-time-label">{time}</div>
                    <div className="schct-day-time-content">
                      {timeAppointments.length > 0 ? (
                          timeAppointments.map((apt) => {
                            const doctor = doctors.find((d) => d.id === apt.doctorId)
                            return (
                                <div
                                    key={apt.id}
                                    className={`schct-day-appointment ${apt.status}`}
                                    style={{ borderLeft: `4px solid ${doctor?.color}` }}
                                    onClick={() => handleViewAppointment(apt)}
                                >
                                  <div className="schct-day-apt-header">
                            <span className="schct-day-apt-time">
                              {apt.time} - {addMinutesToTime(apt.time, Number.parseInt(apt.duration))}
                            </span>
                                    <span className={`schct-day-apt-status ${apt.status}`}>
                              {getStatusIcon(apt.status)}
                                      {getStatusText(apt.status)}
                            </span>
                                  </div>
                                  <div className="schct-day-apt-patient">{apt.patient}</div>
                                  <div className="schct-day-apt-service">{typeof apt.service === 'string' ? apt.service : apt.service?.name || "Chưa xác định"}</div>
                                  <div className="schct-day-apt-doctor" style={{ color: doctor?.color }}>
                                    {doctor?.name}
                                  </div>
                                  <div className="schct-day-apt-phone">
                                    <Phone size={14} /> {apt.phone}
                                  </div>
                                </div>
                            )
                          })
                      ) : (
                          <div className="schct-empty-slot">Trống</div>
                      )}
                    </div>
                  </div>
              )
            })}
          </div>
        </div>
    )
  }

  // Hàm render trang danh sách bác sĩ
  const renderDoctorsPage = () => {
    const filteredDoctors = doctors.filter(doctor => 
      doctor.id !== "all" && 
      (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
      <div>
        <div className="admin-content-header">
          <div className="admin-content-title">
            <h2>
              <Stethoscope className="icon" /> Danh sách bác sĩ
            </h2>
            <p>Chọn bác sĩ để xem lịch làm việc và lịch hẹn</p>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr">
            <h3 className="card-title">Danh sách bác sĩ ({filteredDoctors.length})</h3>
          </div>
          <div className="card-content">
            <div className="search-box doctor-search-box" style={{ marginBottom: "20px" }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm bác sĩ theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {filteredDoctors.length === 0 ? (
              <div className="empty-state" style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <User size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>Không tìm thấy bác sĩ nào phù hợp</p>
              </div>
            ) : (
              <div className="doctors-grid" style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
                gap: "20px",
                marginTop: "20px"
              }}>
                {filteredDoctors.map((doctor) => {
                  return (
                    <div
                      key={doctor.id}
                      className="doctor-card"
                      onClick={() => handleSelectDoctor(doctor.id)}
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "20px",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: doctor.color || "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "16px",
                          flexShrink: 0,
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          {getAvatarUrl(doctor.avatarUrl) ? (
                            <img 
                              src={getAvatarUrl(doctor.avatarUrl)} 
                              alt={doctor.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "50%"
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div style={{
                            width: "100%",
                            height: "100%",
                            display: getAvatarUrl(doctor.avatarUrl) ? "none" : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "white",
                            position: getAvatarUrl(doctor.avatarUrl) ? "absolute" : "static",
                            top: 0,
                            left: 0
                          }}>
                            {doctor.name ? doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'BS'}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h4 style={{ 
                                margin: "0 0 4px 0", 
                                fontSize: "16px", 
                                fontWeight: "600",
                                color: "#1a1a1a"
                              }}>
                                Họ và tên: {doctor.name}
                              </h4>
                              {doctor.specialty && (
                                <span style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  backgroundColor: "#f0f0f0",
                                  padding: "2px 8px",
                                  borderRadius: "12px"
                                }}>
                                  {doctor.specialty}
                                </span>
                              )}
                            </div>
                            <button
                              style={{
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                fontWeight: "500",
                                cursor: "pointer"
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDoctor(doctor.id);
                              }}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ marginBottom: "8px", fontSize: "14px", color: "#333" }}>
                          <strong>Email:</strong> {doctor.email || "Chưa cập nhật"}
                        </div>
                        <div style={{ marginBottom: "8px", fontSize: "14px", color: "#333" }}>
                          <strong>Giới tính:</strong> 
                          <span style={{
                            marginLeft: "8px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            backgroundColor: doctor.gender === "MALE" ? "#e3f2fd" : "#fce4ec",
                            color: doctor.gender === "MALE" ? "#1976d2" : "#c2185b"
                          }}>
                            {doctor.gender === "MALE" ? "Nam" : doctor.gender === "FEMALE" ? "Nữ" : "Chưa cập nhật"}
                          </span>
                        </div>
                        <div style={{ marginBottom: "8px", fontSize: "14px", color: "#333" }}>
                          <Phone size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                          <strong>Di động:</strong> {doctor.phone || "Chưa cập nhật"}
                        </div>
                      </div>

                      <div style={{ 
                        borderTop: "1px solid #f0f0f0", 
                        paddingTop: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <div style={{ fontSize: "14px", color: "#333" }}>
                          <Clock size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                          <strong>Lịch làm việc:</strong>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {["22/11", "24/11", "+21 Ngày"].map((day, index) => (
                            <span
                              key={index}
                              style={{
                                fontSize: "11px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: index < 2 ? "#e8f5e8" : "#fff3cd",
                                color: index < 2 ? "#2e7d32" : "#856404",
                                border: index < 2 ? "1px solid #c8e6c9" : "1px solid #ffeaa7"
                              }}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Hàm render trang lịch của bác sĩ đã chọn
  const renderSchedulePage = () => {
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="admin-content-header">
          <div className="admin-content-title">
            <button
              className="btn btn-secondary"
              onClick={handleBackToDoctorsList}
              style={{ marginRight: "15px" }}
            >
              &larr; Quay lại
            </button>
            <h2>
              <Calendar className="icon" /> Lịch của bác sĩ: {getDoctorName(selectedDoctor)}
            </h2>
          </div>
        </div>

        <div className="schedule-container" style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="card" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
            <div className="card-hdr">
              <div className="schedule-controls">
                <div className="view-controls">
                  <div className="schedule-tabs" style={{ marginRight: "15px" }}>
                    <button
                      className={`btn ${!showAvailabilityTab ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setShowAvailabilityTab(false)}
                      disabled={loading}
                    >
                      Lịch hẹn
                    </button>
                    <button
                      className={`btn ${showAvailabilityTab ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setShowAvailabilityTab(true)}
                      disabled={loading}
                    >
                      Lịch làm việc
                    </button>
                  </div>

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
            <div className="card-content" style={{ flex: 1, overflow: "auto", height: "auto" }}>
              {!showAvailabilityTab ? (
                // Hiển thị lịch hẹn
                loading ? (
                  <div className="loading">Đang tải...</div>
                ) : viewMode === "week" ? (
                  renderWeekView()
                ) : (
                  renderDayView()
                )
              ) : (
                // Hiển thị lịch làm việc của bác sĩ
                <div className="doctor-availability-container">
                  <div className="availability-header">
                    <h3>Lịch làm việc của bác sĩ</h3>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddAvailability}
                      disabled={loading || selectedDoctor === "all"}
                    >
                      Thêm lịch làm việc mới
                    </button>
                  </div>

                  {selectedDoctor === "all" ? (
                    <div className="availability-notice">
                      Vui lòng chọn một bác sĩ cụ thể để quản lý lịch làm việc
                    </div>
                  ) : loading ? (
                    <div className="loading">Đang tải...</div>
                  ) : availabilities.length === 0 ? (
                    <div className="empty-data">Không có lịch làm việc nào cho bác sĩ này vào ngày đã chọn</div>
                  ) : (
                    <>
                      {/* Hiển thị lịch làm việc dạng lưới */}
                      <div className="availability-grid-view">
                        {viewMode === "week" ? renderAvailabilityWeekView() : renderAvailabilityDayView()}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal duy nhất với animation và thiết kế mới */}
        {modalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {modalType === "viewAppointment" && (
                    <>
                      <Calendar className="icon" style={{ marginRight: "8px" }} />
                      Chi tiết lịch hẹn
                    </>
                  )}
                  {modalType === "moreAppointments" && (
                    <>
                      <Calendar className="icon" style={{ marginRight: "8px" }} />
                      Lịch hẹn cùng thởi điểm
                    </>
                  )}
                  {modalType === "availability" && (
                    <>
                      <Clock className="icon" style={{ marginRight: "8px" }} />
                      {availabilityMode === "add" ? "Thêm lịch làm việc" : "Chỉnh sửa lịch làm việc"}
                    </>
                  )}
                </h3>
                <button className="close-btn" onClick={handleCloseModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-content">
                {/* Nội dung modal xem chi tiết lịch hẹn - thiết kế mới */}
                {modalType === "viewAppointment" && selectedAppointment && (
                  <div className="appointment-details">
                    <div className="appointment-status-banner" style={{ backgroundColor: getDoctorColor(selectedAppointment.doctorId) }}>
                      <div className="status-icon">
                        {getStatusIcon(selectedAppointment.status)}
                      </div>
                      <div className="status-text">
                        {getStatusText(selectedAppointment.status)}
                      </div>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label"><User size={16} /> Bệnh nhân:</span>
                      <span className="detail-value">{selectedAppointment.patient}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><Stethoscope size={16} /> Bác sĩ:</span>
                      <span className="detail-value" style={{ color: getDoctorColor(selectedAppointment.doctorId) }}>
                        {getDoctorName(selectedAppointment.doctorId)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><CheckCircle size={16} /> Dịch vụ:</span>
                      <span className="detail-value">
                        {typeof selectedAppointment.service === 'string'
                          ? selectedAppointment.service
                          : selectedAppointment.service?.name || "Chưa xác định"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><Calendar size={16} /> Ngày:</span>
                      <span className="detail-value">{formatDate(new Date(selectedAppointment.date))}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><Clock size={16} /> Giờ:</span>
                      <span className="detail-value">{selectedAppointment.time}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><ClockIcon size={16} /> Thời lượng:</span>
                      <span className="detail-value">{selectedAppointment.duration} phút</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label"><Phone size={16} /> Số điện thoại:</span>
                      <span className="detail-value">{selectedAppointment.phone}</span>
                    </div>
                  </div>
                )}

                {/* Nội dung modal xem danh sách lịch hẹn cùng thởi điểm - thiết kế mới */}
                {modalType === "moreAppointments" && moreAppointments.length > 0 && (
                  <div className="appointments-list">
                    {moreAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="appointment-item"
                        style={{ borderLeftColor: getDoctorColor(appointment.doctorId) }}
                      >
                        <div className="appointment-header">
                          <div className="appointment-time">
                            <Clock size={16} style={{ color: "#4b5563" }} />
                            <span>{appointment.time}</span>
                          </div>
                          <div
                            className="appointment-status"
                            style={{
                              color: appointment.status === "confirmed" ? "#10b981" :
                                    appointment.status === "pending" ? "#f59e0b" :
                                    appointment.status === "canceled" ? "#ef4444" :
                                    "#8b5cf6"
                            }}
                          >
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </div>
                        </div>

                        <div className="appointment-doctor" style={{ color: getDoctorColor(appointment.doctorId) }}>
                          <Stethoscope size={16} />
                          <span>{getDoctorName(appointment.doctorId)}</span>
                        </div>

                        <div className="appointment-patient">
                          <User size={16} />
                          <span>{appointment.patient}</span>
                        </div>

                        <div className="appointment-service">
                          <CheckCircle size={16} style={{ color: "#4b5563" }} />
                          <span>
                            {typeof appointment.service === 'string'
                              ? appointment.service
                              : appointment.service?.name || "Chưa xác định"}
                          </span>
                        </div>

                        <div className="appointment-phone">
                          <Phone size={16} style={{ color: "#4b5563" }} />
                          <span>{appointment.phone}</span>
                        </div>

                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setModalType("viewAppointment")
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nội dung modal quản lý lịch làm việc - thiết kế mới */}
                {modalType === "availability" && selectedAvailability && (
                  <div className="availability-form">
                    <div className="form-content">
                      <div className="form-group">
                        <label htmlFor="doctorId">
                          <Stethoscope size={16} style={{ marginRight: "8px" }} />
                          Bác sĩ
                        </label>
                        <select
                          id="doctorId"
                          name="doctorId"
                          value={selectedAvailability.doctorId}
                          onChange={handleAvailabilityChange}
                          disabled={loading}
                          required
                          className="styled-select"
                        >
                          <option value="">Chọn bác sĩ</option>
                          {doctors
                            .filter(doctor => doctor.id !== "all")
                            .map(doctor => (
                              <option key={doctor.id} value={doctor.id}>
                                {doctor.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="date">
                          <Calendar size={16} style={{ marginRight: "8px" }} />
                          Ngày
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={selectedAvailability.date}
                          onChange={handleAvailabilityChange}
                          disabled={loading}
                          required
                          className="styled-input"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="startTime">
                            <Clock size={16} style={{ marginRight: "8px" }} />
                            Giờ bắt đầu
                          </label>
                          <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={selectedAvailability.startTime}
                            onChange={handleAvailabilityChange}
                            disabled={loading}
                            required
                            className="styled-input"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="endTime">
                            <Clock size={16} style={{ marginRight: "8px" }} />
                            Giờ kết thúc
                          </label>
                          <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={selectedAvailability.endTime}
                            onChange={handleAvailabilityChange}
                            disabled={loading}
                            required
                            className="styled-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="status">
                          <CheckCircle size={16} style={{ marginRight: "8px" }} />
                          Trạng thái
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={selectedAvailability.status}
                          onChange={handleAvailabilityChange}
                          disabled={loading}
                          required
                          className="styled-select"
                        >
                          <option value="AVAILABLE">Khả dụng</option>
                          <option value="UNAVAILABLE">Không khả dụng</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="notes">
                          <ClockIcon size={16} style={{ marginRight: "8px" }} />
                          Ghi chú
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={selectedAvailability.notes || ""}
                          onChange={handleAvailabilityChange}
                          disabled={loading}
                          rows="3"
                          className="styled-textarea"
                          placeholder="Nhập ghi chú nếu cần..."
                        ></textarea>
                      </div>
                    </div>

                    {/* Footer cho modal availability */}
                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={handleCloseModal}
                        disabled={loading}
                      >
                        <X size={16} style={{ marginRight: "4px" }} />
                        Hủy
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveAvailability}
                        disabled={loading}
                      >
                        <CheckCircle size={16} style={{ marginRight: "4px" }} />
                        {availabilityMode === "add" ? "Thêm" : "Lưu"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer chỉ hiển thị cho modal chi tiết lịch hẹn */}
              {modalType === "viewAppointment" && (
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseModal}>
                    Đóng
                  </button>
                </div>
              )}

              {/* Footer chỉ hiển thị cho modal danh sách lịch hẹn */}
              {modalType === "moreAppointments" && (
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseModal}>
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Return chính của component
  return (
    <div className="schct-schedule-content" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {loading && <div className="schct-loading">Loading...</div>}
      {error && <div className="schct-error-message">{error}</div>}

      {!loading && !error && (
        currentPage === "doctors" ? renderDoctorsPage() : renderSchedulePage()
      )}
    </div>
  );
};

export default ScheduleContent