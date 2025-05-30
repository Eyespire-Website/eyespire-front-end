import { FaPhoneAlt } from 'react-icons/fa';  // Import icon từ react-icons/fa
import '../css/medical-clinic-banner.css';

export default function MedicalClinicBanner() {
    return (
        <div className="medical-banner1">
            <div className="banner-container1">
                <div className="banner-grid1">
                    {/* Left Section */}
                    <div className="left-section1">
                        <h1 className="main-heading-custom1">
                            Our Clinic is Open &<br />
                            Ready to Help!
                        </h1>
                        <button className="appointment-button1">Make an Appointment</button>
                    </div>

                    {/* Right Section */}
                    <div className="right-section1">
                        <h2 className="secondary-heading-custom1">Get Medical Excellence Every Day. Book an Appointment by Phone!</h2>
                        <div className="phone-container1">
                            <FaPhoneAlt className="phone-icon-custom1" /> {/* Thay thế Phone icon */}
                            <span className="phone-number-custom1">123 45 67 890</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
