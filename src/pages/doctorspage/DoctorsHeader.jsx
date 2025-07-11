import React from 'react';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import './doctors-header.css';

export default function DoctorsHeader() {
    return (
        <>
            <div className="dth-doctors-header">
                <Header /> {/* Sử dụng header chung */}
                {/* Breadcrumb Navigation */}
                <nav className="dth-breadcrumb-nav">
                    <div className="dth-breadcrumb-container">
                        <Link to="/" className="dth-breadcrumb-link">
                            Home
                        </Link>
                        <FaChevronRight className="dth-breadcrumb-icon" />
                        <span className="dth-breadcrumb-current">Doctors</span>
                    </div>
                </nav>

                {/* Main Heading */}
                <h1 className="dth-main-heading">Đội ngũ bác sĩ</h1>
                <p className="dth-sub-heading">Gặp gỡ đội ngũ bác sĩ chuyên nghiệp của chúng tôi</p>
            </div>
        </>
    );
}
