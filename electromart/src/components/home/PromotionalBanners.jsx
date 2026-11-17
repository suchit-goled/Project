import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShield, FiTruck, FiTag, FiZap } from "react-icons/fi";
import "./PromotionalBanners.css";

const PromotionalBanners = () => {
    const navigate = useNavigate();

    const banners = [
        {
            id: 1,
            badge: "SUPER DEALS",
            tagIcon: <FiZap />,
            title: "Flagship Smartphones & Laptops",
            subtitle: "Up to 45% off from verified marketplace sellers. 100% Brand Authenticity Guaranteed.",
            ctaText: "Shop Smartphones",
            ctaLink: "/products?category=Smartphones",
            highlight: "₹15,000 Instant Exchange",
            bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)",
            accentColor: "#6366f1",
            icon: "⚡",
        },
        {
            id: 2,
            badge: "MULTI-VENDOR ADVANTAGE",
            tagIcon: <FiTag />,
            title: "Compare Prices Across Sellers",
            subtitle: "Find the best deals from top-rated stores across India with transparent seller ratings.",
            ctaText: "View Today's Deals",
            ctaLink: "/deals",
            highlight: "Zero Commission Pricing",
            bgGradient: "linear-gradient(135deg, #042f2e 0%, #064e3b 60%, #065f46 100%)",
            accentColor: "#10b981",
            icon: "🏷️",
        },
        {
            id: 3,
            badge: "EXPRESS LOGISTICS",
            tagIcon: <FiTruck />,
            title: "Audio, Cameras & Gaming Gear",
            subtitle: "Next-day delivery available to 19,000+ Indian PIN codes on platform-fulfilled orders.",
            ctaText: "Explore Audio Gear",
            ctaLink: "/products?category=Headphones",
            highlight: "Free Express Shipping",
            bgGradient: "linear-gradient(135deg, #3b0764 0%, #4c1d95 60%, #5b21b6 100%)",
            accentColor: "#a855f7",
            icon: "🎧",
        },
    ];

    return (
        <section className="promotional-banners-section">
            <div className="container">
                <div className="promo-trust-ribbon">
                    <div className="trust-pill">
                        <FiShield className="trust-icon" />
                        <span><strong>100% Verified Sellers</strong> — KYC & GST Checked</span>
                    </div>
                    <div className="trust-pill">
                        <FiTag className="trust-icon" />
                        <span><strong>Multi-Seller Price Match</strong> — Best Rate Guarantee</span>
                    </div>
                    <div className="trust-pill">
                        <FiTruck className="trust-icon" />
                        <span><strong>Doorstep Delivery</strong> — PIN Code Coverage</span>
                    </div>
                </div>

                <div className="promo-banners-grid">
                    {banners.map((b) => (
                        <div
                            key={b.id}
                            className="promo-banner-card"
                            style={{ background: b.bgGradient }}
                        >
                            <div className="promo-card-glow" style={{ background: b.accentColor }} />
                            <div className="promo-card-content">
                                <div className="promo-card-top">
                                    <span className="promo-badge" style={{ borderColor: `${b.accentColor}60`, color: "#ffffff" }}>
                                        {b.tagIcon} {b.badge}
                                    </span>
                                    <span className="promo-highlight-tag">{b.highlight}</span>
                                </div>
                                <h3 className="promo-card-title">{b.title}</h3>
                                <p className="promo-card-subtitle">{b.subtitle}</p>
                                <button
                                    className="promo-card-cta"
                                    onClick={() => navigate(b.ctaLink)}
                                >
                                    <span>{b.ctaText}</span>
                                    <FiArrowRight />
                                </button>
                            </div>
                            <div className="promo-card-illustration" aria-hidden="true">
                                <span className="illustration-emoji">{b.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PromotionalBanners;
