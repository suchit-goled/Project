import React, { useState, useEffect } from "react";
import { FiClock, FiTrash2 } from "react-icons/fi";
import ProductCard from "../common/Card/ProductCard";
import "./RecentlyViewed.css";

const STORAGE_KEY = "electronova_recently_viewed";

const RecentlyViewed = () => {
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setRecentProducts(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to parse recently viewed products", e);
        }
    }, []);

    const clearHistory = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setRecentProducts([]);
        } catch (e) {
            console.error("Failed to clear recently viewed", e);
        }
    };

    if (recentProducts.length === 0) return null;

    return (
        <section className="recently-viewed-section">
            <div className="container">
                <div className="recently-viewed-header">
                    <div className="recently-viewed-title-group">
                        <span className="recently-viewed-pill">
                            <FiClock /> YOUR BROWSING HISTORY
                        </span>
                        <h2 className="recently-viewed-title">Recently Viewed Electronics</h2>
                    </div>

                    <button
                        className="clear-recent-btn"
                        onClick={clearHistory}
                        title="Clear Browsing History"
                    >
                        <FiTrash2 /> Clear History
                    </button>
                </div>

                <div className="recently-viewed-grid">
                    {recentProducts.slice(0, 4).map((product) => (
                        <div key={product._id || product.id} className="recent-card-wrapper">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
