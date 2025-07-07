import React, { useEffect } from "react";
import "./index.css";
import Header from "../../components/Header/Header";
import Banner from "../../components/Banner/Banner";
import Services from "../../components/Services/Services";
import About from "../../components/About/About";
import Products from "../../components/Products/Products";
import Appointment from "../../components/Appointment/Appointment";
import Testimonials from "../../components/Testimonials/Testimonials";
import Gallery from "../../components/Gallery/Gallery";
import Contact from "../../components/Contact/Contact";
import Footer from "../../components/Footer/Footer";
import ChatBox from "../../components/ChatBox/ChatBox";
import { useLocation } from "react-router-dom";

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    // Xử lý cuộn đến phần đặt lịch hẹn nếu có tham số scrollToAppointment
    if (location.search.includes('scrollToAppointment=true')) {
      setTimeout(() => {
        const appointmentElement = document.getElementById('appointment-section');
        if (appointmentElement) {
          appointmentElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Đợi 500ms để đảm bảo trang đã render xong
    }
  }, [location]);

  return (
    <div className="contain">
      <div className="scroll-view">
        <div 
          className="hero-section"
          style={{
            backgroundColor: '#03246B',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            minHeight: '100vh',
          }}
        >
          <div className="overlay" style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.3)' 
          }}></div>
          <Header />
          <Banner />
        </div>
        <Services />
        <About />
        <Products />
        <div id="appointment-section">
          <Appointment />
        </div>
        <Testimonials />
        <Gallery />
        <Contact />
        <Footer />
        <ChatBox />
      </div>
    </div>
  );
};

export default HomePage;
