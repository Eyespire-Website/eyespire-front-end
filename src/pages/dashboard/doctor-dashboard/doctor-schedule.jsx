"use client"

import React, { useState } from "react"
import "./doctor-schedule.css"
import { useNavigate } from "react-router-dom"

export default function DoctorSchedule() {
    const [activeTab, setActiveTab] = useState("schedule")
    const [viewMode, setViewMode] = useState("week") // week, day, month
    const [currentDate, setCurrentDate] = useState(new Date())
    const navigate = useNavigate()

    // Mẫu dữ liệu lịch làm việc
    const scheduleData = [
        {
            id: 1,
            title: "Ca sáng",
            startTime: "08:00",
            endTime: "12:00",
            type: "morning",
            daysOfWeek: [1, 3, 5], // Thứ 2, 4, 6
        },
        {
            id: 2,
            title: "Ca chiều",
            startTime: "13:00",
            endTime: "17:00",
            type: "afternoon",
            daysOfWeek: [1, 3, 5], // Thứ 2, 4, 6
        },
    ]

    const handleBackHome = () => {
        navigate("/")
    }

    const handleMenuClick = (itemId) => {
        setActiveTab(itemId)
        navigate(`/dashboard/doctor/${itemId}`)
    }

    const menuItems = [
        { id: "schedule", label: "Lịch làm việc", icon: "📅" },
        { id: "appointments", label: "Xem cuộc hẹn", icon: "🕐" },
        { id: "customers", label: "Hồ sơ bệnh nhân", icon: "👥" },
        { id: "records", label: "Tạo hồ sơ bệnh án", icon: "📋" },
        { id: "feedback", label: "Phản hồi khách hàng", icon: "💬" },
        { id: "profile", label: "Hồ sơ cá nhân", icon: "👤" },
    ]

    // Lấy ngày đầu tiên của tuần
    const getStartOfWeek = (date) => {
        const startOfWeek = new Date(date)
        const day = startOfWeek.getDay()
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Điều chỉnh để tuần bắt đầu từ thứ 2
        startOfWeek.setDate(diff)
        return startOfWeek
    }

    // Lấy các ngày trong tuần
    const getWeekDays = (date) => {
        const startOfWeek = getStartOfWeek(date)
        const weekDays = []

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek)
            day.setDate(startOfWeek.getDate() + i)
            weekDays.push(day)
        }

        return weekDays
    }

    // Lấy các ngày trong tháng
    const getMonthDays = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()

        // Ngày đầu tiên của tháng
        const firstDay = new Date(year, month, 1)
        // Ngày cuối cùng của tháng
        const lastDay = new Date(year, month + 1, 0)

        // Lấy ngày trong tuần của ngày đầu tiên (0 = Chủ nhật, 1 = Thứ 2, ...)
        const firstDayOfWeek = firstDay.getDay() || 7

        // Mảng chứa tất cả các ngày hiển thị trên lịch
        const days = []

        // Thêm các ngày trống trước ngày đầu tiên của tháng
        for (let i = 1; i < firstDayOfWeek; i++) {
            days.push(null)
        }

        // Thêm tất cả các ngày trong tháng
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }

    // Kiểm tra xem một ngày có sự kiện không
    const hasEvent = (date, type) => {
        const dayOfWeek = date.getDay() || 7 // Chuyển 0 (Chủ nhật) thành 7
        return scheduleData.some((schedule) => schedule.type === type && schedule.daysOfWeek.includes(dayOfWeek))
    }

    // Lấy sự kiện cho một ngày cụ thể
    const getEventsForDay = (date) => {
        const dayOfWeek = date.getDay() || 7 // Chuyển 0 (Chủ nhật) thành 7
        return scheduleData.filter((schedule) => schedule.daysOfWeek.includes(dayOfWeek))
    }

    // Định dạng giờ
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(":")
        return `${hours}:${minutes}`
    }

    // Chuyển đổi giờ sang vị trí trên lịch
    const timeToPosition = (timeString) => {
        const [hours, minutes] = timeString.split(":").map(Number)
        return hours * 60 + minutes
    }

    // Tính chiều cao của sự kiện dựa trên thời gian bắt đầu và kết thúc
    const calculateEventHeight = (startTime, endTime) => {
        const start = timeToPosition(startTime)
        const end = timeToPosition(endTime)
        return (end - start) * (60 / 60) // 60px cho mỗi giờ
    }

    // Tính vị trí top của sự kiện dựa trên thời gian bắt đầu
    const calculateEventTop = (startTime) => {
        const start = timeToPosition(startTime)
        const dayStart = 8 * 60 // 8:00 AM
        return (start - dayStart) * (60 / 60) // 60px cho mỗi giờ
    }

    // Chuyển đến ngày hôm nay
    const goToToday = () => {
        setCurrentDate(new Date())
    }

    // Chuyển đến ngày/tuần/tháng trước
    const goToPrevious = () => {
        const newDate = new Date(currentDate)
        if (viewMode === "day") {
            newDate.setDate(currentDate.getDate() - 1)
        } else if (viewMode === "week") {
            newDate.setDate(currentDate.getDate() - 7)
        } else if (viewMode === "month") {
            newDate.setMonth(currentDate.getMonth() - 1)
        }
        setCurrentDate(newDate)
    }

    // Chuyển đến ngày/tuần/tháng sau
    const goToNext = () => {
        const newDate = new Date(currentDate)
        if (viewMode === "day") {
            newDate.setDate(currentDate.getDate() + 1)
        } else if (viewMode === "week") {
            newDate.setDate(currentDate.getDate() + 7)
        } else if (viewMode === "month") {
            newDate.setMonth(currentDate.getMonth() + 1)
        }
        setCurrentDate(newDate)
    }

    // Kiểm tra xem một ngày có phải là ngày hôm nay không
    const isToday = (date) => {
        const today = new Date()
        return (
            date &&
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    // Render chế độ xem tuần
    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate)
        const timeSlots = Array.from({ length: 10 }, (_, i) => i + 8) // 8AM to 5PM

        return (
            <div className="week-view">
                <div className="week-days">
                    <div className="week-day-header"></div>
                    {weekDays.map((day, index) => (
                        <div key={index} className="week-day-header">
                            <div className="week-day-name">{day.toLocaleDateString("vi-VN", { weekday: "short" })}</div>
                            <div className={`week-day-number ${isToday(day) ? "today" : ""}`}>{day.getDate()}</div>
                        </div>
                    ))}
                </div>

                <div className="week-time-grid">
                    <div className="time-column">
                        {timeSlots.map((hour) => (
                            <div key={hour} className="time-slot">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {weekDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-column">
                            {timeSlots.map((hour) => (
                                <div key={hour} className="hour-row"></div>
                            ))}

                            {getEventsForDay(day).map((event, eventIndex) => (
                                <div
                                    key={eventIndex}
                                    className={`event event-${event.type}`}
                                    style={{
                                        top: `${calculateEventTop(event.startTime)}px`,
                                        height: `${calculateEventHeight(event.startTime, event.endTime)}px`,
                                    }}
                                >
                                    <div className="event-title">{event.title}</div>
                                    <div className="event-time">
                                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Render chế độ xem ngày
    const renderDayView = () => {
        const timeSlots = Array.from({ length: 10 }, (_, i) => i + 8) // 8AM to 5PM
        const events = getEventsForDay(currentDate)

        return (
            <div className="day-view">
                <div className="day-header">
                    <div className="day-name">{currentDate.toLocaleDateString("vi-VN", { weekday: "long" })}</div>
                    <div className="day-number">{currentDate.getDate()}</div>
                </div>

                <div className="day-time-grid">
                    <div className="time-column">
                        {timeSlots.map((hour) => (
                            <div key={hour} className="time-slot">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    <div className="day-column">
                        {timeSlots.map((hour) => (
                            <div key={hour} className="hour-row"></div>
                        ))}

                        {events.map((event, eventIndex) => (
                            <div
                                key={eventIndex}
                                className={`event event-${event.type}`}
                                style={{
                                    top: `${calculateEventTop(event.startTime)}px`,
                                    height: `${calculateEventHeight(event.startTime, event.endTime)}px`,
                                }}
                            >
                                <div className="event-title">{event.title}</div>
                                <div className="event-time">
                                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Render chế độ xem tháng
    const renderMonthView = () => {
        const monthDays = getMonthDays(currentDate)
        const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

        return (
            <div className="month-view">
                <div className="month-grid">
                    {dayNames.map((name) => (
                        <div key={name} className="month-day-header">
                            {name}
                        </div>
                    ))}

                    {monthDays.map((day, index) => (
                        <div key={index} className="month-day">
                            {day && (
                                <>
                                    <div className={`month-day-number ${isToday(day) ? "today" : ""}`}>{day.getDate()}</div>
                                    <div className="month-day-events">
                                        {hasEvent(day, "morning") && (
                                            <div className="month-event month-event-morning">Ca sáng: 8:00 - 12:00</div>
                                        )}
                                        {hasEvent(day, "afternoon") && (
                                            <div className="month-event month-event-afternoon">Ca chiều: 13:00 - 17:00</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="logo" onClick={handleBackHome}>
                        <img
                            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VY3PPTks6o/e8ggwzic_expires_30_days.png"
                            className="logo-image"
                            alt="EyeSpire Logo"
                        />
                        <span className="logo-text">EyeSpire</span>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id} className={`menu-item ${activeTab === item.id ? "active" : ""}`}>
                                <button onClick={() => handleMenuClick(item.id)} className="menu-button">
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-text">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <button className="logout-button">
                        <span className="logout-icon">←</span>
                        <span>Đăng xuất</span>
                    </button>
                    <div className="copyright">© 2025 EyeSpire</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header className="content-header">
                    <h1>Lịch làm việc</h1>
                </header>

                <div className="calendar-container">
                    <div className="calendar-header">
                        <div className="calendar-nav">
                            <button className="today-button" onClick={goToToday}>
                                Hôm nay
                            </button>
                            <button onClick={goToPrevious}>&lt;</button>
                            <button onClick={goToNext}>&gt;</button>
                            <div className="calendar-title">
                                {currentDate.toLocaleDateString("vi-VN", {
                                    month: "long",
                                    year: "numeric",
                                    ...(viewMode === "day" ? { day: "numeric" } : {}),
                                })}
                            </div>
                        </div>

                        <div className="calendar-view-options">
                            <button className={viewMode === "day" ? "active" : ""} onClick={() => setViewMode("day")}>
                                Ngày
                            </button>
                            <button className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")}>
                                Tuần
                            </button>
                            <button className={viewMode === "month" ? "active" : ""} onClick={() => setViewMode("month")}>
                                Tháng
                            </button>
                        </div>
                    </div>

                    {viewMode === "week" && renderWeekView()}
                    {viewMode === "day" && renderDayView()}
                    {viewMode === "month" && renderMonthView()}
                </div>
            </div>
        </div>
    )
}
