import axios from 'axios';

const API_URL = 'https://eyespire-back-end.onrender.com/api';

const webSocketService = {
    // Lấy tất cả tin nhắn của user
    getMessages: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/messages/${userId}`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    // Gửi tin nhắn
    sendMessage: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Đánh dấu tin nhắn đã đọc
    markMessageAsRead: async (messageId) => {
        try {
            const response = await axios.put(`${API_URL}/messages/${messageId}/read`, null, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            return response.data;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    },

    // Lấy danh sách store managers từ database
    getStoreManagers: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/staff`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            
            // Lọc chỉ lấy store managers và map fields
            const storeManagers = response.data
                .filter(staff => staff.role === 'STORE_MANAGER' && staff.status === 'active')
                .map(staff => ({
                    id: staff.id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    avatarUrl: staff.avatar_url,
                    status: staff.status
                }));
            
            return storeManagers;
        } catch (error) {
            console.error('Error fetching store managers:', error);
            throw error;
        }
    },

    // Lấy danh sách receptionists từ database
    getReceptionists: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/staff`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            
            // Lọc chỉ lấy receptionists và map fields
            const receptionists = response.data
                .filter(staff => staff.role === 'RECEPTIONIST' && staff.status === 'active')
                .map(staff => ({
                    id: staff.id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    avatarUrl: staff.avatar_url,
                    status: staff.status
                }));
            
            return receptionists;
        } catch (error) {
            console.error('Error fetching receptionists:', error);
            throw error;
        }
    },

    // Lấy danh sách tất cả staff (store managers + receptionists) để nhắn tin
    getAllStaff: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/staff`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            
            // Lọc lấy cả store managers và receptionists
            const allStaff = response.data
                .filter(staff => 
                    (staff.role === 'STORE_MANAGER' || staff.role === 'RECEPTIONIST') && 
                    staff.status === 'active'
                )
                .map(staff => ({
                    id: staff.id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    avatarUrl: staff.avatar_url,
                    status: staff.status
                }));
            
            return allStaff;
        } catch (error) {
            console.error('Error fetching all staff:', error);
            // Fallback data nếu API chưa sẵn sàng
            return [
                {
                    id: 1,
                    name: 'Trần Đình Duy Phương',
                    email: 'phuong3dong@gmail.com',
                    role: 'STORE_MANAGER',
                    avatarUrl: null,
                    status: 'active'
                },
                {
                    id: 2,
                    name: 'Nguyễn Thị Lan',
                    email: 'lan.receptionist@eyespire.com',
                    role: 'RECEPTIONIST',
                    avatarUrl: null,
                    status: 'active'
                }
            ];
        }
    },

    // Lấy conversation giữa user và store manager
    getConversation: async (storeManagerId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.get(`${API_URL}/messages/${user.id}`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            
            // Lọc tin nhắn chỉ giữa user và store manager
            const allMessages = response.data || [];
            const conversationMessages = allMessages.filter(message => 
                (message.sender.id === user.id && message.receiver.id === storeManagerId) ||
                (message.sender.id === storeManagerId && message.receiver.id === user.id)
            );
            
            // Sắp xếp theo thời gian
            return conversationMessages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return [];
        }
    },

    // Lấy số lượng tin nhắn chưa đọc
    getUnreadMessageCount: async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.get(`${API_URL}/messages/unread-count/${user.id}`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            return response.data.count || 0;
        } catch (error) {
            console.error('Error fetching unread message count:', error);
            return 0;
        }
    },

    // Lấy danh sách patients cho receptionist
    getPatients: async () => {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            
            // Lọc chỉ lấy patients (role = 'CUSTOMER') và map fields
            const patients = response.data
                .filter(user => user.role === 'CUSTOMER' && user.status !== 'INACTIVE')
                .map(user => ({
                    id: user.id,
                    name: user.name || user.username,
                    email: user.email,
                    role: user.role,
                    avatarUrl: user.avatar_url,
                    status: user.status || 'offline',
                    phone: user.phone
                }));
            
            return patients;
        } catch (error) {
            console.error('Error fetching patients:', error);
            // Fallback data nếu API chưa sẵn sàng
            return [
                {
                    id: 1,
                    name: 'Nguyễn Văn A',
                    email: 'nguyenvana@example.com',
                    role: 'CUSTOMER',
                    avatarUrl: null,
                    status: 'online',
                    phone: '0123456789'
                },
                {
                    id: 2,
                    name: 'Trần Thị B',
                    email: 'tranthib@example.com',
                    role: 'CUSTOMER',
                    avatarUrl: null,
                    status: 'offline',
                    phone: '0987654321'
                }
            ];
        }
    },

    // Lấy conversation giữa receptionist và patient
    getPatientConversation: async (patientId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.get(`${API_URL}/messages/conversation/${user.id}/${patientId}`, {
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching patient conversation:', error);
            return [];
        }
    },
};

export default webSocketService;