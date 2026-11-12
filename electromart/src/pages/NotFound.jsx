import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiAlertTriangle, FiHelpCircle, FiArrowRight } from "react-icons/fi";
import "./Policies.css";

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    const errorDetails = location.state?.errorDetails || location.state?.message;
    const requestedPath = location.pathname;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const popularCategories = [
        { label: "Smartphones", path: "/products/category/smartphones" },
        { label: "Laptops", path: "/products/category/laptops" },
        { label: "Premium Audio", path: "/products/category/audio" },
        { label: "Flash Deals", path: "/deals" },
    ];

    return (
        <div className="policy-page container notfound-container">
            <div className="notfound-icon-wrap">
                <FiAlertTriangle />
            </div>

            <span className="policy-badge">Error 404 • Resource Not Found</span>

            <h1 className="notfound-title">We Couldn't Find That Page</h1>

            <p className="notfound-description">
                The resource at <code className="notfound-path">{requestedPath}</code> may have been relocated, discontinued, or typed incorrectly.
            </p>

            {errorDetails && (
                <div className="notfound-details-box">
                    <strong>Technical Diagnostics:</strong>
                    <span>{errorDetails}</span>
                </div>
            )}

            {/* Quick in-page search */}
            <form className="notfound-search-form" onSubmit={handleSearch}>
                <div className="notfound-search-input-group">
                    <FiSearch className="notfound-search-icon" />
                    <input
                        type="text"
                        placeholder="Search for MacBook, iPhone, Sony headphones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search catalogue from 404 page"
                    />
                    <button type="submit" className="notfound-search-btn">
                        Search <FiArrowRight />
                    </button>
                </div>
            </form>

            {/* Popular recovery destinations */}
            <div className="notfound-suggestions">
                <span className="notfound-suggestions-title">Popular Categories:</span>
                <div className="notfound-chips-row">
                    {popularCategories.map((cat, idx) => (
                        <button
                            key={idx}
                            className="notfound-chip"
                            onClick={() => navigate(cat.path)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="notfound-actions">
                <Link to="/" className="notfound-primary-btn">
                    <FiHome /> Return to Storefront
                </Link>
                <Link to="/products" className="notfound-secondary-btn">
                    <FiSearch /> Browse Full Catalogue
                </Link>
                <Link to="/contact" className="notfound-text-btn">
                    <FiHelpCircle /> Contact Customer Support
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
