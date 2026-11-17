import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiStar, FiMapPin, FiTruck, FiArrowRight, FiShield, FiBriefcase } from "react-icons/fi";
import ProductService from "../../services/product.service";
import "./TopSellersSection.css";

const TopSellersSection = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchStores = async () => {
            try {
                const data = await ProductService.getTopRatedStores(6);
                if (isMounted) {
                    setStores(data);
                }
            } catch (err) {
                console.error("Failed to load top stores:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchStores();
        return () => { isMounted = false; };
    }, []);

    if (!loading && stores.length === 0) return null;

    return (
        <section className="top-sellers-section">
            <div className="container">
                <div className="top-sellers-header">
                    <div>
                        <span className="sellers-pill">
                            <FiShield /> TRUSTED PARTNERS
                        </span>
                        <h2 className="top-sellers-title">Top-Rated Verified Electronics Sellers</h2>
                        <p className="top-sellers-subtitle">
                            Buy directly from certified business retailers and top electronics merchants across India.
                        </p>
                    </div>

                    <button
                        className="become-seller-banner-btn"
                        onClick={() => navigate("/seller/register")}
                    >
                        <FiBriefcase /> Sell on ElectroNova
                    </button>
                </div>

                <div className="top-sellers-grid">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="seller-card-skeleton" />
                        ))
                    ) : (
                        stores.map((store) => (
                            <div
                                key={store._id}
                                className="marketplace-seller-card"
                                onClick={() => navigate(`/stores/${store.slug}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && navigate(`/stores/${store.slug}`)}
                            >
                                <div className="seller-card-header">
                                    <div className="seller-avatar">
                                        {store.logo ? (
                                            <img src={store.logo} alt={store.name} />
                                        ) : (
                                            <div className="seller-avatar-fallback">
                                                {store.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="seller-info">
                                        <div className="seller-name-row">
                                            <h4 className="seller-store-name">{store.name}</h4>
                                            {store.isVerified && (
                                                <span className="verified-badge" title="KYC & GSTIN Verified">
                                                    <FiCheckCircle /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="seller-meta-row">
                                            <span className="seller-rating">
                                                <FiStar className="star-icon" /> {store.rating?.toFixed(1) || "4.8"}
                                                <span className="review-count">({store.reviewCount || 120}+)</span>
                                            </span>
                                            {store.pickupAddress?.city && (
                                                <span className="seller-location">
                                                    <FiMapPin /> {store.pickupAddress.city}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="seller-description">
                                    {store.description || "Authorized electronics partner offering genuine products with official manufacturer warranty."}
                                </p>

                                <div className="seller-card-footer">
                                    <div className="delivery-tags">
                                        {store.supportsPlatformDelivery && (
                                            <span className="delivery-tag platform">
                                                <FiTruck /> ElectroNova Fulfilled
                                            </span>
                                        )}
                                        {store.supportsSellerDelivery && (
                                            <span className="delivery-tag seller">Direct Dispatch</span>
                                        )}
                                    </div>
                                    <span className="view-store-link">
                                        Visit Store <FiArrowRight />
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default TopSellersSection;
