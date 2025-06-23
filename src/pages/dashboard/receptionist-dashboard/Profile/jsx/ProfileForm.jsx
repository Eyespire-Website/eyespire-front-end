"use client"
import {
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineUser,
    HiOutlineUserCircle,
    HiOutlineClock,
    HiOutlineLocationMarker,
} from "react-icons/hi"
import "../css/ProfileForm.css"

export default function ProfileForm({
                                        data,
                                        handleChange,
                                        onUpdate,
                                        isUpdating = false,
                                        userRole = "RECEPTIONIST",
                                        // Address props
                                        provinces = [],
                                        districts = [],
                                        wards = [],
                                        addressLoading = false,
                                        onProvinceChange,
                                        onDistrictChange,
                                    }) {
    const getRoleDisplayName = (role) => {
        switch (role) {
            case "RECEPTIONIST":
                return "Lễ Tân"
            case "DOCTOR":
                return "Bác sĩ"
            case "ADMIN":
                return "Quản trị viên"
            case "PATIENT":
                return "Bệnh nhân"
            case "STORE_MANAGER":
                return "Quản lý cửa hàng"
            default:
                return role
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onUpdate()
    }

    return (
        <form className="form-modern-unique" onSubmit={handleSubmit}>
            {/* Dòng 1 - Email và Số điện thoại */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>
                        Email <span>*</span>
                    </label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineMail className="input-icon-unique" />
                        <input
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            disabled={isUpdating}
                            required
                        />
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>
                        Số điện thoại <span>*</span>
                    </label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlinePhone className="input-icon-unique" />
                        <input type="tel" name="phone" value={data.phone} onChange={handleChange} disabled={isUpdating} required />
                    </div>
                </div>
            </div>

            {/* Dòng 2 - Họ tên và Giới tính */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>
                        Họ và tên <span>*</span>
                    </label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineUser className="input-icon-unique" />
                        <input
                            type="text"
                            name="fullName"
                            value={data.fullName}
                            onChange={handleChange}
                            disabled={isUpdating}
                            required
                        />
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>
                        Giới tính <span>*</span>
                    </label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineUserCircle className="input-icon-unique" />
                        <select name="gender" value={data.gender} onChange={handleChange} disabled={isUpdating} required>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Dòng 3 - Ngày sinh và Vị trí */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>Ngày sinh</label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineClock className="input-icon-unique" />
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={data.dateOfBirth}
                            onChange={handleChange}
                            disabled={isUpdating}
                        />
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>Vị trí</label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineUser className="input-icon-unique" />
                        <input type="text" value={getRoleDisplayName(userRole)} readOnly disabled className="readonly-input" />
                    </div>
                </div>
            </div>

            {/* Địa chỉ - Tỉnh và Quận */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>Tỉnh/Thành phố</label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineLocationMarker className="input-icon-unique" />
                        <select
                            name="provinceCode"
                            value={data.provinceCode}
                            onChange={onProvinceChange}
                            disabled={isUpdating || addressLoading}
                            className="form-select"
                        >
                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                            {provinces.map((province) => (
                                <option key={province.code} value={province.code}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>Quận/Huyện</label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineLocationMarker className="input-icon-unique" />
                        <select
                            name="districtCode"
                            value={data.districtCode}
                            onChange={onDistrictChange}
                            disabled={!data.provinceCode || isUpdating || addressLoading}
                            className="form-select"
                        >
                            <option value="">-- Chọn Quận/Huyện --</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.code}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Địa chỉ - Phường và Địa chỉ chi tiết */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>Phường/Xã</label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineLocationMarker className="input-icon-unique" />
                        <select
                            name="wardCode"
                            value={data.wardCode}
                            onChange={handleChange}
                            disabled={!data.districtCode || isUpdating || addressLoading}
                            className="form-select"
                        >
                            <option value="">-- Chọn Phường/Xã --</option>
                            {wards.map((ward) => (
                                <option key={ward.code} value={ward.code}>
                                    {ward.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>Địa chỉ chi tiết</label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineLocationMarker className="input-icon-unique" />
                        <input
                            type="text"
                            name="addressDetail"
                            value={data.addressDetail}
                            onChange={handleChange}
                            disabled={isUpdating}
                            placeholder="Số nhà, tên đường..."
                        />
                    </div>
                </div>
            </div>

            <button type="submit" className="form-submit-unique" disabled={isUpdating || addressLoading}>
                {isUpdating ? (
                    <>
                        <span className="loading-spinner">⏳</span>
                        Đang cập nhật...
                    </>
                ) : (
                    "Cập nhật thông tin"
                )}
            </button>
        </form>
    )
}
