import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        let token = null;

        if (user && user.token) {
            token = user.token;
        } else if (user && user.accessToken) {
            token = user.accessToken;
        } else {
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
        console.error("Request Interceptor Error:", error);
        return Promise.reject(error);
    }
);

const medicalRecordService = {
    getProductsMedicine: async () => {
        try {
            const response = await axiosInstance.get('/medical-records/products-medicine');
            console.log("Products Medicine Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thuốc:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    getPatientsByDoctor: async (userId) => {
        try {
            console.log(`Fetching patients for userId: ${userId}`);
            const response = await axiosInstance.get(`/doctors/by-user/${userId}/patients`);
            console.log("Patients API Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bệnh nhân:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    getAppointmentStatus: async (appointmentId) => {
        try {
            console.log(`Fetching status for appointmentId: ${appointmentId}`);
            const response = await axiosInstance.get(`/appointments/${appointmentId}/status`);
            console.log("Appointment Status Response:", JSON.stringify(response.data, null, 2));
            return response.data.status;
        } catch (error) {
            console.error('Lỗi khi lấy trạng thái cuộc hẹn:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(error.response?.data?.message || 'Không thể lấy trạng thái cuộc hẹn');
        }
    },

    createMedicalRecord: async (recordData, files) => {
        try {
            console.log("Creating Medical Record with data:", JSON.stringify(recordData, null, 2));
            const formData = new FormData();
            formData.append('patientId', Number(recordData.patientId));
            formData.append('doctorId', Number(recordData.doctorId));
            formData.append('diagnosis', recordData.diagnosis?.trim() || 'Chưa cập nhật');
            formData.append('notes', recordData.notes || '');
            if (recordData.appointmentId && !isNaN(recordData.appointmentId)) {
                formData.append('appointmentId', Number(recordData.appointmentId));
            }
            if (recordData.serviceId && !isNaN(recordData.serviceId)) {
                formData.append('serviceId', Number(recordData.serviceId));
            }
            if (recordData.productQuantities && recordData.productQuantities.length > 0) {
                const validProductQuantities = recordData.productQuantities.filter(pq =>
                    pq.productId > 0 && pq.quantity > 0 && Number.isInteger(pq.productId) && Number.isInteger(pq.quantity)
                );
                console.log("Valid Product Quantities:", JSON.stringify(validProductQuantities, null, 2));
                if (validProductQuantities.length > 0) {
                    formData.append('productQuantities', JSON.stringify(validProductQuantities));
                } else {
                    console.warn("No valid product quantities after filtering");
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
                console.log(`${key}: ${value instanceof File ? value.name : value}`);
            }

            const response = await axiosInstance.post('/medical-records', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Create Medical Record Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo hồ sơ bệnh án:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(error.response?.data?.message || 'Lỗi không xác định');
        }
    },

    // NEW: JSON-based create medical record (UTF-8 safe)
    createMedicalRecordJson: async (recordData) => {
        try {
            console.log("[JSON] Creating Medical Record with data:", JSON.stringify(recordData, null, 2));
            
            // Prepare JSON payload
            const payload = {
                patientId: Number(recordData.patientId),
                doctorId: Number(recordData.doctorId),
                diagnosis: recordData.diagnosis?.trim() || 'Chưa cập nhật',
                notes: recordData.notes?.trim() || '',
                appointmentId: recordData.appointmentId && !isNaN(recordData.appointmentId) ? Number(recordData.appointmentId) : null,
                serviceIds: recordData.serviceId && !isNaN(recordData.serviceId) ? [Number(recordData.serviceId)] : [],
                productQuantities: []
            };

            // Keep productQuantities as array format for backend compatibility
            if (recordData.productQuantities && recordData.productQuantities.length > 0) {
                const validProductQuantities = recordData.productQuantities.filter(pq =>
                    pq.productId > 0 && pq.quantity > 0 && Number.isInteger(pq.productId) && Number.isInteger(pq.quantity)
                ).map(pq => ({
                    productId: Number(pq.productId),
                    quantity: Number(pq.quantity)
                }));
                console.log("[JSON] Valid Product Quantities:", JSON.stringify(validProductQuantities, null, 2));
                
                payload.productQuantities = validProductQuantities;
            }

            console.log("[JSON] Final payload:", JSON.stringify(payload, null, 2));

            const response = await axiosInstance.post('/medical-records/json', payload);
            console.log("[JSON] Create Medical Record Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('[JSON] Lỗi khi tạo hồ sơ bệnh án:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(error.response?.data?.message || 'Lỗi không xác định');
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
            console.log(`Response for appointmentId ${appointmentId}:`, JSON.stringify(response.data, null, 2));
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
            }
            throw error;
        }
    },

    getMedicalRecordByAppointmentId: async (appointmentId) => {
        try {
            console.log(`Fetching medical record for appointmentId: ${appointmentId}`);
            const response = await axiosInstance.get(`/medical-records/by-appointment/${appointmentId}/record`);
            console.log("Medical Record by Appointment API Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy hồ sơ bệnh án theo appointmentId:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    updateMedicalRecord: async (recordId, updatedData) => {
        try {
            if (!recordId || !updatedData) {
                throw new Error("Thiếu recordId hoặc updatedData");
            }

            console.log(`Updating medical record with ID: ${recordId}`, JSON.stringify(updatedData, null, 2));

            // Construct FormData
            const formData = new FormData();

            // Append diagnosis (ensure it's never null or empty)
            if (!updatedData.diagnosis?.trim()) {
                throw new Error("Chẩn đoán không được để trống");
            }
            formData.append("diagnosis", updatedData.diagnosis.trim());

            // Append notes (ensure it's never null)
            formData.append("notes", updatedData.notes?.trim() || "");

            // Append serviceId if provided and valid
            if (updatedData.serviceId && !isNaN(updatedData.serviceId) && Number(updatedData.serviceId) > 0) {
                formData.append("serviceId", Number(updatedData.serviceId));
            }

            // Append productQuantities if provided and not empty
            if (updatedData.recommendedProducts && updatedData.recommendedProducts.length > 0) {
                const validProductQuantities = updatedData.recommendedProducts
                    .filter(pq =>
                        pq.productId > 0 &&
                        pq.quantity > 0 &&
                        Number.isInteger(Number(pq.productId)) &&
                        Number.isInteger(Number(pq.quantity))
                    )
                    .map(pq => ({
                        productId: Number(pq.productId),
                        quantity: Number(pq.quantity),
                    }));
                console.log("Valid Product Quantities for update:", JSON.stringify(validProductQuantities, null, 2));
                if (validProductQuantities.length > 0) {
                    formData.append("productQuantities", JSON.stringify(validProductQuantities));
                } else {
                    console.warn("No valid product quantities for update after filtering");
                }
            }

            // Append files if provided
            if (updatedData.files && updatedData.files.length > 0) {
                updatedData.files.forEach((file, index) => {
                    if (file && file.size > 0) {
                        formData.append("files", file);
                    } else {
                        console.warn(`File at index ${index} is invalid or empty`);
                    }
                });
            }

            // Append filesToDelete if provided
            if (updatedData.filesToDelete && updatedData.filesToDelete.length > 0) {
                console.log("Files to Delete:", JSON.stringify(updatedData.filesToDelete, null, 2));
                formData.append("filesToDelete", JSON.stringify(updatedData.filesToDelete));
            }

            // Log FormData entries
            console.log("FormData entries:");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? value.name : value}`);
            }

            // Send request
            const response = await axiosInstance.put(`/medical-records/${recordId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Update Medical Record Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ bệnh án:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định');
        }
    },

    updateMedicalRecordJson: async (recordId, updatedData) => {
        try {
            if (!recordId || !updatedData) {
                throw new Error("Thiếu recordId hoặc updatedData");
            }

            console.log(`[JSON] Updating medical record with ID: ${recordId}`, JSON.stringify(updatedData, null, 2));

            // Prepare JSON payload
            const payload = {
                diagnosis: updatedData.diagnosis?.trim() || '',
                notes: updatedData.notes?.trim() || '',
                serviceIds: updatedData.serviceId && !isNaN(updatedData.serviceId) && Number(updatedData.serviceId) > 0 ? [Number(updatedData.serviceId)] : [],
                productQuantities: []
            };

            // Validation
            if (!payload.diagnosis) {
                throw new Error("Chẩn đoán không được để trống");
            }

            // Keep productQuantities as array format for backend compatibility
            if (updatedData.recommendedProducts && updatedData.recommendedProducts.length > 0) {
                const validProductQuantities = updatedData.recommendedProducts
                    .filter(pq =>
                        pq.productId > 0 &&
                        pq.quantity > 0 &&
                        Number.isInteger(Number(pq.productId)) &&
                        Number.isInteger(Number(pq.quantity))
                    )
                    .map(pq => ({
                        productId: Number(pq.productId),
                        quantity: Number(pq.quantity)
                    }));
                console.log("[JSON] Valid Product Quantities for update:", JSON.stringify(validProductQuantities, null, 2));
                
                payload.productQuantities = validProductQuantities;
            }

            console.log("[JSON] Final update payload:", JSON.stringify(payload, null, 2));

            // Send request
            const response = await axiosInstance.put(`/medical-records/${recordId}/json`, payload);
            console.log("[JSON] Update Medical Record Response:", JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error("[JSON] Lỗi khi cập nhật hồ sơ bệnh án:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định');
        }
    },

    getMedicationsByAppointmentId: async (appointmentId) => {
        try {
            console.log(`Fetching medications for appointmentId: ${appointmentId}`);
            const response = await axiosInstance.get(`/medical-records/by-appointment/${appointmentId}/medications`);
            console.log("Medications API Response:", JSON.stringify(response.data, null, 2));
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
            throw error;
        }
    }
};

export default medicalRecordService;