import AboutHeader from '../../pages/aboutPage/jsx/about-title'
import MedicalLanding from "../../pages/aboutPage/jsx/MedicalLanding"
import OptiOneClinicLanding from "../../pages/aboutPage/jsx/optione-clinic-landing"
import Footer from "../../components/Footer/Footer"

export default function AboutPage() {
    return (
        <main>

            <AboutHeader />
            <MedicalLanding />
            <OptiOneClinicLanding />
            <Footer />
        </main>
    )
}