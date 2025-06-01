import React from 'react';
import Header from '../../../components/Header/Header'; // Import Header chung đúng đường dẫn
import {Link} from 'react-router-dom'; // Thay thế next/link bằng react-router-dom
import {FaChevronRight} from 'react-icons/fa'; // Thay thế ChevronRight bằng FaChevronRight từ React Icons
import '../css/about-title.css';

export default function AboutHeader() {
    return (
        <>

            <div className="about-header11">
                <Header/> {/* Giữ header chung */}
                {/* Breadcrumb Navigation */}
                <nav className="breadcrumb-nav11">
                    <div className="breadcrumb-container11">
                        <Link to="/"
                              className="breadcrumb-link11"> {/* Thay Link từ next/link bằng Link từ react-router-dom */}
                            Home
                        </Link>
                        <FaChevronRight className="breadcrumb-icon11"/> {/* Giữ lại FaChevronRight */}
                        <span className="breadcrumb-current11">About</span>
                    </div>
                </nav>

                {/* Main Heading */}
                <h1 className="main-heading11">About EyeSpire </h1>
            </div>
        </>
    );
}