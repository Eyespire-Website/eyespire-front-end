"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Info, Eye, Clock, MapPin, Phone, Mail, User, Calendar, CreditCard, ChevronDown, ArrowLeft, AlertCircle } from 'lucide-react'
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
import addressService from "../../../../services/addressService"
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
    const [patientName, setPatientName] = useState(
        (mode === "edit" && appointmentData?.status !== "PENDING") 
            ? (appointmentData?.patient?.name || appointmentData?.patientName || "")
            : (appointmentData?.patientName || "")
    )
    const [selectedProvince, setSelectedProvince] = useState(
        appointmentData?.patient?.provinceCode || appointmentData?.patient?.province || ""
    )
    const [selectedWard, setSelectedWard] = useState(
        appointmentData?.patient?.wardCode || appointmentData?.patient?.ward || ""
    )
    const [detailedAddress, setDetailedAddress] = useState(appointmentData?.patient?.addressDetail || "")
    const [selectedService, setSelectedService] = useState(appointmentData?.serviceId?.toString() || "1")
    const [selectedDoctor, setSelectedDoctor] = useState(appointmentData?.doctorId?.toString() || "")
    const [reason, setReason] = useState(appointmentData?.notes || "")
    const [selectedDate, setSelectedDate] = useState(isValidDate ? initialDate.getDate() : null)
    const [selectedTime, setSelectedTime] = useState(appointmentData?.timeSlot || "")
    const [availableTimeSlots, setAvailableTimeSlots] = useState([])
    const [allTimeSlotsForFiltering, setAllTimeSlotsForFiltering] = useState([])
    const [availableDates, setAvailableDates] = useState([])
    const [provinces, setProvinces] = useState([])
    const [wards, setWards] = useState([])
    const [provinceName, setProvinceName] = useState("")
    const [wardName, setWardName] = useState("")
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
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancellationReason, setCancellationReason] = useState("")

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
                const provincesData = await addressService.getProvinces()
                setProvinces(provincesData)
            } catch (error) {
                console.error("Error fetching provinces:", error)
                toast.error("Không thể tải danh sách tỉnh/thành phố")
            }
        }
        fetchProvinces()
    }, [])

    // Fetch wards by province
    useEffect(() => {
        if (!selectedProvince) {
            setWards([])
            setSelectedWard("")
            return
        }
        const fetchWards = async () => {
            try {
                const wardsData = await addressService.getWardsByProvince(selectedProvince)
                setWards(wardsData)
            } catch (error) {
                console.error("Error fetching wards:", error)
                toast.error("Không thể tải danh sách phường/xã")
            }
        }
        fetchWards()
    }, [selectedProvince])

    // Resolve province and ward names from codes when data is loaded
    useEffect(() => {
        const resolveAddressNames = async () => {
            if (selectedProvince && provinces.length > 0) {
                const province = provinces.find(p => p.id === selectedProvince)
                if (province) {
                    setProvinceName(province.name)
                }
            }
            
            if (selectedWard && wards.length > 0) {
                const ward = wards.find(w => w.id === selectedWard)
                if (ward) {
                    setWardName(ward.name)
                }
            }
        }
        resolveAddressNames()
    }, [selectedProvince, selectedWard, provinces, wards])

    // Migration logic for old address data format
    useEffect(() => {
        const migrateOldAddressData = async () => {
            if (!appointmentData?.patient) return
            
            const patient = appointmentData.patient
            console.log('Patient data for migration:', patient)
            console.log('Provinces available:', provinces.length)
            console.log('Wards available:', wards.length)
            
            // Check if this is old format data (has province/district/ward as numbers)
            const hasOldFormat = patient.province && !patient.provinceCode
            
            if (hasOldFormat) {
                try {
                    // Convert old province ID to new format
                    if (patient.province && provinces.length > 0) {
                        const oldProvinceId = patient.province.toString()
                        const province = provinces.find(p => p.id === oldProvinceId)
                        if (province) {
                            setSelectedProvince(province.id)
                            setProvinceName(province.name)
                        }
                    }
                    
                    // Convert old ward format (like "11_9") to new format
                    if (patient.ward && patient.ward.includes('_')) {
                        const wardParts = patient.ward.split('_')
                        if (wardParts.length === 2) {
                            const provinceId = wardParts[0]
                            const wardId = wardParts[1]
                            
                            // Fetch wards for the province and find matching ward
                            if (provinceId && wards.length > 0) {
                                const ward = wards.find(w => w.id.toString().endsWith(wardId))
                                if (ward) {
                                    setSelectedWard(ward.id)
                                    setWardName(ward.name)
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error migrating old address data:', error)
                }
            }
        }
        
        migrateOldAddressData()
    }, [appointmentData, provinces, wards])

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

    // Fetch time slots for a specific doctor and date
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
        
        // If doctor is selected and we have a date, fetch time slots for that doctor only
        if (selectedDoctor && selectedDate) {
            fetchTimeSlots(selectedDoctor, selectedDate)
        } else {
            // Clear time slots if no doctor selected
            setAvailableTimeSlots([])
        }
    }, [selectedDoctor, currentMonth, currentYear, fetchAvailableDates, selectedDate, fetchTimeSlots])
    
    // When a date is selected, always fetch available doctors for that date
    useEffect(() => {
        if (selectedDate && mode === "create") {
            fetchAvailableDoctorsForSelectedDate()
        }
    }, [selectedDate, fetchAvailableDoctorsForSelectedDate, mode])
    
    // Fetch time slots for all doctors when appointment data is available (for filtering)
    useEffect(() => {
        console.log("=== useEffect fetchAllTimeSlotsForAppointment ===")
        console.log("appointmentData?.appointmentDate:", appointmentData?.appointmentDate)
        console.log("appointmentData?.timeSlot:", appointmentData?.timeSlot)
        console.log("doctors.length:", doctors.length)
        console.log("mode:", mode)
        
        const fetchAllTimeSlotsForAppointment = async () => {
            if (!appointmentData?.appointmentDate || !appointmentData?.timeSlot || !doctors.length) {
                console.log("useEffect early return - conditions not met")
                return
            }
            
            console.log("Starting to fetch time slots for all doctors...")
            
            try {
                setLoading(true)
                const appointmentDate = appointmentData.appointmentDate
                console.log("Fetching time slots for appointment date:", appointmentDate)
                
                // Fetch time slots for all doctors on the appointment date
                const allSlots = []
                for (const doctor of doctors) {
                    try {
                        console.log(`Fetching slots for doctor ${doctor.name} (ID: ${doctor.id})...`)
                        // Pass excludeAppointmentId in edit mode to exclude current appointment from availability check
                        const excludeId = mode === 'edit' && appointmentData?.id ? appointmentData.id : null;
                        const slots = await getAvailableTimeSlots(doctor.id, appointmentDate, excludeId)
                        console.log(`Slots received for doctor ${doctor.name}:`, slots)
                        
                        if (slots && Array.isArray(slots)) {
                            const doctorSlots = slots.map(slot => ({ ...slot, doctorId: doctor.id }))
                            allSlots.push(...doctorSlots)
                            console.log(`Added ${doctorSlots.length} slots for doctor ${doctor.name}`)
                        } else {
                            console.log(`No valid slots for doctor ${doctor.name}`)
                        }
                    } catch (error) {
                        console.error(`Error fetching slots for doctor ${doctor.id}:`, error)
                    }
                }
                
                console.log("All time slots fetched for appointment:", allSlots)
                // Store all slots for filtering purposes
                setAllTimeSlotsForFiltering(allSlots)
                // Also set availableTimeSlots for backward compatibility
                setAvailableTimeSlots(allSlots)
            } catch (error) {
                console.error("Error fetching all time slots for appointment:", error)
                setAllTimeSlotsForFiltering([])
                setAvailableTimeSlots([])
            } finally {
                setLoading(false)
            }
        }
        
        fetchAllTimeSlotsForAppointment()
    }, [appointmentData?.appointmentDate, appointmentData?.timeSlot, doctors])
    
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

    // Filter doctors based on appointment time slot availability
    const getFilteredDoctors = () => {
        const appointmentTime = appointmentData?.timeSlot
        const appointmentDate = appointmentData?.appointmentDate
        
        console.log("=== getFilteredDoctors Debug ===")
        console.log("appointmentTime:", appointmentTime)
        console.log("appointmentDate:", appointmentDate)
        console.log("doctors.length:", doctors.length)
        console.log("allTimeSlotsForFiltering.length:", allTimeSlotsForFiltering?.length)
        console.log("allTimeSlotsForFiltering:", allTimeSlotsForFiltering)
        
        // If no appointment time or date, return all doctors
        if (!appointmentTime || !appointmentDate || !doctors.length) {
            console.log("Early return: missing appointmentTime, appointmentDate, or doctors")
            return doctors
        }
        
        // Use allTimeSlotsForFiltering instead of availableTimeSlots for filtering
        const slotsToUse = allTimeSlotsForFiltering.length > 0 ? allTimeSlotsForFiltering : availableTimeSlots
        
        // If no time slots data available, return empty list to prevent incorrect display
        if (!slotsToUse || slotsToUse.length === 0) {
            console.log("No time slots data for filtering - returning empty list")
            return []
        }
        
        // Filter doctors who have AVAILABLE slots for the appointment time
        // AVAILABLE means: doctor has working hours AND no appointment on that slot
        const filteredDoctors = doctors.filter(doctor => {
            // Check if this doctor has available slots for the appointment time
            const doctorSlots = slotsToUse.filter(slot => 
                slot.doctorId === doctor.id && slot.time === appointmentTime
            )
            
            // Only show doctors with AVAILABLE status (has working hours + no conflicts)
            const availableSlots = doctorSlots.filter(slot => slot.status === "AVAILABLE")
            
            console.log(`Doctor ${doctor.name} (ID: ${doctor.id}):`)
            console.log(`  - All slots for time ${appointmentTime}:`, doctorSlots)
            
            // Debug chi tiết từng slot
            doctorSlots.forEach((slot, index) => {
                console.log(`    Slot ${index + 1}:`, {
                    time: slot.time,
                    status: slot.status,
                    availableCount: slot.availableCount,
                    doctorId: slot.doctorId
                })
            })
            
            console.log(`  - Available slots:`, availableSlots)
            console.log(`  - Is available:`, availableSlots.length > 0)
            
            return availableSlots.length > 0
        })
        
        console.log("Filtered available doctors:", filteredDoctors.map(d => d.name))
        
        // Return filtered list (can be empty if no doctors are available)
        if (filteredDoctors.length === 0) {
            console.log("No doctors available for selected time slot")
        }
        
        return filteredDoctors
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
                provinceCode: selectedProvince,
                wardCode: selectedWard,
                addressDetail: detailedAddress,
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

    const handleCancelAppointment = () => {
        if (!appointmentData?.id) return
        setShowCancelModal(true)
    }

    const confirmCancelAppointment = async () => {
        if (!cancellationReason.trim()) {
            alert("Vui lòng nhập lý do hủy cuộc hẹn")
            return
        }

        try {
            await cancelAppointment(appointmentData.id, cancellationReason)
            setShowCancelModal(false)
            setCancellationReason("")
            navigate("/dashboard/receptionist/all-appointments")
        } catch (error) {
            console.error("Error cancelling appointment:", error)
            alert("Failed to cancel appointment: " + error.message)
        }
    }

    const closeCancelModal = () => {
        setShowCancelModal(false)
        setCancellationReason("")
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
                provinceCode: selectedProvince,
                wardCode: selectedWard,
                addressDetail: detailedAddress,
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
                                            <SelectValue placeholder="Chọn dịch vụ khám" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map((service) => (
                                                <SelectItem key={service.id} value={service.id.toString()}>
                                                    {service.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="apt-pay-note">
                                        * Mặc định là "Khám mắt tổng quát" nếu bệnh nhân không chọn dịch vụ
                                    </div>
                                </div>
                                <div>
                                    <Label>
                                        <span className="apt-req">*</span> Bác sĩ chuyên khoa
                                    </Label>
                                    <Select
                                        value={selectedDoctor}
                                        onValueChange={setSelectedDoctor}
                                        disabled={mode === "edit" && appointmentData?.status !== "PENDING"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn bác sĩ phù hợp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getFilteredDoctors().map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    {doctor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="apt-pay-note">
                                        * Danh sách bác sĩ có sẵn trong khung giờ bệnh nhân đã chọn
                                    </div>
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
                                <Calendar size={16} /> Thời gian khám đã chọn
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedDate && selectedTime ? (
                                <div className="apt-sum">
                                    <h3 className="apt-sum-ttl">Lịch hẹn bệnh nhân đã chọn:</h3>
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
                                    <div className="apt-pay-note">
                                        * Thời gian này đã được bệnh nhân chọn từ trang chủ
                                    </div>
                                </div>
                            ) : (
                                <div className="apt-empty">
                                    <Calendar className="apt-empty-ico" />
                                    <p className="apt-empty-txt">Chưa có thông tin thời gian khám</p>
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
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="apt-address-field">
                                        <Label>
                                            <span className="apt-req">*</span> Phường/Xã
                                        </Label>
                                        <Select
                                            value={selectedWard}
                                            onValueChange={setSelectedWard}
                                            defaultLabel="Phường/Xã"
                                            disabled
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wards.map((w) => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        {w.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {/* Hiển thị địa chỉ đã chọn */}
                                {(provinceName || wardName || appointmentData?.patient?.province || appointmentData?.patient?.ward) && (
                                    <div className="apt-mt-2 apt-address-display">
                                        <Label>Địa chỉ hiện tại:</Label>
                                        <div className="apt-address-text">
                                            {provinceName ? (
                                                <span>{provinceName}</span>
                                            ) : appointmentData?.patient?.province ? (
                                                <span>Tỉnh/TP (ID: {appointmentData.patient.province})</span>
                                            ) : null}
                                            
                                            {(provinceName || appointmentData?.patient?.province) && 
                                             (wardName || appointmentData?.patient?.ward) && <span> - </span>}
                                            
                                            {wardName ? (
                                                <span>{wardName}</span>
                                            ) : appointmentData?.patient?.ward ? (
                                                <span>Phường/Xã (ID: {appointmentData.patient.ward})</span>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
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
                                            !selectedWard ||
                                            !selectedService ||
                                            !selectedDoctor
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
                                        !selectedWard ||
                                        !selectedService ||
                                        !selectedDoctor
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
                    
                    {/* Hiển thị lý do hủy cuộc hẹn */}
                    {mode === "edit" && appointmentData?.status === "CANCELED" && appointmentData?.cancellationReason && (
                        <Card className="apt-cancellation-card">
                            <CardHeader className="apt-hdr-cancel">
                                <CardTitle className="apt-cancel-title">
                                    <AlertCircle size={20} /> Lý do hủy cuộc hẹn
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="apt-cancel-reason">
                                    <p>{appointmentData.cancellationReason}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            
            {/* Modal hủy cuộc hẹn */}
            {showCancelModal && (
                <div className="apt-modal-overlay">
                    <div className="apt-modal-content">
                        <div className="apt-modal-header">
                            <h3>Hủy cuộc hẹn</h3>
                        </div>
                        <div className="apt-modal-body">
                            <p>Vui lòng nhập lý do hủy cuộc hẹn:</p>
                            <Textarea
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="Nhập lý do hủy cuộc hẹn..."
                                className="apt-cancel-reason-input"
                                rows={4}
                            />
                        </div>
                        <div className="apt-modal-footer">
                            <Button
                                className="apt-button-secondary"
                                onClick={closeCancelModal}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                className="apt-button-danger"
                                onClick={confirmCancelAppointment}
                                disabled={!cancellationReason.trim()}
                            >
                                Xác nhận hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}