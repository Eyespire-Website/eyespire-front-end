import axios from "axios"
import authService from "./authService"

const API_URL = "http://localhost:8080/api"

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
    (config) => {
      const user = authService.getCurrentUser()
      if (user) {
        // Thêm userId vào header để backend có thể xác thực
        config.headers["User-Id"] = user.id
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
)

const userService = {
  // Lấy thông tin người dùng hiện tại
  getCurrentUserInfo: async () => {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }

      const response = await axiosInstance.get(`/users/${currentUser.id}`)

      // Cập nhật thông tin người dùng trong localStorage
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          ...response.data,
          // Đảm bảo giữ nguyên trạng thái isGoogleAccount từ localStorage
          isGoogleAccount:
              response.data.isGoogleAccount !== undefined ? response.data.isGoogleAccount : currentUser.isGoogleAccount,
        }
        console.log("Cập nhật user trong localStorage:", updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error)
      throw error
    }
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (userData) => {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }

      const response = await axiosInstance.put(`/users/${currentUser.id}`, userData)

      // Cập nhật thông tin người dùng trong localStorage
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          ...response.data,
        }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      return response.data
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error)
      throw error
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }

      const response = await axiosInstance.put(`/users/${currentUser.id}/change-password`, passwordData)

      return response.data
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error)
      throw error
    }
  },

  // Cập nhật ảnh đại diện
  updateAvatar: async (formData) => {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }

      const response = await axiosInstance.put(`/users/${currentUser.id}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Cập nhật avatarUrl trong localStorage
      if (response.data) {
        const updatedUser = {
          ...currentUser,
          avatarUrl: response.data,
        }
        localStorage.setItem("user", JSON.stringify(updatedUser))

        // Lấy thông tin người dùng mới nhất từ server
        await userService.getCurrentUserInfo()
      }

      return response.data
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh đại diện:", error)
      throw error
    }
  },

  // NEW: Lấy tất cả bệnh nhân - đơn giản
  getAllPatients: async () => {
    try {
      const response = await axiosInstance.get("/users/patients")
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bệnh nhân:", error)
      throw error
    }
  },

  // NEW: Lấy thông tin bệnh nhân theo ID
  getPatientById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy thông tin bệnh nhân:", error)
      throw error
    }
  },

  // NEW: Cập nhật thông tin bệnh nhân
  updatePatient: async (id, patientData) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, patientData)
      return response.data
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin bệnh nhân:", error)
      throw error
    }
  },

  // NEW: Cập nhật avatar bệnh nhân
  updatePatientAvatar: async (id, avatarFile) => {
    try {
      const formData = new FormData()
      formData.append("avatar", avatarFile)

      const response = await axiosInstance.put(`/users/${id}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar bệnh nhân:", error)
      throw error
    }
  },
}

export default userService
