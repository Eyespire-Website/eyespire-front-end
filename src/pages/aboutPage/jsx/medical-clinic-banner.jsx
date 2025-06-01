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
                            Our Clinic is Open &<br />
                            Ready to Help!
                        </h1>
                        <button className="appointment-button55">Make an Appointment</button>
                    </div>

                    {/* Right Section */}
                    <div className="right-section55">
                        <h2 className="secondary-heading-custom55">Get Medical Excellence Every Day. Book an Appointment by Phone!</h2>
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
