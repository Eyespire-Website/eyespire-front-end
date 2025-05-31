import React from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const HeroBanner = ({ paths, title }) => {
    return (
        <div className="breadcrumb-section">
            <div className="container">
                <div className="breadcrumb-content">
                    <div className="breadcrumb-nav">
                        {paths.map((path, index) => (
                            <React.Fragment key={path.url}>
                                <Link
                                    to={path.url}
                                    className={`breadcrumb-link ${index === paths.length - 1 ? 'active' : ''}`}
                                >
                                    {path.label}
                                </Link>
                                {index < paths.length - 1 && <span className="separator">›</span>}
                            </React.Fragment>
                        ))}
                    </div>
                    <h1>{title}</h1>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;