import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        let token = null;
        
        // Lấy token từ đối tượng user nếu có
        if (user && user.token) {
            token = user.token;
        } else if (user && user.accessToken) {
            token = user.accessToken;
        } else {
            // Kiểm tra token riêng biệt (phòng trường hợp lưu riêng)
            token = localStorage.getItem("token");
        }
        
        console.log("Request Interceptor:", {
            user: user ? { id: user.id, role: user.role } : null,
            token: token ? `${token.substring(0, 10)}...` : null,
            url: config.url
        });
        
        if (user) {
            config.headers['User-Id'] = user.id;
        }
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn("No token found in user object or localStorage");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const medicalRecordService = {
    getProductsMedicine: async () => {
        try {
            const response = await axiosInstance.get('/medical-records/products-medicine');
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thuốc:', error.response?.data || error.message);
            throw error;
        }
    },

    getPatientsByDoctor: async (userId) => {
        try {
            console.log(`Fetching patients for userId: ${userId}`);
            const response = await axiosInstance.get(`/doctors/by-user/${userId}/patients`);
            console.log("Patients API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bệnh nhân:', error.response?.data || error.message);
            throw error;
        }
    },

    getAppointmentStatus: async (appointmentId) => {
        try {
            console.log(`Fetching status for appointmentId: ${appointmentId}`);
            const response = await axiosInstance.get(`/appointments/${appointmentId}/status`);
            console.log("Appointment Status Response:", response.data);
            return response.data.status;
        } catch (error) {
            console.error('Lỗi khi lấy trạng thái cuộc hẹn:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Không thể lấy trạng thái cuộc hẹn');
        }
    },

    createMedicalRecord: async (recordData, files) => {
        try {
            const formData = new FormData();
            formData.append('patientId', Number(recordData.patientId));
            formData.append('doctorId', Number(recordData.doctorId));
            formData.append('diagnosis', recordData.diagnosis.trim());
            formData.append('notes', recordData.notes || '');
            if (recordData.appointmentId && !isNaN(recordData.appointmentId)) {
                formData.append('appointmentId', Number(recordData.appointmentId));
            }
            if (recordData.productQuantities && recordData.productQuantities.length > 0) {
                const validProductQuantities = recordData.productQuantities.filter(pq => pq.productId > 0 && pq.quantity > 0);
                if (validProductQuantities.length > 0) {
                    formData.append('productQuantities', JSON.stringify(validProductQuantities));
                }
            }
            if (files && files.length > 0) {
                files.forEach((file, index) => {
                    if (file && file.size > 0) {
                        formData.append('files', file);
                    } else {
                        console.warn(`File at index ${index} is invalid or empty`);
                    }
                });
            }

            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await axiosInstance.post('/medical-records', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Create Medical Record Response:", response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo hồ sơ bệnh án:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    },

    getDoctorMedicalRecordsByUserId: async (userId) => {
        try {
            console.log(`Fetching medical records for userId: ${userId}`);
            const response = await axiosInstance.get(`/medical-records/doctor/${userId}`);
            console.log("Medical Records API Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hồ sơ bệnh án:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    getPatientMedicalRecords: async (patientId) => {
        try {
            console.log(`Fetching medical records for patient: ${patientId}`);
            const response = await axiosInstance.get(`/medical-records/patient/${patientId}`);
            console.log("Patient Medical Records API Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hồ sơ điều trị:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    getMedicalRecordById: async (recordId) => {
        try {
            console.log(`Fetching medical record with ID: ${recordId}`);
            const response = await axiosInstance.get(`/medical-records/${recordId}`);
            console.log("Medical Record Detail API Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết hồ sơ điều trị:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },


    checkMedicalRecordExistsByAppointmentId: async (appointmentId) => {
        try {
            console.log(`Checking medical record for appointmentId: ${appointmentId}`);
            const response = await axiosInstance.get(`/medical-records/by-appointment/${appointmentId}`);
            console.log(`Response for appointmentId ${appointmentId}:`, response.data);
            return response.data.exists;
        } catch (error) {
            console.error(`Error checking medical record for appointmentId ${appointmentId}:`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            if (error.response?.status === 404) {
                console.log(`No medical record found for appointmentId ${appointmentId}`);
                return false;
            } else if (error.response?.status === 401) {
                console.error("Unauthorized, redirecting to login");
                window.location.href = "/login";
                return false;
            } else if (error.response?.status === 403) {
                console.error("Forbidden: User lacks DOCTOR role");
                alert("Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản bác sĩ.");
                return false;
            }
            throw error;
        }
    },
    
    /**
     * Lấy thông tin chi tiết về thuốc từ hồ sơ y tế theo ID cuộc hẹn
     * Bao gồm thông tin về sản phẩm, số lượng và giá tiền
     */
    getMedicationsByAppointmentId: async (appointmentId) => {
        try {
            console.log(`Fetching medications for appointmentId: ${appointmentId}`);
            const response = await axiosInstance.get(`/medical-records/by-appointment/${appointmentId}/medications`);
            console.log("Medications API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin thuốc:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            if (error.response?.status === 404) {
                console.log(`No medications found for appointmentId ${appointmentId}`);
                return { products: [], totalAmount: 0 };
            }
            return { products: [], totalAmount: 0 };
        }
    }
};

export default medicalRecordService;