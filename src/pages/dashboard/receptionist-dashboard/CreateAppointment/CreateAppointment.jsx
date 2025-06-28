"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Info, Eye, Clock, MapPin, Phone, Mail, User, Calendar, CreditCard, ChevronDown, ArrowLeft } from 'lucide-react'
import "./CreateAppointment.css"
import {
    createAppointment,
    updateAppointment,
    cancelAppointment,
    unconfirmAppointment,
    getAllServices,
    getAllDoctors,
    getAvailableTimeSlots,
    getAvailableDoctorsForDate,
    getAppointmentInvoice,
    markAppointmentAsPaid,
} from "../../../../services/appointmentsService"
import React from "react"
import toast from "react-hot-toast"

// Custom Components
const Card = ({ children, className = "" }) => <div className={`apt-card ${className}`}>{children}</div>
const CardHeader = ({ children, className = "" }) => <div className={`apt-card-header ${className}`}>{children}</div>
const CardContent = ({ children, className = "" }) => <div className={`apt-card-content ${className}`}>{children}</div>
const CardTitle = ({ children, className = "" }) => <h3 className={`apt-card-title ${className}`}>{children}</h3>
const Label = ({ children, className = "" }) => <label className={`apt-label ${className}`}>{children}</label>
const Input = ({ className = "", ...props }) => <input className={`apt-input ${className}`} {...props} />
const Textarea = ({ className = "", ...props }) => <textarea className={`apt-textarea ${className}`} {...props} />
const Button = ({ children, className = "", ...props }) => (
    <button className={`apt-button ${className}`} {...props}>
        {children}
    </button>
)
const Badge = ({ children, variant = "default", className = "" }) => {
    const variantClass = variant === "secondary" ? "apt-badge-success" : "apt-badge-error"
    return <span className={`apt-badge ${variantClass} ${className}`}>{children}</span>
}

const Select = ({ children, value, onValueChange, disabled = false, defaultValue, defaultLabel }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || "")
    const [selectedLabel, setSelectedLabel] = useState(defaultLabel || "Chọn...")

    const options = React.Children.toArray(children).find((child) => child.type === SelectContent)?.props.children || []
    const optionsArray = React.Children.toArray(options)

    useEffect(() => {
        if (value !== undefined && value !== null) {
            const option = optionsArray.find((opt) => opt.props.value === value.toString())
            setSelectedValue(value)
            setSelectedLabel(option ? option.props.children : defaultLabel || "Chọn...")
        } else if (defaultValue) {
            const option = optionsArray.find((opt) => opt.props.value === defaultValue.toString())
            setSelectedValue(defaultValue)
            setSelectedLabel(option ? option.props.children : defaultLabel || "Chọn...")
        } else {
            setSelectedValue("")
            setSelectedLabel(defaultLabel || "Chọn...")
        }
    }, [value, defaultValue, optionsArray, defaultLabel])

    const handleSelect = (val, label) => {
        setSelectedValue(val)
        setSelectedLabel(label)
        setIsOpen(false)
        if (onValueChange) onValueChange(val)
    }

    return (
        <div className={`apt-select ${isOpen ? "open" : ""}`} key={value || defaultValue}>
            <div
                className="apt-select-trigger"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
            >
                <span>{selectedLabel}</span>
                <ChevronDown size={16} className="apt-select-icon" />
            </div>
            {isOpen && (
                <div className="apt-select-content">
                    {optionsArray.map((option, index) => (
                        <div
                            key={index}
                            className="apt-select-item"
                            onClick={() => handleSelect(option.props.value, option.props.children)}
                        >
                            {option.props.children}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const SelectTrigger = ({ children }) => children
const SelectValue = ({ placeholder }) => null
const SelectContent = ({ children }) => children
const SelectItem = ({ value, children }) => null

// Hàm tính tuổi
const calculateAge = (birthDate) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    if (isNaN(birth.getTime())) return 0
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

export default function CreateAppointment() {
    const location = useLocation()
    const navigate = useNavigate()
    const appointmentData = location.state?.appointmentData || null
    const mode = location.state?.mode || "create"

    const todayRef = useRef(new Date())
    const today = todayRef.current

    // Initialize states based on appointmentData
    const initialDate = appointmentData ? new Date(appointmentData.appointmentDate) : null
    const isValidDate = initialDate && !isNaN(initialDate.getTime())

    const [phoneNumber, setPhoneNumber] = useState(appointmentData?.patient?.phone || appointmentData?.patientPhone || "")
    const [email, setEmail] = useState(appointmentData?.patient?.email || appointmentData?.patientEmail || "")
    const [patientName, setPatientName] = useState(appointmentData?.patient?.name || appointmentData?.patientName || "")
    const [selectedProvince, setSelectedProvince] = useState(appointmentData?.patient?.province || "")
    const [selectedDistrict, setSelectedDistrict] = useState(appointmentData?.patient?.district || "")
    const [selectedWard, setSelectedWard] = useState(appointmentData?.patient?.ward || "")
    const [detailedAddress, setDetailedAddress] = useState(appointmentData?.patient?.addressDetail || "")
    const [village, setVillage] = useState(appointmentData?.patient?.village || "")
    const [selectedService, setSelectedService] = useState(appointmentData?.serviceId?.toString() || "")
    const [selectedDoctor, setSelectedDoctor] = useState(appointmentData?.doctorId?.toString() || "")
    const [reason, setReason] = useState(appointmentData?.notes || "")
    const [selectedDate, setSelectedDate] = useState(isValidDate ? initialDate.getDate() : null)
    const [selectedTime, setSelectedTime] = useState(appointmentData?.timeSlot || "")
    const [availableTimeSlots, setAvailableTimeSlots] = useState([])
    const [availableDates, setAvailableDates] = useState([])
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [currentMonth, setCurrentMonth] = useState(isValidDate ? initialDate.getMonth() : today.getMonth())
    const [currentYear, setCurrentYear] = useState(isValidDate ? initialDate.getFullYear() : today.getFullYear())
    const currentDay = today.getDate()
    const [age, setAge] = useState(
        appointmentData?.patient?.dateOfBirth ? calculateAge(appointmentData.patient.dateOfBirth) : 0,
    )
    const [selectedGender, setSelectedGender] = useState(
        appointmentData?.patient?.gender ? (appointmentData.patient.gender === "FEMALE" ? "nu" : "nam") : "",
    )
    const [services, setServices] = useState([])
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(false)
    const [isEditingTime, setIsEditingTime] = useState(mode === "create")
    const [invoiceData, setInvoiceData] = useState(null)
    const [loadingInvoice, setLoadingInvoice] = useState(false)

    const isReadOnly = mode === "edit" && appointmentData?.status !== "PENDING"

    // Fetch services and doctors
    useEffect(() => {
        const fetchServicesAndDoctors = async () => {
            try {
                const [servicesResponse, doctorsResponse] = await Promise.all([getAllServices(), getAllDoctors()])
                setServices(servicesResponse)
                setDoctors(doctorsResponse)
            } catch (error) {
                console.error("Error fetching services and doctors:", error)
            }
        }
        fetchServicesAndDoctors()
    }, [])

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch("https://provinces.open-api.vn/api/p/")
                if (!response.ok) throw new Error("Failed to fetch provinces")
                const data = await response.json()
                setProvinces(data.map((p) => ({ code: p.code.toString(), name: p.name })))
            } catch (error) {
                console.error("Error fetching provinces:", error)
                setProvinces([
                    { code: "1", name: "Hà Nội" },
                    { code: "79", name: "TP. Hồ Chí Minh" },
                    { code: "48", name: "Đà Nẵng" },
                ])
            }
        }
        fetchProvinces()
    }, [])

    // Fetch districts
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([])
            setWards([])
            return
        }
        const fetchDistricts = async () => {
            try {
                const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                if (!response.ok) throw new Error("Failed to fetch districts")
                const data = await response.json()
                setDistricts(data.districts.map((d) => ({ code: d.code.toString(), name: d.name })))
            } catch (error) {
                console.error("Error fetching districts:", error)
                setDistricts([{ code: "4", name: "Hoàn Kiếm" }])
            }
        }
        fetchDistricts()
    }, [selectedProvince])

    // Fetch wards
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([])
            return
        }
        const fetchWards = async () => {
            try {
                const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                if (!response.ok) throw new Error("Failed to fetch wards")
                const data = await response.json()
                setWards(data.wards.map((w) => ({ code: w.code.toString(), name: w.name })))
            } catch (error) {
                console.error("Error fetching wards:", error)
                setWards([{ code: "127", name: "Phường Hàng Bông" }])
            }
        }
        fetchWards()
    }, [selectedDistrict])

    // Fetch available dates - now works without requiring a doctor to be selected first
    const fetchAvailableDates = useCallback(
        async (doctorId) => {
            if (isNaN(currentMonth) || currentMonth < 0 || currentMonth > 11) {
                setAvailableDates([])
                return
            }
            try {
                setLoading(true)
                const startDate = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]
                const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0]
                const availableSlots = []
                const currentDate = new Date(startDate)
                
                // If a doctor is selected, fetch only dates available for that doctor
                if (doctorId) {
                    while (currentDate <= new Date(endDate)) {
                        const dateStr = currentDate.toISOString().split("T")[0]
                        try {
                            const slots = await getAvailableTimeSlots(doctorId, dateStr)
                            if (slots && Array.isArray(slots) && slots.some((slot) => slot?.status === "AVAILABLE")) {
                                availableSlots.push(currentDate.getDate())
                            }
                        } catch (error) {
                            console.error(`Error fetching slots for ${dateStr}:`, error)
                        }
                        currentDate.setDate(currentDate.getDate() + 1)
                    }
                } else {
                    // If no doctor is selected, all dates in the current month that are not in the past are available
                    while (currentDate <= new Date(endDate)) {
                        const isPast =
                            currentYear < today.getFullYear() ||
                            (currentYear === today.getFullYear() && currentMonth < today.getMonth()) ||
                            (currentYear === today.getFullYear() && currentMonth === today.getMonth() && currentDate.getDate() < currentDay)
                        
                        if (!isPast) {
                            availableSlots.push(currentDate.getDate())
                        }
                        currentDate.setDate(currentDate.getDate() + 1)
                    }
                }
                
                // Ensure the appointment date is included if in edit mode
                if (appointmentData && selectedDate) {
                    availableSlots.push(selectedDate)
                }
                setAvailableDates([...new Set(availableSlots)])
            } catch (error) {
                console.error("Error fetching available dates:", error)
                setAvailableDates([])
            } finally {
                setLoading(false)
            }
        },
        [currentMonth, currentYear, selectedDate, appointmentData, today, currentDay],
    )

    // Fetch time slots
    const fetchTimeSlots = useCallback(
        async (doctorId, date) => {
            if (!doctorId || !date || isNaN(currentMonth) || currentMonth < 0 || currentMonth > 11) {
                setAvailableTimeSlots([])
                return
            }
            try {
                setLoading(true)
                const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${date.toString().padStart(2, "0")}`
                const slots = await getAvailableTimeSlots(doctorId, dateStr)
                const timeSlots = slots && Array.isArray(slots) ? slots : []
                // Include the appointment's time slot in edit mode, even if unavailable
                if (appointmentData && appointmentData.timeSlot) {
                    const existingSlot = timeSlots.find((slot) => slot.time === appointmentData.timeSlot)
                    if (!existingSlot) {
                        timeSlots.push({ time: appointmentData.timeSlot, status: "UNAVAILABLE" })
                    }
                }
                setAvailableTimeSlots(timeSlots)
            } catch (error) {
                console.error("Error fetching available time slots:", error)
                setAvailableTimeSlots([])
            } finally {
                setLoading(false)
            }
        },
        [currentMonth, currentYear, appointmentData],
    )

    // Fetch available doctors for a specific date
    const fetchAvailableDoctorsForSelectedDate = useCallback(async () => {
        if (!selectedDate || isNaN(currentMonth) || currentMonth < 0 || currentMonth > 11) {
            return
        }
        try {
            setLoading(true)
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`
            const availableDoctors = await getAvailableDoctorsForDate(dateStr)
            if (availableDoctors && Array.isArray(availableDoctors)) {
                setDoctors(availableDoctors)
            }
        } catch (error) {
            console.error("Error fetching available doctors:", error)
        } finally {
            setLoading(false)
        }
    }, [selectedDate, currentMonth, currentYear])

    // Fetch available dates when month changes or doctor is selected
    useEffect(() => {
        // Always fetch available dates (with or without doctor)
        fetchAvailableDates(selectedDoctor)
        
        // If doctor is selected and we have a date, fetch time slots
        if (selectedDoctor && selectedDate) {
            fetchTimeSlots(selectedDoctor, selectedDate)
        }
    }, [selectedDoctor, currentMonth, currentYear, fetchAvailableDates, selectedDate, fetchTimeSlots])
    
    // When a date is selected, fetch available doctors for that date
    useEffect(() => {
        if (selectedDate && !selectedDoctor && mode === "create") {
            fetchAvailableDoctorsForSelectedDate()
        }
    }, [selectedDate, selectedDoctor, fetchAvailableDoctorsForSelectedDate, mode])
    
    // Fetch invoice data if in edit mode
    useEffect(() => {
        const fetchInvoiceData = async () => {
            if (mode === "edit" && appointmentData?.id) {
                try {
                    setLoadingInvoice(true)
                    const data = await getAppointmentInvoice(appointmentData.id)
                    setInvoiceData(data)
                } catch (error) {
                    console.error("Error fetching invoice data:", error)
                } finally {
                    setLoadingInvoice(false)
                }
            }
        }
        fetchInvoiceData()
    }, [mode, appointmentData?.id])

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

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth)
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
        const days = []
        for (let i = 0; i < firstDay; i++) days.push({ day: null, disabled: true })
        for (let day = 1; day <= daysInMonth; day++) {
            const isPast =
                currentYear < today.getFullYear() ||
                (currentYear === today.getFullYear() && currentMonth < today.getMonth()) ||
                (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < currentDay)
            const isAvailable = selectedDoctor ? availableDates.includes(day) : !isPast
            days.push({ day, disabled: isPast || !isAvailable })
        }
        return days
    }

    const calendarDays = generateCalendarDays()

    const getDateClassName = (date) => {
        let className = "apt-date"
        if (!date.day) className += "apt-date-hide"
        else if (date.disabled) className += "apt-date-off"
        else if (selectedDate === date.day) className += "apt-date-on"
        else if (date.day === currentDay && currentMonth === today.getMonth() && currentYear === today.getFullYear())
            className += "apt-date-now"
        else className += "apt-date-hov"
        return className
    }

    const getTimeSlotClassName = (time) => {
        const slot = availableTimeSlots.find((s) => s?.time === time)
        let className = "apt-time"
        if (selectedTime === time) className += "apt-time-on"
        else if (slot && slot.status === "AVAILABLE") className += "apt-time-hov"
        else className += "apt-time-off"
        return className
    }

    const validateTimeSlotAvailability = () => {
        if (mode === "edit" && selectedTime && availableTimeSlots.length > 0) {
            const slot = availableTimeSlots.find((s) => s?.time === selectedTime)
            return slot && (slot.status === "AVAILABLE" || slot.time === appointmentData?.timeSlot)
        }
        return true
    }

    const handleConfirmAppointment = async () => {
        if (!appointmentData?.id) return
        const isConfirmed = window.confirm(
            "Bạn có chắc chắn muốn xác nhận cuộc hẹn này? Tất cả thông tin sẽ được cập nhật.",
        )
        if (!isConfirmed) return

        const appointment = {
            serviceId: Number.parseInt(selectedService),
            doctorId: Number.parseInt(selectedDoctor),
            appointmentDate: `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`,
            timeSlot: selectedTime,
            status: "CONFIRMED", // Set status to CONFIRMED
            notes: reason,
            patientName: patientName,
            patientEmail: email,
            patientPhone: phoneNumber,
            patient: {
                id: appointmentData.patient?.id || null,
                name: patientName,
                email,
                phone: phoneNumber,
                province: selectedProvince,
                district: selectedDistrict,
                ward: selectedWard,
                addressDetail: detailedAddress,
                village: village || "",
                dateOfBirth: appointmentData.patient?.dateOfBirth || "",
                gender: selectedGender === "nu" ? "FEMALE" : "MALE",
            },
        }

        try {
            await updateAppointment(appointmentData.id, appointment)
            alert("Xác nhận cuộc hẹn thành công! Tất cả thông tin đã được cập nhật.")
            navigate("/dashboard/receptionist/all-appointments")
        } catch (error) {
            console.error("Error confirming appointment:", error)
            alert("Lỗi khi xác nhận cuộc hẹn: " + error.message)
        }
    }

    const handleCancelAppointment = async () => {
        if (!appointmentData?.id) return
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn hủy cuộc hẹn này?")
        if (!isConfirmed) return

        try {
            await cancelAppointment(appointmentData.id)
            navigate("/dashboard/receptionist/all-appointments")
        } catch (error) {
            console.error("Error cancelling appointment:", error)
            alert("Failed to cancel appointment: " + error.message)
        }
    }

    const handleUnconfirmAppointment = async () => {
        if (!appointmentData?.id) return
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn hủy xác nhận cuộc hẹn này? Trạng thái sẽ chuyển về PENDING.")
        if (!isConfirmed) return

        try {
            await unconfirmAppointment(appointmentData.id)
            alert("Đã hủy xác nhận cuộc hẹn thành công!")
            navigate("/dashboard/receptionist/all-appointments")
        } catch (error) {
            console.error("Error unconfirming appointment:", error)
            alert("Lỗi khi hủy xác nhận cuộc hẹn: " + error.message)
        }
    }

    const handleCreateAppointment = async () => {
        const appointment = {
            serviceId: Number.parseInt(selectedService),
            doctorId: Number.parseInt(selectedDoctor),
            appointmentDate: `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`,
            timeSlot: selectedTime,
            status: "PENDING",
            notes: reason,
            patientName: patientName,
            patientEmail: email,
            patientPhone: phoneNumber,
            patient: {
                name: patientName,
                email,
                phone: phoneNumber,
                province: selectedProvince,
                district: selectedDistrict,
                ward: selectedWard,
                addressDetail: detailedAddress,
                village: village || "",
                dateOfBirth: "",
                gender: selectedGender === "nu" ? "FEMALE" : "MALE",
            },
        }
        try {
            await createAppointment(appointment)
            navigate("/dashboard/receptionist/all-appointments")
        } catch (error) {
            console.error("Error creating appointment:", error)
            alert("Failed to create appointment: " + error.message)
        }
    }

    const handleBackToList = () => navigate("/dashboard/receptionist/all-appointments")

    // Handle confirm payment
    const handleConfirmPayment = async () => {
        try {
            setLoading(true)
            const paymentData = {
                paymentMethod: "CASH", // Mặc định là thanh toán tiền mặt
                amount: invoiceData?.remainingAmount || 0,
            }
            await markAppointmentAsPaid(appointmentData.id, paymentData)
            toast.success("Xác nhận thanh toán thành công!")
            
            // Cập nhật lại dữ liệu cuộc hẹn và hóa đơn
            const updatedInvoice = await getAppointmentInvoice(appointmentData.id)
            setInvoiceData(updatedInvoice)
            
            // Cập nhật lại trạng thái cuộc hẹn trong state
            const updatedAppointmentData = { ...appointmentData, status: "COMPLETED" }
            navigate(location.pathname, { state: { appointmentData: updatedAppointmentData, mode: "edit" } })
        } catch (error) {
            console.error("Error confirming payment:", error)
            toast.error("Không thể xác nhận thanh toán: " + (error.message || "Lỗi không xác định"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="apt-wrap">
            <div className="apt-back-btn">
                <Button onClick={handleBackToList} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700">
                    <ArrowLeft size={16} /> Quay lại danh sách
                </Button>
            </div>
            <div className="apt-grid">
                <div className="apt-y6">
                    <Card>
                        <CardHeader className="apt-hdr-svc">
                            <CardTitle>
                                <Eye size={20} /> Dịch vụ khám
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="apt-form">
                                <div>
                                    <Label>
                                        <span className="apt-req">*</span> Dịch vụ khám mắt
                                    </Label>
                                    <Select
                                        value={selectedService}
                                        onValueChange={setSelectedService}
                                        disabled={mode === "edit" && appointmentData?.status !== "PENDING"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map((service) => (
                                                <SelectItem key={service.id} value={service.id.toString()}>
                                                    {service.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>
                                        <span className="apt-req">*</span> Bác sĩ chuyên khoa
                                    </Label>
                                    <Select
                                        value={selectedDoctor}
                                        onValueChange={(value) => {
                                            setSelectedDoctor(value)
                                            setSelectedDate(null)
                                            setSelectedTime("")
                                        }}
                                        disabled={mode === "edit" && appointmentData?.status !== "PENDING"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    {doctor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="apt-pay-card">
                        <CardHeader className="apt-hdr-pay">
                            <CardTitle>
                                <CreditCard size={20} /> Chi phí tạo cuộc hẹn
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="apt-y3">
                            {loadingInvoice ? (
                                <div className="flex justify-center items-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="apt-pay-row">
                                        <span className="apt-pay-lbl">Phí đặt cọc:</span>
                                        <span className="apt-pay-val">
                                            {invoiceData?.depositAmount ? `${invoiceData.depositAmount.toLocaleString()} đ` : "10.000 đ"}
                                        </span>
                                    </div>
                                    
                                    {invoiceData && (
                                        <>
                                            <div className="apt-pay-row">
                                                <span className="apt-pay-lbl">Trạng thái đặt cọc:</span>
                                                <span className={`apt-pay-val ${invoiceData.depositAmount ? "text-green-600 font-medium" : ""}`}>
                                                    {invoiceData.depositAmount ? "Đã thanh toán" : "Chưa thanh toán"}
                                                </span>
                                            </div>
                                            
                                            {appointmentData?.status === "WAITING_PAYMENT" && (
                                                <>
                                                    <div className="apt-pay-row">
                                                        <span className="apt-pay-lbl">Phí điều trị:</span>
                                                        <span className="apt-pay-val">
                                                            {invoiceData.remainingAmount ? `${invoiceData.remainingAmount.toLocaleString()} đ` : "0 đ"}
                                                        </span>
                                                    </div>
                                                    <div className="apt-pay-row">
                                                        <span className="apt-pay-lbl">Trạng thái thanh toán:</span>
                                                        <span className={`apt-pay-val ${invoiceData.isFullyPaid ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}`}>
                                                            {invoiceData.isFullyPaid ? "Đã thanh toán đầy đủ" : "Chờ thanh toán"}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                    
                                    <hr />
                                    <div className="apt-pay-tot">
                                        <span>Tổng tiền:</span>
                                        <span>
                                            {invoiceData?.totalAmount 
                                                ? `${invoiceData.totalAmount.toLocaleString()} đ` 
                                                : "10.000 đ"}
                                        </span>
                                    </div>
                                    <div className="apt-pay-note">* Giá có thể thay đổi tùy theo dịch vụ</div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="apt-y4">
                    <Card>
                        <CardHeader className="apt-hdr-cal">
                            <CardTitle className="apt-card-title-sm">
                                <Calendar size={16} /> Chọn thời gian khám
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {mode === "edit" && selectedDate && selectedTime && !isEditingTime ? (
                                <div className="apt-sum">
                                    <h3 className="apt-sum-ttl">Lịch hẹn:</h3>
                                    <div className="apt-sum-body">
                                        <div className="apt-sum-item">
                                            <Calendar size={12} />
                                            <span>
                        {selectedDate}/{Number.parseInt(currentMonth) + 1}/{currentYear}
                      </span>
                                        </div>
                                        <div className="apt-sum-item">
                                            <Clock size={12} />
                                            <span>{selectedTime}</span>
                                        </div>
                                    </div>
                                    {!isReadOnly && (
                                        <Button
                                            className="apt-button-primary mt-2"
                                            style={{ background: "#245EA8" }}
                                            onClick={() => setIsEditingTime(true)}
                                        >
                                            thay đổi
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="apt-cal-wrap">
                                        <div className="apt-cal-sel apt-cal-yr">
                                            <Select
                                                value={currentYear.toString()}
                                                onValueChange={(value) => setCurrentYear(Number.parseInt(value))}
                                                disabled={isReadOnly}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[2024, 2025, 2026].map((year) => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="apt-cal-sel apt-cal-mon">
                                            <Select
                                                value={currentMonth.toString()}
                                                onValueChange={(value) => setCurrentMonth(Number.parseInt(value))}
                                                disabled={isReadOnly}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthNames.map((month, index) => (
                                                        <SelectItem key={index} value={index.toString()}>
                                                            {month}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="apt-cal-box">
                                        <div className="apt-cal-days">
                                            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                                                <div key={day} className="apt-cal-day">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="apt-cal-dates">
                                            {calendarDays.map((date, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        if (!date.disabled && !isReadOnly) {
                                                            setSelectedDate(date.day)
                                                            if (selectedDoctor) {
                                                                fetchTimeSlots(selectedDoctor, date.day)
                                                            } else if (mode === "create") {
                                                                // When selecting a date without a doctor, reset doctor selection
                                                                // and trigger fetching available doctors
                                                                setSelectedDoctor("")
                                                            }
                                                        }
                                                    }}
                                                    className={getDateClassName(date)}
                                                    disabled={date.disabled || isReadOnly}
                                                >
                                                    {date.day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="apt-time-lbl">
                                            <Clock size={12} /> Giờ khám{" "}
                                            {selectedDate && `(${selectedDate}/${Number.parseInt(currentMonth) + 1})`}
                                        </Label>
                                        {selectedDate && selectedDoctor ? (
                                            loading ? (
                                                <div className="apt-empty">
                                                    <p className="apt-empty-txt">Đang tải khung giờ...</p>
                                                </div>
                                            ) : (
                                                <div className="apt-time-grid">
                                                    {availableTimeSlots.map((slot, index) => (
                                                        <button
                                                            key={slot?.time || `slot-${index}`}
                                                            onClick={() => !isReadOnly && slot?.status === "AVAILABLE" && setSelectedTime(slot?.time)}
                                                            className={getTimeSlotClassName(slot?.time)}
                                                            disabled={!slot || slot.status !== "AVAILABLE" || isReadOnly}
                                                        >
                                                            {slot?.time || "N/A"}
                                                        </button>
                                                    ))}
                                                </div>
                                            )
                                        ) : (
                                            <div className="apt-empty">
                                                <Calendar className="apt-empty-ico" />
                                                <p className="apt-empty-txt">Chọn bác sĩ và ngày để xem giờ khám</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {(mode !== "edit" || isEditingTime) && selectedDate && selectedTime && (
                                <div className="apt-sum">
                                    <h3 className="apt-sum-ttl">Lịch hẹn:</h3>
                                    <div className="apt-sum-body">
                                        <div className="apt-sum-item">
                                            <Calendar size={12} />
                                            <span>
                        {selectedDate}/{Number.parseInt(currentMonth) + 1}/{currentYear}
                      </span>
                                        </div>
                                        <div className="apt-sum-item">
                                            <Clock size={12} />
                                            <span>{selectedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="apt-y6">
                    <Card>
                        <CardHeader className="apt-hdr-pat">
                            <CardTitle>
                                <User size={20} /> Thông tin bệnh nhân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="apt-y4">
                            <div className="apt-g2">
                                <div>
                                    <Label>
                                        <Phone size={16} className="apt-mr-1" />
                                        <span className="apt-req">*</span> Số điện thoại
                                    </Label>
                                    <div className="apt-flex">
                                        <Input
                                            readOnly
                                            value={phoneNumber}
                                            onChange={(e) => !isReadOnly && setPhoneNumber(e.target.value)}
                                            className="apt-flex-1"
                                            placeholder="Nhập số điện thoại"
                                        />
                                        {phoneNumber && (
                                            <Badge variant={phoneNumber.length >= 10 ? "secondary" : "destructive"}>
                                                {phoneNumber.length >= 10 ? "✓" : "✕"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label>
                                        <Mail size={16} className="apt-mr-1" />
                                        <span className="apt-req">*</span> Email
                                    </Label>
                                    <div className="apt-flex">
                                        <Input
                                            readOnly
                                            value={email}
                                            onChange={(e) => !isReadOnly && setEmail(e.target.value)}
                                            className="apt-flex-1"
                                            placeholder="Nhập địa chỉ email"
                                            type="email"
                                        />
                                        {email && (
                                            <Badge variant={email.includes("@") ? "secondary" : "destructive"}>
                                                {email.includes("@") ? "✓" : "✕"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="apt-g3">
                                <div>
                                    <Label>
                                        <span className="apt-req">*</span> Họ và tên
                                    </Label>
                                    <Input
                                        readOnly
                                        value={patientName}
                                        onChange={(e) => !isReadOnly && setPatientName(e.target.value)}
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                </div>
                                <div>
                                    <Label>Tuổi</Label>
                                    <Input value={age} readOnly placeholder="Tuổi" type="number" min="1" max="120" />
                                </div>
                                <div>
                                    <Label>
                                        <span className="apt-req">*</span> Giới tính
                                    </Label>
                                    <Select value={selectedGender} onValueChange={setSelectedGender} disabled>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nam">Nam</SelectItem>
                                            <SelectItem value="nu">Nữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="apt-y2">
                                <Label>
                                    <MapPin size={16} className="apt-mr-1" />
                                    <span className="apt-req">*</span> Địa chỉ
                                </Label>
                                <div className="apt-g2 apt-mt-2">
                                    <div className="apt-address-field">
                                        <Label>
                                            <span className="apt-req">*</span> Tỉnh/Thành phố
                                        </Label>
                                        <Select
                                            value={selectedProvince}
                                            onValueChange={setSelectedProvince}
                                            defaultLabel="Tỉnh/Thành phố"
                                            disabled
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((p) => (
                                                    <SelectItem key={p.code} value={p.code}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="apt-address-field">
                                        <Label>
                                            <span className="apt-req">*</span> Quận/Huyện
                                        </Label>
                                        <Select
                                            value={selectedDistrict}
                                            onValueChange={setSelectedDistrict}
                                            defaultLabel="Quận/Huyện"
                                            disabled
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {districts.map((d) => (
                                                    <SelectItem key={d.code} value={d.code}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="apt-g2 apt-mt-2">
                                    <div className="apt-address-field">
                                        <Label>
                                            <span className="apt-req">*</span> Xã/Phường
                                        </Label>
                                        <Select value={selectedWard} onValueChange={setSelectedWard} defaultLabel="Xã/Phường" disabled>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wards.map((w) => (
                                                    <SelectItem key={w.code} value={w.code}>
                                                        {w.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="apt-mt-2 apt-address-field">
                                    <Label>Số nhà, tên đường</Label>
                                    <Input
                                        value={detailedAddress}
                                        onChange={(e) => !isReadOnly && setDetailedAddress(e.target.value)}
                                        placeholder="Số nhà, tên đường..."
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>
                                    <Info size={16} className="apt-mr-1" />
                                    <span className="apt-req">*</span> Triệu chứng
                                </Label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => !isReadOnly && setReason(e.target.value)}
                                    placeholder="Mô tả triệu chứng: mờ mắt, đau mắt, khô mắt"
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div className="apt-notes">
                                <h4 className="apt-notes-ttl">
                                    <Info size={16} /> Lưu ý quan trọng:
                                </h4>
                                <ul className="apt-notes-list">
                                    <li className="apt-notes-item">
                                        <Clock size={12} />
                                        <span>Đến sớm 15 phút trước giờ hẹn</span>
                                    </li>
                                    <li className="apt-notes-item">
                                        <User size={12} />
                                        <span>Mang theo CMND/CCCD và thẻ BHYT</span>
                                    </li>
                                    <li className="apt-notes-item">
                                        <Eye size={12} />
                                        <span>Không nhỏ thuốc mắt trước khi khám</span>
                                    </li>
                                    <li className="apt-notes-item">
                                        <Info size={12} />
                                        <span>Thông báo nếu đang dùng thuốc gì</span>
                                    </li>
                                </ul>
                            </div>
                            {mode === "edit" && appointmentData?.status === "PENDING" ? (
                                <div className="flex gap-3">
                                    <Button
                                        className="apt-button-primary"
                                        style={{ background: "#0656ef" }}
                                        disabled={
                                            !selectedDate ||
                                            !selectedTime ||
                                            !email ||
                                            !patientName ||
                                            !selectedProvince ||
                                            !selectedDistrict ||
                                            !selectedWard ||
                                            !selectedService ||
                                            !selectedDoctor ||
                                            !validateTimeSlotAvailability()
                                        }
                                        onClick={handleConfirmAppointment}
                                    >
                                        Xác nhận cuộc hẹn
                                    </Button>
                                    <Button
                                        className="apt-button-primary"
                                        style={{ background: "#dc3545" }}
                                        onClick={handleCancelAppointment}
                                    >
                                        Hủy cuộc hẹn
                                    </Button>
                                </div>
                            ) : mode === "edit" && appointmentData?.status === "CONFIRMED" ? (
                                <div className="flex gap-3">
                                    <Button
                                        className="apt-button-primary"
                                        style={{ background: "#ffc107", color: "#000" }}
                                        onClick={handleUnconfirmAppointment}
                                    >
                                        Hủy xác nhận
                                    </Button>
                                    <Button
                                        className="apt-button-primary"
                                        style={{ background: "#dc3545" }}
                                        onClick={handleCancelAppointment}
                                    >
                                        Hủy lịch hẹn
                                    </Button>
                                </div>
                            ) : mode === "edit" && appointmentData?.status === "WAITING_PAYMENT" ? (
                                <div className="flex gap-3">
                                    {invoiceData && !invoiceData.isFullyPaid && (
                                        <Button
                                            className="apt-button-primary"
                                            style={{ background: "#28a745" }}
                                            onClick={handleConfirmPayment}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Xác nhận thanh toán"
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        className="apt-button-primary"
                                        style={{ background: "#dc3545" }}
                                        onClick={handleCancelAppointment}
                                        disabled={loading}
                                    >
                                        Hủy lịch hẹn
                                    </Button>
                                </div>
                            ) : mode === "create" ? (
                                <Button
                                    className="apt-button-primary"
                                    style={{ background: "#0654ef" }}
                                    disabled={
                                        !selectedDate ||
                                        !selectedTime ||
                                        !email ||
                                        !patientName ||
                                        !selectedProvince ||
                                        !selectedDistrict ||
                                        !selectedWard ||
                                        !selectedService ||
                                        !selectedDoctor ||
                                        !validateTimeSlotAvailability()
                                    }
                                    onClick={handleCreateAppointment}
                                >
                                    Tạo cuộc hẹn
                                </Button>
                            ) : (
                                <div className="apt-readonly-message">
                                    <p>Cuộc hẹn này chỉ có thể xem vì trạng thái là {appointmentData?.status}.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}