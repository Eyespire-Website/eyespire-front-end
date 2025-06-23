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

const staffService = {
  // Lấy danh sách tất cả nhân viên
  getAllStaff: async () => {
    try {
      const response = await axiosInstance.get("/admin/staff")
      // Đảm bảo mỗi nhân viên có trường position dựa trên role và loại bỏ ADMIN
      const staffWithPosition = response.data
        .filter(staff => staff.role !== "ADMIN") // Lọc bỏ tài khoản ADMIN
        .map(staff => ({
          ...staff,
          position: staff.position || staff.role, // Sử dụng position nếu có, nếu không thì dùng role
          startDate: staff.startDate || new Date().toISOString().split('T')[0] // Đảm bảo startDate luôn có giá trị
        }))
      return staffWithPosition
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error)
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu")
        return getMockStaffData()
      }
      
      throw error
    }
  },

  // Lấy thông tin nhân viên theo ID
  getStaffById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/staff/${id}`)
      // Đảm bảo startDate luôn có giá trị
      const staffData = {
        ...response.data,
        position: response.data.position || response.data.role, // Sử dụng position nếu có, nếu không thì dùng role
        startDate: response.data.startDate || new Date().toISOString().split('T')[0] // Đảm bảo startDate luôn có giá trị
      };

      // Nếu là bác sĩ, lấy thêm thông tin từ bảng doctor
      if (staffData.role === 'DOCTOR' || staffData.position === 'DOCTOR') {
        try {
          // Sử dụng endpoint mới để lấy thông tin bác sĩ theo userId
          const doctorResponse = await axiosInstance.get(`/doctors/by-user/${id}`);
          staffData.doctorInfo = doctorResponse.data;
        } catch (doctorError) {
          console.error("Lỗi khi lấy thông tin bác sĩ:", doctorError);
          // Tạo doctorInfo rỗng để tránh lỗi undefined
          staffData.doctorInfo = {
            specialization: 'Chưa cập nhật',
            qualification: 'Chưa cập nhật',
            experience: 'Chưa cập nhật',
            description: 'Chưa cập nhật'
          };
        }
      }

      return staffData;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhân viên:", error)
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu")
        const mockData = getMockStaffData()
        const staff = mockData.find(s => s.id === id)
        return staff || null
      }
      
      throw error
    }
  },

  // Thêm nhân viên mới
  createStaff: async (staffData) => {
    try {
      // Format dữ liệu nhân viên
      const formattedData = staffService.formatStaffData(staffData);
      
      // Gửi request tạo nhân viên
      const response = await axiosInstance.post("/admin/staff", formattedData);
      const createdStaff = response.data;
      
      // Nếu là bác sĩ, tạo thêm bản ghi Doctor
      if (formattedData.role === "DOCTOR" && staffData.doctorInfo) {
        try {
          // Tạo bản ghi Doctor liên kết với User vừa tạo
          await staffService.createDoctor({
            ...staffData.doctorInfo,
            userId: createdStaff.id, // ID của User vừa tạo
            name: createdStaff.name // Tên bác sĩ (lấy từ thông tin nhân viên)
          });
          
          // Cập nhật thông tin Doctor vào createdStaff để trả về
          createdStaff.doctorInfo = staffData.doctorInfo;
        } catch (doctorError) {
          console.error("Lỗi khi tạo thông tin bác sĩ:", doctorError);
          // Vẫn trả về thông tin nhân viên đã tạo, nhưng ghi log lỗi
        }
      }
      
      return createdStaff;
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên mới:", error)
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu")
        const mockData = getMockStaffData()
        const newStaff = {
          ...staffData,
          id: Math.max(...mockData.map(s => s.id)) + 1
        }
        return newStaff
      }
      
      throw error
    }
  },

  // Cập nhật thông tin nhân viên
  updateStaff: async (staffData) => {
    try {
      // Format dữ liệu nhân viên
      const formattedData = staffService.formatStaffData(staffData);
      const id = formattedData.id;
      
      // Gửi request cập nhật nhân viên
      const response = await axiosInstance.put(`/admin/staff/${id}`, formattedData);
      const updatedStaff = response.data;
      
      // Nếu là bác sĩ, cập nhật hoặc tạo mới thông tin bác sĩ
      if (formattedData.role === "DOCTOR" && staffData.doctorInfo) {
        try {
          // Kiểm tra xem bác sĩ đã có thông tin chuyên môn chưa
          const doctorResponse = await axiosInstance.get(`/doctors/by-user/${id}`);
          
          if (doctorResponse.data) {
            // Nếu đã có, cập nhật thông tin
            await axiosInstance.put(`/doctors/${doctorResponse.data.id}`, {
              ...staffData.doctorInfo,
              name: updatedStaff.name
            });
          } else {
            // Nếu chưa có, tạo mới
            await staffService.createDoctor({
              ...staffData.doctorInfo,
              userId: id,
              name: updatedStaff.name
            });
          }
          
          // Cập nhật thông tin Doctor vào updatedStaff để trả về
          updatedStaff.doctorInfo = staffData.doctorInfo;
        } catch (doctorError) {
          console.error("Lỗi khi cập nhật thông tin bác sĩ:", doctorError);
          // Vẫn trả về thông tin nhân viên đã cập nhật, nhưng ghi log lỗi
        }
      }
      
      return updatedStaff;
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin nhân viên:", error)
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu")
        return {
          ...staffData,
          id: staffData.id
        }
      }
      
      throw error
    }
  },

  // Xóa nhân viên
  deleteStaff: async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/staff/${id}`)
      return response.data
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error)
      
      // Nếu API chưa sẵn sàng, trả về kết quả giả
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng kết quả giả")
        return { deleted: true }
      }
      
      throw error
    }
  },

  // Lấy danh sách nhân viên theo chức vụ
  getStaffByPosition: async (position) => {
    try {
      const response = await axiosInstance.get(`/admin/staff/position/${position}`)
      return response.data
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên theo chức vụ:", error)
      
      // Nếu API chưa sẵn sàng, trả về dữ liệu mẫu
      if (error.response && error.response.status === 404) {
        console.log("API chưa sẵn sàng, sử dụng dữ liệu mẫu")
        const mockData = getMockStaffData()
        return mockData.filter(s => s.position.toUpperCase() === position.toUpperCase())
      }
      
      throw error
    }
  },

  // Tạo bản ghi Doctor liên kết với User
  createDoctor: async (doctorData) => {
    try {
      const response = await axiosInstance.post("/admin/doctors", doctorData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo thông tin bác sĩ:", error);
      throw error;
    }
  },

  // Validate dữ liệu nhân viên trước khi gửi API
  validateStaffData: (data) => {
    const errors = []

    if (!data.name || data.name.trim() === "") errors.push("Họ tên là bắt buộc")
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Email không hợp lệ")
    if (!data.phone || !/^\d{10}$/.test(data.phone.replace(/\D/g, ""))) errors.push("Số điện thoại phải có 10 chữ số")
    if (!data.position) errors.push("Chức vụ là bắt buộc")
    if (!data.startDate) errors.push("Ngày bắt đầu là bắt buộc")
    
    // Validate thông tin bác sĩ nếu role là DOCTOR
    if (data.position === "DOCTOR") {
      if (!data.doctorInfo) errors.push("Thông tin chuyên môn bác sĩ là bắt buộc");
      else {
        if (!data.doctorInfo.specialtyId) 
          errors.push("Chuyên khoa là bắt buộc");
        if (!data.doctorInfo.qualification || data.doctorInfo.qualification.trim() === "") 
          errors.push("Bằng cấp là bắt buộc");
        if (!data.doctorInfo.experience || data.doctorInfo.experience.trim() === "") 
          errors.push("Kinh nghiệm là bắt buộc");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  // Format dữ liệu nhân viên để gửi lên API
  formatStaffData: (data) => {
    return {
      id: data.id,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.replace(/\D/g, ""),
      role: mapPositionToRole(data.position),
      dateOfBirth: data.dateOfBirth || null,
      startDate: data.startDate,
      gender: data.gender || null,
      username: data.email.trim(), // Mặc định username là email
      password: data.password || "123456", // Mật khẩu mặc định nếu không có
    }
  }
}

// Hàm ánh xạ chức vụ sang UserRole
function mapPositionToRole(position) {
  switch (position.toUpperCase()) {
    case "DOCTOR":
      return "DOCTOR"
    case "RECEPTIONIST":
      return "RECEPTIONIST"
    case "STORE_MANAGER":
      return "STORE_MANAGER"
    default:
      return "RECEPTIONIST" // Mặc định là lễ tân
  }
}

// Lấy danh sách chức vụ từ UserRole enum (chỉ DOCTOR, RECEPTIONIST và STORE_MANAGER)
function getAvailablePositions() {
  return [
    "DOCTOR",
    "RECEPTIONIST",
    "STORE_MANAGER"
  ]
}

// Dữ liệu mẫu cho trường hợp API chưa sẵn sàng
function getMockStaffData() {
  return [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "admin@eyespire.com",
      phone: "0987654321",
      position: "ADMIN",
      role: "ADMIN",
      startDate: "2023-01-01",
      gender: "MALE",
      dateOfBirth: "1990-01-01"
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "doctor@eyespire.com",
      phone: "0987654322",
      position: "DOCTOR",
      role: "DOCTOR",
      startDate: "2023-02-01",
      gender: "FEMALE",
      dateOfBirth: "1992-05-10"
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "receptionist@eyespire.com",
      phone: "0987654323",
      position: "RECEPTIONIST",
      role: "RECEPTIONIST",
      startDate: "2023-03-01",
      gender: "MALE",
      dateOfBirth: "1995-08-15"
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "store@eyespire.com",
      phone: "0987654324",
      position: "STORE_MANAGER",
      role: "STORE_MANAGER",
      startDate: "2023-04-01",
      gender: "FEMALE",
      dateOfBirth: "1993-12-20"
    }
  ]
}

export default staffService

// Export hàm getAvailablePositions để các component khác có thể sử dụng
export { getAvailablePositions }
