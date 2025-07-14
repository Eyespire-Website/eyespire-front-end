import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api'

// Lấy danh sách refunds đang pending
export const getPendingRefunds = async () => {
    try {
        const response = await axios.get(`${API_URL}/refunds/pending`)
        return response.data
    } catch (error) {
        console.error("Error fetching pending refunds:", error)
        throw error
    }
}

// Lấy lịch sử refunds của một user
export const getUserRefundHistory = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/refunds/user/${userId}`)
        return response.data
    } catch (error) {
        console.error("Error fetching user refund history:", error)
        throw error
    }
}

// Lấy tất cả refunds (cho admin)
export const getAllRefunds = async () => {
    try {
        const response = await axios.get(`${API_URL}/refunds`)
        return response.data
    } catch (error) {
        console.error("Error fetching all refunds:", error)
        throw error
    }
}

// Đánh dấu refund hoàn tất
export const completeRefund = async (refundId, completionData) => {
    try {
        const headers = {
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
        const response = await axios.post(`${API_URL}/refunds`, refundData)
        return response.data
    } catch (error) {
        console.error("Error creating refund:", error)
        throw error
    }
}

// Lấy chi tiết một refund
export const getRefundById = async (refundId) => {
    try {
        const response = await axios.get(`${API_URL}/refunds/${refundId}`)
        return response.data
    } catch (error) {
        console.error("Error fetching refund details:", error)
        throw error
    }
}

// Cập nhật thông tin refund
export const updateRefund = async (refundId, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/refunds/${refundId}`, updateData)
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
