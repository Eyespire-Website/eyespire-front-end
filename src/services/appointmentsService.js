import axios from "axios"

const API_URL = "http://localhost:8080/api"

export const getAllAppointments = async () => {
    try {
        const response = await axios.get(`${API_URL}/appointments`)
        return response.data.map((appointment) => ({
            id: appointment.id,
            serviceId: appointment.serviceId,
            doctorId: appointment.doctorId,
            appointmentDate: appointment.appointmentDate || "N/A",
            timeSlot: appointment.timeSlot || "N/A",
            status: appointment.status || "UNKNOWN",
            notes: appointment.notes || "",
            patientName: appointment.patientName || "Unknown",
            patientEmail: appointment.patientEmail || "",
            patientPhone: appointment.patientPhone || "",
            patient: {
                id: appointment.patient?.id || null,
                name: appointment.patient?.name || appointment.patientName || "Unknown",
                email: appointment.patient?.email || appointment.patientEmail || "",
                phone: appointment.patient?.phone || appointment.patientPhone || "",
                province: appointment.patient?.province || "",
                district: appointment.patient?.district || "",
                ward: appointment.patient?.ward || "",
                addressDetail: appointment.patient?.addressDetail || "",
                village: appointment.patient?.village || "",
                dateOfBirth: appointment.patient?.dateOfBirth || "",
                gender: appointment.patient?.gender || "",
            },
        }))
    } catch (error) {
        console.error("Error fetching appointments:", error)
        throw error
    }
}

// Updated to use the full appointment update endpoint
export const updateAppointment = async (id, appointmentData) => {
    try {
        const response = await axios.put(`${API_URL}/appointments/${id}`, appointmentData)
        return response.data
    } catch (error) {
        console.error("Error updating appointment:", error)
        if (error.response) {
            console.error("Error response:", error.response.data)
            throw new Error(error.response.data || "Failed to update appointment")
        }
        throw error
    }
}


// Separate function for status-only updates
export const updateAppointmentStatus = async (id, status) => {
    try {
        const response = await axios.put(`${API_URL}/appointments/${id}/status`, { status })
        return response.data
    } catch (error) {
        console.error("Error updating appointment status:", error)
        throw error
    }
}

// New function to unconfirm appointment (change from CONFIRMED back to PENDING)
export const unconfirmAppointment = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/appointments/${id}/status`, { status: "PENDING" })
        return response.data
    } catch (error) {
        console.error("Error unconfirming appointment:", error)
        throw error
    }
}

export const createAppointment = async (appointmentData) => {
    try {
        const response = await axios.post(`${API_URL}/appointments`, appointmentData)
        return response.data
    } catch (error) {
        console.error("Error creating appointment:", error)
        throw error
    }
}

export const cancelAppointment = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/appointments/${id}/cancel`)
        return response.data
    } catch (error) {
        console.error("Error cancelling appointment:", error)
        throw error
    }
}

export const getAllServices = async () => {
    try {
        const response = await axios.get(`${API_URL}/medical-services`)
        return response.data.map((service) => ({
            id: service.id,
            name: service.name,
        }))
    } catch (error) {
        console.error("Error fetching services:", error)
        throw error
    }
}

export const getAllDoctors = async () => {
    try {
        const response = await axios.get(`${API_URL}/doctors`)
        return response.data.map((doctor) => ({
            id: doctor.id,
            name: doctor.name,
        }))
    } catch (error) {
        console.error("Error fetching doctors:", error)
        throw error
    }
}

export const getAvailableTimeSlots = async (doctorId, date) => {
    try {
        const response = await axios.get(`${API_URL}/doctors/${doctorId}/available-slots`, {
            params: { date },
        })
        const slots = Array.isArray(response.data) ? response.data.filter((slot) => slot && typeof slot === "object") : []
        return slots.length > 0
            ? slots
            : [
                { time: "08:00", startTime: "08:00:00", endTime: "09:00:00", status: "AVAILABLE" },
                { time: "09:00", startTime: "09:00:00", endTime: "10:00:00", status: "AVAILABLE" },
                { time: "10:00", startTime: "10:00:00", endTime: "11:00:00", status: "AVAILABLE" },
                { time: "11:00", startTime: "11:00:00", endTime: "12:00:00", status: "AVAILABLE" },
                { time: "12:00", startTime: "12:00:00", endTime: "13:00:00", status: "UNAVAILABLE" },
                { time: "13:00", startTime: "13:00:00", endTime: "14:00:00", status: "AVAILABLE" },
                { time: "14:00", startTime: "14:00:00", endTime: "15:00:00", status: "AVAILABLE" },
                { time: "15:00", startTime: "15:00:00", endTime: "16:00:00", status: "AVAILABLE" },
                { time: "16:00", startTime: "16:00:00", endTime: "17:00:00", status: "UNAVAILABLE" },
            ]
    } catch (error) {
        console.error("Error fetching available time slots:", error)
    }
}

export const getAvailableDoctorsForDate = async (date) => {
    try {
        const response = await axios.get(`${API_URL}/doctors/available`, {
            params: { date },
        })
        return Array.isArray(response.data) ? response.data.map(doctor => ({
            id: doctor.id,
            name: doctor.name
        })) : []
    } catch (error) {
        console.error("Error fetching available doctors for date:", error)
        // Fallback to getting all doctors if the endpoint isn't implemented yet
        try {
            const allDoctors = await getAllDoctors()
            return allDoctors
        } catch (innerError) {
            console.error("Error fetching fallback doctors:", innerError)
            return []
        }
    }
}

// Lấy thông tin hóa đơn của cuộc hẹn
export const getAppointmentInvoice = async (appointmentId) => {
    try {
        const response = await axios.get(`${API_URL}/appointments/${appointmentId}/invoice`)
        return response.data
    } catch (error) {
        console.error("Error fetching appointment invoice:", error)
        throw error
    }
}

// Lấy danh sách các cuộc hẹn đang chờ thanh toán
export const getWaitingPaymentAppointments = async () => {
    try {
        const response = await axios.get(`${API_URL}/appointments/waiting-payment`)
        return response.data.map((appointment) => ({
            id: appointment.id,
            serviceId: appointment.serviceId,
            doctorId: appointment.doctorId,
            appointmentDate: appointment.appointmentDate || "N/A",
            timeSlot: appointment.timeSlot || "N/A",
            status: appointment.status || "UNKNOWN",
            notes: appointment.notes || "",
            patientName: appointment.patientName || "Unknown",
            patientEmail: appointment.patientEmail || "",
            patientPhone: appointment.patientPhone || "",
            patient: {
                id: appointment.patient?.id || null,
                name: appointment.patient?.name || appointment.patientName || "Unknown",
                email: appointment.patient?.email || appointment.patientEmail || "",
                phone: appointment.patient?.phone || appointment.patientPhone || "",
            },
            invoice: appointment.invoice || null,
        }))
    } catch (error) {
        console.error("Error fetching waiting payment appointments:", error)
        throw error
    }
}

// Xác nhận thanh toán cho cuộc hẹn
export const markAppointmentAsPaid = async (appointmentId, paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/appointments/${appointmentId}/mark-paid`, paymentData)
        return response.data
    } catch (error) {
        console.error("Error marking appointment as paid:", error)
        throw error
    }
}
