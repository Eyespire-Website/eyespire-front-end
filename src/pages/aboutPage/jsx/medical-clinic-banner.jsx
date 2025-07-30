import { FaPhoneAlt } from 'react-icons/fa';  // Import icon từ react-icons/fa
import '../css/medical-clinic-banner.css';

export default function MedicalClinicBanner() {
    return (
        <div className="medical-banner55">
            <div className="banner-container55">
                <div className="banner-grid55">
                    {/* Left Section */}
                    <div className="left-section55">
                        <h1 className="main-heading-custom55">
                            Phòng Khám Của Chúng Tôi Đang Mở &<br />
                            Sẵn Sàng Giúp Đỡ!
                        </h1>
                        <button className="appointment-button55">Đặt Lịch Hẹn</button>
                    </div>

                    {/* Right Section */}
                    <div className="right-section55">
                        <h2 className="secondary-heading-custom55">Nhận Dịch Vụ Y Tế Xuất Sắc Mỗi Ngày. Đặt Lịch Hẹn Qua Điện Thoại!</h2>
                        <div className="phone-container55">
                            <FaPhoneAlt className="phone-icon-custom55" /> {/* Thay thế Phone icon */}
                            <span className="phone-number-custom55">123 45 67 890</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
