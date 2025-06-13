import React from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineUser, HiOutlineUserCircle, HiOutlineClock } from "react-icons/hi";
import "../css/ProfileForm.css";

export default function ProfileForm({ data, handleChange, onUpdate }) {
    return (
        <form className="form-modern-unique">
            {/* Dòng 1 */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>Email <span>*</span></label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineMail className="input-icon-unique" />
                        <input
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>Số điện thoại <span>*</span></label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlinePhone className="input-icon-unique" />
                        <input
                            type="text"
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Dòng 2 */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>Họ và tên <span>*</span></label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineUser className="input-icon-unique" />
                        <input
                            type="text"
                            name="fullName"
                            value={data.fullName}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>Giới tính <span>*</span></label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineUserCircle className="input-icon-unique" />
                        <select
                            name="gender"
                            value={data.gender}
                            onChange={handleChange}
                        >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Dòng 3 */}
            <div className="form-row-unique">
                <div className="form-group-unique half-width-unique">
                    <label>Vị trí <span>*</span></label>
                    <div className="input-icon-wrapper-unique">
                        {/* Icon vị trí bạn có thể chọn hoặc bỏ */}
                        <HiOutlineUser className="input-icon-unique" />
                        <input
                            type="text"
                            name="position"
                            value="Lễ Tân"
                            readOnly
                            disabled
                        />
                    </div>
                </div>
                <div className="form-group-unique half-width-unique">
                    <label>Ca làm <span>*</span></label>
                    <div className="input-icon-wrapper-unique">
                        <HiOutlineClock className="input-icon-unique" />
                        <select
                            name="shift"
                            value={data.shift}
                            onChange={handleChange}
                        >
                            <option value="Ca sáng">Ca sáng</option>
                            <option value="Ca chiều">Ca chiều</option>
                            <option value="Ca tối">Ca tối</option>
                        </select>
                    </div>
                </div>
            </div>

            <button type="button" className="form-submit-unique" onClick={onUpdate}>Cập nhật</button>

        </form>
    );
}
