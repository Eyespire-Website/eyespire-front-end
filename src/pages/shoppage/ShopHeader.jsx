import React from 'react';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import './shop-header.css';

export default function ShopHeader() {
    return (
        <>
            <div className="shop-header">
                <Header /> {/* Sử dụng header chung */}
                {/* Breadcrumb Navigation */}
                <nav className="breadcrumb-nav">
                    <div className="breadcrumb-container">
                        <Link to="/" className="breadcrumb-link">
                            Home
                        </Link>
                        <FaChevronRight className="breadcrumb-icon" />
                        <span className="breadcrumb-current">Shop</span>
                    </div>
                </nav>

                {/* Main Heading */}
                <h1 className="main-heading">Shop</h1>
            </div>
        </>
    );
}
