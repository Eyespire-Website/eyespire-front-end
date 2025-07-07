import React from 'react';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import './services-header.css';

export default function ServicesHeader() {
    return (
        <>
            <div className="services-header">
                <Header /> {/* Sử dụng header chung */}
                {/* Breadcrumb Navigation */}
                <nav className="breadcrumb-nav">
                    <div className="breadcrumb-container">
                        <Link to="/" className="breadcrumb-link">
                            Home
                        </Link>
                        <FaChevronRight className="breadcrumb-icon" />
                        <span className="breadcrumb-current">Services</span>
                    </div>
                </nav>

                {/* Main Heading */}
                <h1 className="main-heading">Our Eye Care Services</h1>
                <p className="sub-heading">Professional eye care services for your vision health</p>
            </div>
        </>
    );
}
