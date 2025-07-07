import React from 'react';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import './cart-header.css';

export default function CartHeader() {
    return (
        <>
            <div className="crt-header">
                <Header /> {/* Sử dụng header chung */}
                {/* Breadcrumb Navigation */}
                <nav className="crt-breadcrumb-nav">
                    <div className="crt-breadcrumb-container">
                        <Link to="/" className="crt-breadcrumb-link">
                            Home
                        </Link>
                        <FaChevronRight className="crt-breadcrumb-icon" />
                        <Link to="/shop" className="crt-breadcrumb-link">
                            Shop
                        </Link>
                        <FaChevronRight className="crt-breadcrumb-icon" />
                        <span className="crt-breadcrumb-current">Giỏ hàng</span>
                    </div>
                </nav>

                {/* Main Heading */}
                <h1 className="crt-main-heading">Giỏ hàng của bạn</h1>
            </div>
        </>
    );
}
