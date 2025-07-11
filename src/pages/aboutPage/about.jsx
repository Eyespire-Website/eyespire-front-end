import AboutHeader from '../../pages/aboutPage/jsx/about-title'
import MedicalLanding from "../../pages/aboutPage/jsx/MedicalLanding"
import OptioneClinic from "./jsx/optione-clinic"
import EyeClinicSection from "./jsx/eye-clinic-section"
import Footer from "../../components/Footer/Footer"
import MedicalClinicBanner from "./jsx/medical-clinic-banner";
import LaserClinicSection from "./jsx/laser-clinic-section";
import HealthTechShowcase from "./jsx/health-tech-showcase";
import ChatBox from "../../components/ChatBox/ChatBox";

export default function AboutPage() {
    return (
        <main>

            <AboutHeader />
            <MedicalLanding />
            <OptioneClinic />
            <EyeClinicSection />
            <MedicalClinicBanner />
            <LaserClinicSection />
            <HealthTechShowcase />
            <Footer />
            <ChatBox />

        </main>
    )
}