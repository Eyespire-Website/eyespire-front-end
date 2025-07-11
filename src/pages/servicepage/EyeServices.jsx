"use client"

import "./EyeServices.css"
import { useState, useEffect } from "react"
import ServicesHeader from "./ServicesHeader"
import Footer from "../../components/Footer/Footer"
import Services from "../../components/Services/Services"
import ChatBox from "../../components/ChatBox/ChatBox"

const EyeServices = () => {
    const [countdown, setCountdown] = useState({
        days: 10,
        hours: 24,
        minutes: 12,
        seconds: 43,
    })

    const [activeTestimonial, setActiveTestimonial] = useState(0)
    const [selectedDate, setSelectedDate] = useState(16)
    const [activeDisorder, setActiveDisorder] = useState(1)

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 }
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
                } else {
                    return prev
                }
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const eyeDisorders = ["Refractive Errors", "Myopia", "Cataract", "Glaucoma", "Age-Related Macular Degeneration"]

    const myopiaSymptoms = [
        "Eye fatigue",
        "Trouble reading",
        "Hard to see objects",
        "Eye strain",
        "Headaches",
        "Squinting",
        "Blurred vision",
        "Night vision problems",
    ]

    const testimonials = [
        {
            title: "Very professional eye exam",
            content: "The staff and doctors are friendly and knowledgeable they want you to be as healthy and comfortable.",
            author: "Katie A.",
            source: "Google Reviewer",
        },
        {
            title: "Change for the world!",
            content: "They fit me in right away and got my injury addressed and on the road to recovery!",
            author: "Kristen L.",
            source: "Google Reviewer",
        },
        {
            title: "Impressive Technology",
            content: "The staff was very friendly and the doctor made it very easy to understand the results.",
            author: "Scott L.",
            source: "Google Reviewer",
        },
    ]

    const accordionItems = ["About Eye Care Center", "Our Eyecare Mission", "Technologies in Opto"]

    return (
        <div className="es-page-container">
            <div className="es-container">
                {/* Hero Section */}
                <ServicesHeader />

                {/* Services Section */}
                <div className="es-main-content">
                    <Services />
                </div>

                {/* Quality Eye Care Section */}
                <section className="es-quality-care-section">
                    <div className="es-quality-care-container">
                        <div className="es-quality-care-image">
                            <img src="/placeholder.svg?height=300&width=300" alt="Eye care" className="es-circular-image" />
                        </div>
                        <div className="es-quality-care-content">
                            <h2 className="es-quality-care-title">
                                Providing You With <br />
                                <span className="es-highlight">Quality Eye Care</span>
                            </h2>
                            <div className="es-accordion-items">
                                {accordionItems.map((item, index) => (
                                    <div key={index} className="es-accordion-item">
                                        <span className="es-accordion-item-text">{item}</span>
                                        <svg
                                            className="es-accordion-item-icon"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 5l7 7m0 0l-7 7m7-7H3"
                                            ></path>
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRK Section */}
                <section className="es-prk-section">
                    <div className="es-prk-container">
                        <div className="es-prk-content">
                            <h2 className="es-prk-title">
                                Photorefractive <br />
                                <span className="es-highlight">Keratectomy (PRK)</span>
                            </h2>
                            <p className="es-prk-description">
                                PRK is a type of refractive surgery to correct myopia (nearsightedness), hyperopia (farsightedness) and
                                astigmatism. The first laser procedure for vision correction, PRK reshapes the cornea to allow light entering
                                the eye to be properly focused onto the retina.
                            </p>
                            <ul className="es-prk-features">
                                <li className="es-prk-feature">
                                    <svg
                                        className="es-prk-feature-icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        ></path>
                                    </svg>
                                    <span className="es-prk-feature-text">No surgical flap creation</span>
                                </li>
                                <li className="es-prk-feature">
                                    <svg
                                        className="es-prk-feature-icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        ></path>
                                    </svg>
                                    <span className="es-prk-feature-text">Ideal for thin corneas</span>
                                </li>
                                <li className="es-prk-feature">
                                    <svg
                                        className="es-prk-feature-icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        ></path>
                                    </svg>
                                    <span className="es-prk-feature-text">Eliminates flap complications</span>
                                </li>
                            </ul>
                            <button className="es-prk-button">
                                Learn More
                                <svg
                                    className="es-prk-button-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        <div className="es-vision-correction-image">
                            <img src="/placeholder.svg?height=400&width=600" alt="PRK procedure" className="es-vision-correction-img" />
                        </div>
                    </div>
                </section>

                {/* Eye Disorders Section */}
                <section className="es-eye-disorders-section">
                    <h2 className="es-eye-disorders-title">Common Eye Disorders</h2>
                    <div className="es-eye-disorders-container">
                        <ul className="es-disorders-list">
                            {eyeDisorders.map((disorder, index) => (
                                <li
                                    key={index}
                                    className={activeDisorder === index ? "active" : ""}
                                    onClick={() => setActiveDisorder(index)}
                                >
                                    {disorder}
                                </li>
                            ))}
                        </ul>
                        <div className="es-disorder-content">
                            <div className="es-disorder-header">
                                <div>
                                    <h3 className="es-disorder-title">Myopia (Nearsightedness)</h3>
                                    <p className="es-disorder-description">
                                        Myopia is a common vision condition in which you can see objects near to you clearly, but objects
                                        farther away are blurry. It occurs when the shape of your eye causes light rays to bend (refract)
                                        incorrectly, focusing images in front of your retina instead of on your retina.
                                    </p>
                                </div>
                                <div className="es-disorder-image">
                                    <img src="/placeholder.svg?height=200&width=300" alt="Myopia" />
                                </div>
                            </div>
                            <h4 className="es-symptoms-title">Common Symptoms</h4>
                            <div className="es-symptoms-list">
                                {myopiaSymptoms.map((symptom, index) => (
                                    <div key={index} className="es-symptom-item">
                                        <svg
                                            className="es-symptom-icon"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            ></path>
                                        </svg>
                                        <span className="es-symptom-text">{symptom}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Correction Section */}
                <section className="es-vision-correction-section">
                    <div className="es-vision-correction-container">
                        <div className="es-vision-correction-image">
                            <img src="/placeholder.svg?height=400&width=600" alt="Vision correction" className="es-vision-correction-img" />
                        </div>
                        <div>
                            <div className="es-countdown-container">
                                <div className="es-countdown-item">
                                    <div className="es-countdown-value">{countdown.days}</div>
                                    <div className="es-countdown-label">Days</div>
                                </div>
                                <div className="es-countdown-item">
                                    <div className="es-countdown-value">{countdown.hours}</div>
                                    <div className="es-countdown-label">Hours</div>
                                </div>
                                <div className="es-countdown-item">
                                    <div className="es-countdown-value">{countdown.minutes}</div>
                                    <div className="es-countdown-label">Minutes</div>
                                </div>
                                <div className="es-countdown-item">
                                    <div className="es-countdown-value">{countdown.seconds}</div>
                                    <div className="es-countdown-label">Seconds</div>
                                </div>
                            </div>
                            <h2 className="es-vision-correction-title">
                                Special Offer on <br />
                                <span className="es-highlight">Vision Correction</span>
                            </h2>
                            <p className="es-vision-correction-description">
                                For a limited time, get a special discount on our vision correction procedures. Schedule your free
                                consultation today and take the first step towards better vision.
                            </p>
                            <button className="es-prk-button">
                                Book Consultation
                                <svg
                                    className="es-prk-button-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="es-testimonials-section">
                    <h2 className="es-testimonials-title">What Our Patients Say</h2>
                    <div className="es-testimonials-container">
                        <div className="es-testimonials-grid">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className={`es-testimonial-card ${index === activeTestimonial ? "active" : ""}`}
                                >
                                    <h3 className="es-testimonial-title">{testimonial.title}</h3>
                                    <p className="es-testimonial-content">{testimonial.content}</p>
                                    <div className="es-testimonial-author">
                                        <div className="es-author-image">
                                            <img src="/placeholder.svg?height=50&width=50" alt={testimonial.author} />
                                        </div>
                                        <div className="es-author-info">
                                            <div className="es-author-name">{testimonial.author}</div>
                                            <div className="es-author-source">{testimonial.source}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="es-testimonial-dots">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    className={`es-dot ${index === activeTestimonial ? "active" : ""}`}
                                    onClick={() => setActiveTestimonial(index)}
                                    aria-label={`Testimonial ${index + 1}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Appointment Booking Section */}
                <section className="es-appointment-booking-section">
                    <div className="es-appointment-booking-container">
                        <div className="es-calendar-widget">
                            <h3 className="es-calendar-title">August</h3>
                            <div className="es-calendar-grid">
                                <div className="es-calendar-header">
                                    <span>S</span>
                                    <span>M</span>
                                    <span>T</span>
                                    <span>W</span>
                                    <span>T</span>
                                    <span>F</span>
                                    <span>S</span>
                                </div>
                                <div className="es-calendar-body">
                                    {[...Array(31)].map((_, index) => {
                                        const day = index + 1
                                        return (
                                            <button
                                                key={day}
                                                className={`es-calendar-day ${day === selectedDate ? "selected" : ""}`}
                                                onClick={() => setSelectedDate(day)}
                                            >
                                                {day}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="es-appointment-content">
                            <h2 className="es-appointment-title">
                                Book an Eye Care <br />
                                <span className="es-highlight">Appointment</span>
                            </h2>
                            <p className="es-appointment-description">
                                Neque gravida in fermentum et sollicitudin. Sit amet nulla facilisi morbi. Ipsum a arcu cursus vitae
                                congue mauris rhoncus. Tempor commodo ullamcorper
                            </p>
                            <button className="es-prk-button">Make an Appointment</button>
                        </div>
                    </div>
                </section>
                {/* Footer */}
                <Footer />
                <ChatBox />
            </div>
        </div>
    )
}

export default EyeServices
