"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import ProfileAvatar from "./jsx/ProfileAvatar"
import ProfileForm from "./jsx/ProfileForm"
import PasswordModal from "./jsx/PasswordModal"
import userService from "../../../../services/userService"
import authService from "../../../../services/authService"
import axios from "axios"
import "./ProfilePage.css"

export default function ProfilePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [receptionistData, setReceptionistData] = useState({
        email: "",
        fullName: "",
        phone: "",
        gender: "Nam",
        dateOfBirth: "",
        provinceCode: "",
        districtCode: "",
        wardCode: "",
        addressDetail: "",
    })

    // Address data
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [addressLoading, setAddressLoading] = useState(false)

    const [previewUrl, setPreviewUrl] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordError, setPasswordError] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setAddressLoading(true)
                const response = await axios.get("https://provinces.open-api.vn/api/p/")
                setProvinces(response.data)
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu tỉnh/thành phố:", error)
            } finally {
                setAddressLoading(false)
            }
        }

        fetchProvinces()
    }, [])

    // Load user data on component mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                setError(null)

                const currentUser = authService.getCurrentUser()
                if (!currentUser) {
                    setError("Vui lòng đăng nhập để xem thông tin")
                    setLoading(false)
                    return
                }

                const userData = await userService.getCurrentUserInfo()
                setUser(userData)
            } catch (err) {
                console.error("Error fetching user:", err)
                setError(err.message || "Không thể tải thông tin người dùng")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    // Update form data when user data loads
    useEffect(() => {
        if (user) {
            const newData = {
                email: user.email || "",
                fullName: user.name || "",
                phone: user.phone || "",
                gender: user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : "Khác",
                dateOfBirth: user.dateOfBirth || "",
                provinceCode: user.province || "",
                districtCode: user.district || "",
                wardCode: user.ward || "",
                addressDetail: user.addressDetail || "",
            }

            setReceptionistData(newData)

            // Fix avatar URL setting
            if (user.avatarUrl) {
                setPreviewUrl(user.avatarUrl)
            } else if (user.avatar) {
                setPreviewUrl(user.avatar)
            } else if (user.profilePicture) {
                setPreviewUrl(user.profilePicture)
            }

            // Load districts if province is selected
            if (user.province) {
                fetchDistricts(user.province)
            }

            // Load wards if district is selected
            if (user.district) {
                fetchWards(user.district)
            }
        }
    }, [user])

    // Fetch districts when province is selected
    const fetchDistricts = async (provinceCode) => {
        try {
            setAddressLoading(true)
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            setDistricts(response.data.districts || [])
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu quận/huyện:", error)
            setDistricts([])
        } finally {
            setAddressLoading(false)
        }
    }

    // Fetch wards when district is selected
    const fetchWards = async (districtCode) => {
        try {
            setAddressLoading(true)
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            setWards(response.data.wards || [])
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu phường/xã:", error)
            setWards([])
        } finally {
            setAddressLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setReceptionistData((prev) => ({ ...prev, [name]: value }))
    }

    // Handle province change
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value
        setReceptionistData((prev) => ({
            ...prev,
            provinceCode,
            districtCode: "",
            wardCode: "",
        }))
        setDistricts([])
        setWards([])

        if (provinceCode) {
            fetchDistricts(provinceCode)
        }
    }

    // Handle district change
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value
        setReceptionistData((prev) => ({
            ...prev,
            districtCode,
            wardCode: "",
        }))
        setWards([])

        if (districtCode) {
            fetchWards(districtCode)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setPreviewUrl(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const handleAvatarUpload = async () => {
        if (!selectedFile) {
            alert("Vui lòng chọn ảnh")
            return
        }

        try {
            setIsUpdating(true)

            const formData = new FormData()
            formData.append("avatar", selectedFile)

            const avatarUrl = await userService.updateAvatar(formData)

            const updatedUser = await userService.getCurrentUserInfo()
            setUser(updatedUser)

            setSelectedFile(null)
            alert("Ảnh đã được cập nhật!")
        } catch (error) {
            console.error("Avatar upload error:", error)
            alert(`Không thể cập nhật ảnh: ${error.message}`)
        } finally {
            setIsUpdating(false)
        }
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({ ...prev, [name]: value }))
        if (passwordError) setPasswordError("")
    }

    const handlePasswordSubmit = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Vui lòng điền đầy đủ thông tin")
            return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Mật khẩu mới không khớp")
            return
        }

        try {
            setIsUpdating(true)
            const changePasswordRequest = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }

            await userService.changePassword(changePasswordRequest)

            alert("Đổi mật khẩu thành công!")
            setShowPasswordModal(false)
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setPasswordError("")
        } catch (error) {
            console.error("Password change error:", error)
            setPasswordError(error.response?.data || error.message || "Không thể đổi mật khẩu")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleUpdate = async () => {
        try {
            setIsUpdating(true)

            const genderMap = {
                Nam: "MALE",
                Nữ: "FEMALE",
                Khác: "OTHER",
            }

            const updateRequest = {
                name: receptionistData.fullName,
                email: receptionistData.email,
                phone: receptionistData.phone,
                gender: genderMap[receptionistData.gender] || "MALE",
                dateOfBirth: receptionistData.dateOfBirth || null,
                province: receptionistData.provinceCode || null,
                district: receptionistData.districtCode || null,
                ward: receptionistData.wardCode || null,
                addressDetail: receptionistData.addressDetail || null,
            }

            const updatedUser = await userService.updateProfile(updateRequest)
            setUser(updatedUser)
            alert("Thông tin đã được cập nhật!")
        } catch (error) {
            console.error("Profile update error:", error)
            alert(`Không thể cập nhật thông tin: ${error.response?.data || error.message}`)
        } finally {
            setIsUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="profile">
                <div className="profile__loading">
                    <div className="profile__spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="profile">
                <div className="profile__error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="profile__retry-button">
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="profile">
                <div className="profile__error">
                    <p>❓ Không tìm thấy thông tin người dùng</p>
                </div>
            </div>
        )
    }

    return (
        <div className="profile">
            <div className="profile__header">
                <h1 className="profile__title">Hồ sơ cá nhân</h1>
            </div>

            <div className="profile__container">
                <div className="profile__table-header">
                    <div className="profile__table-header-content">
                        <User className="profile__table-header-icon" />
                        <span className="profile__table-header-text">
              Thông tin cá nhân của {receptionistData.fullName || "người dùng"}
            </span>
                    </div>
                </div>

                <div className="profile__content">
                    <div className="profile__left-column">
                        <ProfileAvatar
                            fullName={receptionistData.fullName}
                            previewUrl={previewUrl}
                            handleFileChange={handleFileChange}
                            handleAvatarUpload={handleAvatarUpload}
                            selectedFile={selectedFile}
                            isUploading={isUpdating}
                        />
                        <button onClick={() => setShowPasswordModal(true)} className="profile__password-btn" disabled={isUpdating}>
                            🔒 Thay đổi mật khẩu ở đây!
                        </button>
                    </div>
                    <div className="profile__right-column">
                        <ProfileForm
                            data={receptionistData}
                            handleChange={handleInputChange}
                            onUpdate={handleUpdate}
                            isUpdating={isUpdating}
                            userRole={user.role}
                            // Address props
                            provinces={provinces}
                            districts={districts}
                            wards={wards}
                            addressLoading={addressLoading}
                            onProvinceChange={handleProvinceChange}
                            onDistrictChange={handleDistrictChange}
                        />
                    </div>
                </div>
            </div>

            <PasswordModal
                visible={showPasswordModal}
                onClose={() => {
                    setShowPasswordModal(false)
                    setPasswordError("")
                    setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    })
                }}
                onSubmit={handlePasswordSubmit}
                onChange={handlePasswordChange}
                data={passwordData}
                error={passwordError}
                isSubmitting={isUpdating}
            />
        </div>
    )
}
