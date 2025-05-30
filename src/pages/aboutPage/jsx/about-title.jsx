import React from 'react';
import Header from '../../../components/Header/Header'; // Import Header chung đúng đường dẫn
import {Link} from 'react-router-dom'; // Thay thế next/link bằng react-router-dom
import {FaChevronRight} from 'react-icons/fa'; // Thay thế ChevronRight bằng FaChevronRight từ React Icons
import '../css/about-title.css';

export default function AboutHeader() {
    return (
        <>

            <div className="about-header">
                <Header/> {/* Giữ header chung */}
                {/* Breadcrumb Navigation */}
                <nav className="breadcrumb-nav">
                    <div className="breadcrumb-container">
                        <Link to="/"
                              className="breadcrumb-link"> {/* Thay Link từ next/link bằng Link từ react-router-dom */}
                            Home
                        </Link>
                        <FaChevronRight className="breadcrumb-icon"/> {/* Giữ lại FaChevronRight */}
                        <span className="breadcrumb-current">About</span>
                    </div>
                </nav>

                {/* Main Heading */}
                <h1 className="main-headingg">About EyeSpire </h1>
            </div>
        </>
    );
}