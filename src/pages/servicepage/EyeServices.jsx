"use client"

import "./EyeServices.css"
import { useState, useEffect } from "react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import Services from "../../components/Services/Services"

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
        <div className="eyeservice-page-container">
            <div className="eyeservice-container">
                {/* Hero Section */}
                <div className="hero-section">
                    <Header />
                    <div className="service-page-title">
                        <h1>Our Eye Care Services</h1>
                        <p>Professional eye care services for your vision health</p>
                    </div>
                </div>

                {/* Services Section */}
                <div className="main-content">
                    <Services />
                </div>

                {/* Quality Eye Care Section */}
                <section className="quality-care-section">
                    <div className="quality-care-container">
                        <div className="quality-care-image">
                            <img src="/placeholder.svg?height=300&width=300" alt="Eye care" className="circular-image" />
                        </div>
                        <div className="quality-care-content">
                            <h2 className="quality-care-title">
                                Providing You With <br />
                                <span className="highlight">Quality Eye Care</span>
                            </h2>
                            <div className="accordion-items">
                                {accordionItems.map((item, index) => (
                                    <div key={index} className="accordion-item">
                                        <span>{item}</span>
                                        <div className="accordion-icon">+</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRK Section */}
                <section className="prk-section">
                    <div className="prk-container">
                        <div className="prk-content">
                            <h2 className="prk-title">
                                Photorefractive <br />
                                Keratectomy (PRK)
                            </h2>
                            <p className="prk-description">
                                Neque gravida in fermentum et sollicitudin. Sit amet nulla facilisi morbi. Ipsum a arcu cursus vitae
                                congue mauris rhoncus. Tempor commodo ullamcorper
                            </p>
                            <ul className="prk-features">
                                <li>Neque gravida et sollicitudin</li>
                                <li>Sit amet nulla facilisi morbi</li>
                                <li>Tempor commodo ullamcorper</li>
                                <li>Feugiat scelerisque varius enim</li>
                            </ul>
                        </div>
                        <div className="prk-image">
                            <img src="/placeholder.svg?height=400&width=600" alt="PRK procedure" className="procedure-image" />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="cta-container">
                        <div className="cta-left">
                            <h2 className="cta-title">Ready to improve your vision? Schedule your appointment today!</h2>
                            <button className="appointment-button">Make an Appointment</button>
                        </div>
                        <div className="cta-right">
                            <p className="cta-subtitle">Call us now for immediate assistance</p>
                            <div className="phone-cta">
                                <span className="phone-icon-large">📞</span>
                                <span className="phone-number-large">(555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Correction Surgery Section */}
                <section className="vision-correction-section">
                    <div className="vision-correction-container">
                        <div className="vision-correction-image">
                            <img src="/placeholder.svg?height=400&width=600" alt="Vision correction" className="correction-image" />
                        </div>
                        <div className="vision-correction-content">
                            <div className="countdown-container">
                                <div className="countdown-item">
                                    <div className="countdown-value">{countdown.days}</div>
                                    <div className="countdown-label">Days</div>
                                </div>
                                <div className="countdown-item">
                                    <div className="countdown-value">{countdown.hours}</div>
                                    <div className="countdown-label">Hours</div>
                                </div>
                                <div className="countdown-item">
                                    <div className="countdown-value">{countdown.minutes}</div>
                                    <div className="countdown-label">Min</div>
                                </div>
                                <div className="countdown-item">
                                    <div className="countdown-value">{countdown.seconds}</div>
                                    <div className="countdown-label">Sec</div>
                                </div>
                            </div>
                            <h2 className="vision-correction-title">Vision Correction Surgery</h2>
                            <p className="vision-correction-description">
                                Neque gravida in fermentum et sollicitudin. Sit amet nulla facilisi morbi. Ipsum a arcu cursus vitae
                                congue mauris rhoncus. Tempor commodo ullamcorper
                            </p>
                            <button className="appointment-button-blue">
                                <span>Make an Appointment</span>
                                <span className="arrow-icon">→</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Eye Disorders Section */}
                <section className="eye-disorders-section">
                    <h2 className="eye-disorders-title">
                        Common <span className="highlight">Eye Disorders</span> and Diseases
                    </h2>

                    <div className="eye-disorders-container">
                        <div className="disorders-sidebar">
                            <ul className="disorders-list">
                                {eyeDisorders.map((disorder, index) => (
                                    <li
                                        key={index}
                                        className={index === activeDisorder ? "active" : ""}
                                        onClick={() => setActiveDisorder(index)}
                                    >
                                        {disorder}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="disorder-content">
                            <div className="disorder-header">
                                <div className="disorder-image">
                                    <img src="/placeholder.svg?height=200&width=200" alt="Myopia" className="circular-image" />
                                </div>
                                <div className="disorder-info">
                                    <h3 className="disorder-title">Myopia</h3>
                                    <p className="disorder-description">
                                        Varius vel pharetra vel turpis nunc eget lorem. Vivamus at augue eget arcu dictum. Tincidunt
                                        praesent semper feugiat nisl sed. Odio morbi quis commodo odio aenean sed. Nibh nisl condimentum id
                                        venenatis a. Ut placerat orci nulla pellentesque dignissim enim sit.
                                    </p>
                                </div>
                            </div>

                            <div className="symptoms-grid">
                                {myopiaSymptoms.map((symptom, index) => (
                                    <div key={index} className="symptom-item">
                                        <div className="symptom-icon"></div>
                                        <span>{symptom}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="testimonials-section">
                    <h2 className="testimonials-title">Our Patients are Saying</h2>

                    <div className="testimonials-container">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className={`testimonial-card ${index === activeTestimonial ? "active" : ""}`}>
                                <h3 className="testimonial-title">{testimonial.title}</h3>
                                <p className="testimonial-content">"{testimonial.content}"</p>
                                <div className="testimonial-author">
                                    <div className="author-image">
                                        <img src="/placeholder.svg?height=50&width=50" alt={testimonial.author} />
                                    </div>
                                    <div className="author-info">
                                        <div className="author-name">{testimonial.author}</div>
                                        <div className="author-source">{testimonial.source}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="testimonial-dots">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === activeTestimonial ? "active" : ""}`}
                                onClick={() => setActiveTestimonial(index)}
                                aria-label={`Testimonial ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                </section>

                {/* Appointment Booking Section */}
                <section className="service-appointment-booking-section appointment-booking-section">
                    <div className="appointment-booking-container">
                        <div className="calendar-widget">
                            <h3 className="calendar-title">August</h3>
                            <div className="calendar-grid">
                                <div className="calendar-header">
                                    <span>S</span>
                                    <span>M</span>
                                    <span>T</span>
                                    <span>W</span>
                                    <span>T</span>
                                    <span>F</span>
                                    <span>S</span>
                                </div>
                                <div className="calendar-body">
                                    {[...Array(31)].map((_, index) => {
                                        const day = index + 1
                                        return (
                                            <button
                                                key={day}
                                                className={`calendar-day ${day === selectedDate ? "selected" : ""}`}
                                                onClick={() => setSelectedDate(day)}
                                            >
                                                {day}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="appointment-content">
                            <h2 className="appointment-title">
                                Book an Eye Care <br />
                                <span className="highlight">Appointment</span>
                            </h2>
                            <p className="appointment-description">
                                Neque gravida in fermentum et sollicitudin. Sit amet nulla facilisi morbi. Ipsum a arcu cursus vitae
                                congue mauris rhoncus. Tempor commodo ullamcorper
                            </p>
                            <button className="appointment-button">Make an Appointment</button>
                        </div>
                    </div>
                </section>
                {/* Footer */}
                <Footer />
            </div>
        </div>
    )
}

export default EyeServices
