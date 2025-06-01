"use client"

import "./CallToAction.css"
import React from "react"

import { useNavigate } from "react-router-dom"
// Assuming you have an authService for user authentication
export default function CallToAction() {
  const navigate = useNavigate();

  const handleAppointment = () => {
    console.log("Make appointment clicked")
  }

  const handlePhoneCall = () => {
    window.location.href = "tel:+1234567890"
  }

  return (
    <div className="call-to-action">
      <div className="container">
        <div className="cta-grid">
          {/* Clinic CTA */}
          <div className="cta-card clinic-cta">
            <h3>Our Clinic is Open & Ready to Help!</h3>
            <button className="cta-button primary" onClick={handleAppointment}>
              Make an Appointment
            </button>
          </div>

          {/* Phone CTA */}
          <div className="cta-card phone-cta">
            <h3>Get Medical Excellence Every Day. Book an Appointment by Phone!</h3>
            <button className="cta-button secondary" onClick={handlePhoneCall}>
              📞 123 45 67 890
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}