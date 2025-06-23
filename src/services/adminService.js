import axios from "axios"
const API_URL = "http://localhost:8080/api"

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})


const adminService = {
    // ==================== DOCTOR ENDPOINTS ====================

    // Lấy danh sách tất cả bác sĩ
    getAllDoctors: async () => {
        try {
            const response = await axiosInstance.get("/doctors")
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bác sĩ:", error)
            throw error
        }
    },

    // Lấy thông tin chi tiết bác sĩ theo ID
    getDoctorById: async (id) => {
        try {
            const response = await axiosInstance.get(`/doctors/${id}`)
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy thông tin bác sĩ:", error)
            throw error
        }
    },

    // Lấy danh sách bác sĩ theo chuyên khoa
    getDoctorsBySpecialty: async (specialtyId) => {
        try {
            const response = await axiosInstance.get(`/doctors/specialty/${specialtyId}`)
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bác sĩ theo chuyên khoa:", error)
            throw error
        }
    },

    // Lấy danh sách khung giờ trống của bác sĩ theo ngày
    getAvailableTimeSlots: async (doctorId, date) => {
        try {
            const response = await axiosInstance.get(`/doctors/${doctorId}/available-slots`, {
                params: { date: date },
            })
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy khung giờ trống:", error)
            throw error
        }
    },

    // Kiểm tra bác sĩ có khả dụng trong khung giờ cụ thể không
    checkDoctorAvailability: async (doctorId, date, time) => {
        try {
            const response = await axiosInstance.get(`/doctors/${doctorId}/check-availability`, {
                params: { date: date, time: time },
            })
            return response.data.available
        } catch (error) {
            console.error("Lỗi khi kiểm tra khả dụng của bác sĩ:", error)
            throw error
        }
    },

    // ==================== APPOINTMENT ENDPOINTS ====================

    // Tạo cuộc hẹn mới
    createAppointment: async (appointmentData) => {
        try {
            const payload = {
                doctorId: Number.parseInt(appointmentData.doctorId),
                patientName: appointmentData.patient,
                patientPhone: appointmentData.phone,
                appointmentDate: appointmentData.date,
                appointmentTime: appointmentData.time,
                service: appointmentData.service,
                status: appointmentData.status.toUpperCase(),
                duration: Number.parseInt(appointmentData.duration),
                notes: appointmentData.notes || "",
            }

            const response = await axiosInstance.post("/appointments", payload)
            return response.data
        } catch (error) {
            console.error("Lỗi khi tạo cuộc hẹn:", error)
            throw error
        }
    },

    // Cập nhật cuộc hẹn
    updateAppointment: async (id, appointmentData) => {
        try {
            const payload = {
                doctorId: Number.parseInt(appointmentData.doctorId),
                patientName: appointmentData.patient,
                patientPhone: appointmentData.phone,
                appointmentDate: appointmentData.date,
                appointmentTime: appointmentData.time,
                service: appointmentData.service,
                status: appointmentData.status.toUpperCase(),
                duration: Number.parseInt(appointmentData.duration),
                notes: appointmentData.notes || "",
            }

            const response = await axiosInstance.put(`/appointments/${id}`, payload)
            return response.data
        } catch (error) {
            console.error("Lỗi khi cập nhật cuộc hẹn:", error)
            throw error
        }
    },

    // Xóa cuộc hẹn
    deleteAppointment: async (id) => {
        try {
            const response = await axiosInstance.delete(`/appointments/${id}`)
            return response.data
        } catch (error) {
            console.error("Lỗi khi xóa cuộc hẹn:", error)
            throw error
        }
    },

    // Lấy danh sách cuộc hẹn theo ngày
    getAppointmentsByDate: async (date) => {
        try {
            const response = await axiosInstance.get("/appointments", {
                params: { date: date },
            })
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cuộc hẹn theo ngày:", error)
            throw error
        }
    },

    // Lấy danh sách cuộc hẹn theo bác sĩ và ngày
    getAppointmentsByDoctorAndDate: async (doctorId, date) => {
        try {
            const response = await axiosInstance.get("/appointments", {
                params: { doctorId: doctorId, date: date },
            })
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cuộc hẹn theo bác sĩ và ngày:", error)
            throw error
        }
    },

    // Lấy tất cả cuộc hẹn
    getAllAppointments: async () => {
        try {
            const response = await axiosInstance.get("/appointments")
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy tất cả cuộc hẹn:", error)
            throw error
        }
    },

    // Cập nhật trạng thái cuộc hẹn
    updateAppointmentStatus: async (id, status) => {
        try {
            const response = await axiosInstance.patch(`/appointments/${id}/status`, {
                status: status.toUpperCase(),
            })
            return response.data
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái cuộc hẹn:", error)
            throw error
        }
    },

    // Lấy danh sách cuộc hẹn theo bệnh nhân
    getAppointmentsByPatientId: async (patientId) => {
        try {
            const response = await axiosInstance.get(`/appointments/patient/${patientId}`)
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cuộc hẹn theo bệnh nhân:", error)
            throw error
        }
    },

    // Hủy cuộc hẹn
    cancelAppointment: async (appointmentId) => {
        try {
            const response = await axiosInstance.put(`/appointments/${appointmentId}/cancel`)
            return response.data
        } catch (error) {
            console.error("Lỗi khi hủy cuộc hẹn:", error)
            throw error
        }
    },

    // ==================== AVAILABILITY ENDPOINTS ====================

    // Tạo lịch làm việc mới cho bác sĩ
    createDoctorAvailability: async (availabilityData) => {
        try {
            const payload = {
                doctorId: Number.parseInt(availabilityData.doctorId),
                date: availabilityData.date,
                startTime: availabilityData.startTime,
                endTime: availabilityData.endTime,
                status: availabilityData.status,
                notes: availabilityData.notes || "",
            }

            const response = await axiosInstance.post("/doctors/availability", payload)
            return response.data
        } catch (error) {
            console.error("Lỗi khi tạo lịch làm việc:", error)
            throw error
        }
    },

    // Cập nhật lịch làm việc
    updateDoctorAvailability: async (id, availabilityData) => {
        try {
            const payload = {
                doctorId: Number.parseInt(availabilityData.doctorId),
                date: availabilityData.date,
                startTime: availabilityData.startTime,
                endTime: availabilityData.endTime,
                status: availabilityData.status,
                notes: availabilityData.notes || "",
            }

            const response = await axiosInstance.put(`/doctors/availability/${id}`, payload)
            return response.data
        } catch (error) {
            console.error("Lỗi khi cập nhật lịch làm việc:", error)
            throw error
        }
    },

    // Xóa lịch làm việc
    deleteDoctorAvailability: async (id) => {
        try {
            const response = await axiosInstance.delete(`/doctors/availability/${id}`)
            return response.data
        } catch (error) {
            console.error("Lỗi khi xóa lịch làm việc:", error)
            throw error
        }
    },

    // Lấy lịch làm việc theo bác sĩ và ngày
    getDoctorAvailability: async (doctorId, date) => {
        try {
            const response = await axiosInstance.get("/doctors/availability", {
                params: { doctorId: doctorId, date: date },
            })
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy lịch làm việc:", error)
            throw error
        }
    },

    // Lấy tất cả lịch làm việc
    getAllAvailabilities: async () => {
        try {
            const response = await axiosInstance.get("/doctors/availability")
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy tất cả lịch làm việc:", error)
            throw error
        }
    },

    // ==================== SPECIALTY ENDPOINTS ====================

    // Lấy danh sách chuyên khoa
    getAllSpecialties: async () => {
        try {
            const response = await axiosInstance.get("/specialties")
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chuyên khoa:", error)
            throw error
        }
    },

    // Lấy dịch vụ y tế
    getMedicalServices: async () => {
        try {
            const response = await axiosInstance.get("/medical-services")
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy danh sách dịch vụ y tế:", error)
            throw error
        }
    },

    // ==================== STATISTICS ENDPOINTS ====================

    // Lấy thống kê tổng quan
    getDashboardStats: async () => {
        try {
            const response = await axiosInstance.get("/admin/dashboard/stats")
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy thống kê tổng quan:", error)
            throw error
        }
    },

    // Lấy thống kê cuộc hẹn theo ngày
    getAppointmentStatsByDate: async (startDate, endDate) => {
        try {
            const response = await axiosInstance.get("/admin/appointments/stats", {
                params: { startDate: startDate, endDate: endDate },
            })
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy thống kê cuộc hẹn:", error)
            throw error
        }
    },

    // Lấy thống kê bác sĩ
    getDoctorStats: async (doctorId, startDate, endDate) => {
        try {
            const response = await axiosInstance.get(`/admin/doctors/${doctorId}/stats`, {
                params: { startDate: startDate, endDate: endDate },
            })
            return response.data
        } catch (error) {
            console.error("Lỗi khi lấy thống kê bác sĩ:", error)
            throw error
        }
    },

    // ==================== UTILITY METHODS ====================

    // Format date cho API
    formatDate: (date) => {
        if (date instanceof Date) {
            return date.toISOString().split("T")[0]
        }
        return date
    },

    // Format time cho API
    formatTime: (time) => {
        if (time && time.length === 5) {
            return time
        }
        return time
    },

    // Validate appointment data trước khi gửi API
    validateAppointmentData: (data) => {
        const errors = []

        if (!data.doctorId) errors.push("Doctor ID is required")
        if (!data.patient) errors.push("Patient name is required")
        if (!data.phone) errors.push("Phone number is required")
        if (!data.date) errors.push("Date is required")
        if (!data.time) errors.push("Time is required")
        if (!data.service) errors.push("Service is required")

        // Validate phone number format
        if (data.phone && !/^\d{10}$/.test(data.phone.replace(/[^0-9]/g, ""))) {
            errors.push("Invalid phone number format")
        }

        // Validate date is not in the past
        if (data.date) {
            const appointmentDate = new Date(data.date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (appointmentDate < today) {
                errors.push("Appointment date cannot be in the past")
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        }
    },

    // Validate availability data
    validateAvailabilityData: (data) => {
        const errors = []

        if (!data.doctorId) errors.push("Doctor ID is required")
        if (!data.date) errors.push("Date is required")
        if (!data.startTime) errors.push("Start time is required")
        if (!data.endTime) errors.push("End time is required")
        if (!data.status) errors.push("Status is required")

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (data.startTime && !timeRegex.test(data.startTime)) {
            errors.push("Invalid start time format")
        }
        if (data.endTime && !timeRegex.test(data.endTime)) {
            errors.push("Invalid end time format")
        }

        // Validate start time is before end time
        if (data.startTime && data.endTime) {
            const startMinutes =
                Number.parseInt(data.startTime.split(":")[0]) * 60 + Number.parseInt(data.startTime.split(":")[1])
            const endMinutes = Number.parseInt(data.endTime.split(":")[0]) * 60 + Number.parseInt(data.endTime.split(":")[1])
            if (startMinutes >= endMinutes) {
                errors.push("Start time must be before end time")
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        }
    },
}

export default adminService
