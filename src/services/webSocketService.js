import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const webSocketService = {
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
};

export default webSocketService;