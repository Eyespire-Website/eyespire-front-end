import React from 'react';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import './product-header.css';

export default function ProductHeader({ productName }) {
    return (
        <>
            <div className="product-header">
                <Header /> {/* Sử dụng header chung */}
                {/* Breadcrumb Navigation */}
                <nav className="breadcrumb-nav">
                    <div className="breadcrumb-container">
                        <Link to="/" className="breadcrumb-link">
                            Home
                        </Link>
                        <FaChevronRight className="breadcrumb-icon" />
                        <Link to="/shop" className="breadcrumb-link">
                            Shop
                        </Link>
                        <FaChevronRight className="breadcrumb-icon" />
                        <span className="breadcrumb-current">{productName}</span>
                    </div>
                </nav>

                {/* Main Heading */}
                <h1 className="main-heading">{productName}</h1>
            </div>
        </>
    );
}
