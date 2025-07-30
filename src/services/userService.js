import axios from "axios";
import authService from "./authService";

const API_URL = "https://eyespire-back-end.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
      const user = authService.getCurrentUser();
      if (user) {
        config.headers["User-Id"] = user.id;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
);

const userService = {
  getCurrentUserInfo: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const response = await axiosInstance.get(`/users/${currentUser.id}`);
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          ...response.data,
          isGoogleAccount:
              response.data.isGoogleAccount !== undefined
                  ? response.data.isGoogleAccount
                  : currentUser.isGoogleAccount,
        };
        console.log("Cập nhật user trong localStorage:", updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      throw error;
    }
  },

  getDoctorByUserId: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const response = await axiosInstance.get(`/doctors/by-user/${currentUser.id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin bác sĩ:", error);
      if (error.response?.status === 404) {
        return null; // Doctor not found
      }
      throw error;
    }
  },

  getSpecialties: async () => {
    try {
      const response = await axiosInstance.get("/specialties");
      console.log("Danh sách chuyên khoa:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const response = await axiosInstance.put(`/users/${currentUser.id}`, userData);
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          ...response.data,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      throw error;
    }
  },

  // Lấy thông tin doctor từ doctors table
  getDoctorInfo: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const response = await axiosInstance.get(`/doctors/by-user/${currentUser.id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin doctor:", error);
      return null; // Return null nếu không tìm thấy doctor
    }
  },

  updateDoctorProfile: async (doctorData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      const userData = {
        name: doctorData.fullname,
        phone: doctorData.phone,
        gender: doctorData.gender?.toUpperCase() || "MALE",
        username: doctorData.username,
        birthdate: doctorData.birthdate,
        provinceCode: doctorData.provinceCode,
        wardCode: doctorData.wardCode,
        address: doctorData.address
      };

      const doctorEntityData = {
        id: currentUser.id, // Will be updated if existing doctor is found
        userId: currentUser.id,
        name: doctorData.fullname || currentUser.name,
        specialization: doctorData.specialization || "",
        qualification: doctorData.licenseNumber || "",
        experience: doctorData.experience || "",
        description: doctorData.bio || "",
        specialtyId: parseInt(doctorData.specialtyId) || null,
        imageUrl: doctorData.imageUrl || null,
      };
      
      console.log("=== EXPERIENCE DEBUG ===");
      console.log("doctorData.experience (raw):", doctorData.experience);
      console.log("doctorData.experience (type):", typeof doctorData.experience);
      console.log("Final experience value:", doctorEntityData.experience);

      console.log("=== DOCTOR PROFILE UPDATE DEBUG ===");
      console.log("Original doctorData:", doctorData);
      console.log("User payload:", userData);
      console.log("Doctor payload:", doctorEntityData);

      const userResponse = await axiosInstance.put(`/users/${currentUser.id}`, userData);

      let doctorResponse;
      const existingDoctor = await userService.getDoctorByUserId();
      if (existingDoctor) {
        console.log("Updating existing doctor record with id:", existingDoctor.id);
        doctorEntityData.id = existingDoctor.id; // Use the correct doctor id
        doctorResponse = await axiosInstance.put(`/doctors/${existingDoctor.id}`, doctorEntityData);
      } else {
        console.log("Creating new doctor record...");
        doctorResponse = await axiosInstance.post(`/doctors`, doctorEntityData);
      }

      if (userResponse.data && doctorResponse.data) {
        const updatedUser = {
          ...currentUser,
          ...userResponse.data,
          specialization: doctorResponse.data.specialization,
          licenseNumber: doctorResponse.data.qualification,
          experience: doctorResponse.data.experience,
          bio: doctorResponse.data.description,
          specialtyId: doctorResponse.data.specialtyId,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return { user: userResponse.data, doctor: doctorResponse.data };
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin bác sĩ:", error);
      console.error("Response data:", error.response?.data);
      throw new Error(error.response?.data || "Lỗi khi cập nhật hoặc tạo thông tin bác sĩ");
    }
  },

  changePassword: async (passwordData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const response = await axiosInstance.put(`/users/${currentUser.id}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      throw error;
    }
  },

  updateAvatar: async (formData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const response = await axiosInstance.put(`/users/${currentUser.id}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          avatarUrl: response.data,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        await userService.getCurrentUserInfo();
      }
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh đại diện:", error);
      throw error;
    }
  },

  getAllPatients: async () => {
    try {
      const response = await axiosInstance.get("/users/patients");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bệnh nhân:", error);
      throw error;
    }
  },

  createPatient: async (userData) => {
    try {
      const response = await axiosInstance.post("/users/patients", userData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo khách hàng:", error);
      throw error;
    }
  },

  getPatientById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin bệnh nhân:", error);
      throw error;
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin bệnh nhân:", error);
      throw error;
    }
  },

  updatePatientAvatar: async (id, avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await axiosInstance.put(`/users/${id}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar bệnh nhân:", error);
      throw error;
    }
  },

  // === ADMIN USER MANAGEMENT FUNCTIONS ===

  // Lấy danh sách người dùng với phân trang và sắp xếp
  getAllUsersAdmin: async (page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
    try {
      const response = await axiosInstance.get(
        `/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  },

  // Hàm tương thích với UsersContent.jsx
  getUsersWithPagination: async (params) => {
    try {
      const { page = 0, size = 10, sortBy = 'name', sortDir = 'asc', status, role, keyword } = params;
      
      let url = `/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
      
      // Thêm các tham số tìm kiếm và lọc nếu có
      if (status) {
        url += `&status=${status}`;
      }
      if (role) {
        url += `&role=${role}`;
      }
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  },

  // Tìm kiếm người dùng theo từ khóa
  searchUsersAdmin: async (keyword, page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(
        `/admin/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm người dùng:', error);
      throw error;
    }
  },

  // Lọc người dùng theo vai trò
  filterUsersByRoleAdmin: async (role, page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(
        `/admin/users/filter/role/${role}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lọc người dùng theo vai trò ${role}:`, error);
      throw error;
    }
  },

  // Lọc người dùng theo trạng thái
  filterUsersByStatusAdmin: async (status, page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(
        `/admin/users/filter/status/${status}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lọc người dùng theo trạng thái ${status}:`, error);
      throw error;
    }
  },

  // Thêm người dùng mới
  createUserAdmin: async (userData) => {
    try {
      const response = await axiosInstance.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      throw error;
    }
  },

  // Hàm tương thích với UsersContent.jsx
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUserAdmin: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật người dùng ${id}:`, error);
      throw error;
    }
  },

  // Hàm tương thích với UsersContent.jsx
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật người dùng ${id}:`, error);
      throw error;
    }
  },

  // Khóa/mở khóa người dùng
  toggleUserStatusAdmin: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}/toggle-status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái người dùng ${id}:`, error);
      throw error;
    }
  },

  // Hàm tương thích với UsersContent.jsx
  toggleUserStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}/toggle-status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái người dùng ${id}:`, error);
      throw error;
    }
  }
};

export default userService;