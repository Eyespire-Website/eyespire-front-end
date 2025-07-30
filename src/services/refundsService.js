
import axios from 'axios'

const API_URL = "https://eyespire-back-end.onrender.com/api"

// Hàm tiện ích để lấy headers xác thực
const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    
    const headers = {
        'Content-Type': 'application/json'
    }
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    
    if (userId) {
        headers['X-User-ID'] = userId
    }
    
    return headers
}

// Lấy danh sách refunds đang pending
export const getPendingRefunds = async () => {
    try {
        const response = await axios.get(`${API_URL}/refunds/pending`, { headers: getAuthHeaders() })
        return response.data
    } catch (error) {
        console.error("Error fetching pending refunds:", error)
        throw error
    }
}

// Lấy lịch sử refunds của một user
export const getUserRefundHistory = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/refunds/user/${userId}`, { headers: getAuthHeaders() })
        return response.data
    } catch (error) {
        console.error("Error fetching user refund history:", error)
        throw error
    }
}

// Lấy tất cả refunds (cho admin)
export const getAllRefunds = async () => {
    try {
        const response = await axios.get(`${API_URL}/refunds`, { headers: getAuthHeaders() })
        return response.data
    } catch (error) {
        console.error("Error fetching all refunds:", error)
        throw error
    }
}

// Đánh dấu refund hoàn tất
export const completeRefund = async (refundId, completionData) => {
    try {
        // Kết hợp headers xác thực và headers cụ thể cho API này
        const authHeaders = getAuthHeaders();
        const headers = {
            ...authHeaders,
            'X-User-Name': completionData.completedBy || 'Unknown',
            'X-User-Role': completionData.completedByRole || 'RECEPTIONIST'
        };
        
        const requestBody = {
            refundMethod: completionData.refundMethod || 'CASH',
            notes: completionData.notes || 'Hoàn tiền thủ công'
        };
        
        const response = await axios.put(`${API_URL}/refunds/${refundId}/complete`, requestBody, { headers })
        return response.data
    } catch (error) {
        console.error("Error completing refund:", error)
        throw error
    }
}

// Tạo refund mới (khi hủy appointment)
export const createRefund = async (refundData) => {
    try {
        const response = await axios.post(`${API_URL}/refunds`, refundData, { headers: getAuthHeaders() })
        return response.data
    } catch (error) {
        console.error("Error creating refund:", error)
        throw error
    }
}

// Lấy chi tiết một refund
export const getRefundById = async (refundId) => {
    try {
        const response = await axios.get(`${API_URL}/refunds/${refundId}`, { headers: getAuthHeaders() })
        return response.data
    } catch (error) {
        console.error("Error fetching refund details:", error)
        throw error
    }
}

// Cập nhật thông tin refund
export const updateRefund = async (refundId, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/refunds/${refundId}`, updateData, { headers: getAuthHeaders() })
        return response.data
    } catch (error) {
        console.error("Error updating refund:", error)
        throw error
    }
}

// Lấy thống kê refunds
export const getRefundStats = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${API_URL}/refunds/stats`, {
            headers: getAuthHeaders(),
            params: { startDate, endDate }
        })
        return response.data
    } catch (error) {
        console.error("Error fetching refund stats:", error)
        throw error
    }
}

export default {
    getPendingRefunds,
    getUserRefundHistory,
    getAllRefunds,
    completeRefund,
    createRefund,
    getRefundById,
    updateRefund,
    getRefundStats
}
