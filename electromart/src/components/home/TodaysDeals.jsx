import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiZap, FiArrowRight } from "react-icons/fi";
import ProductCard from "../common/Card/ProductCard";
import ProductSkeleton from "../common/Skeleton/ProductSkeleton";
import ProductService from "../../services/product.service";
import "./TodaysDeals.css";

const TodaysDeals = () => {
    const navigate = useNavigate();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 45 });

    useEffect(() => {
        let isMounted = true;
        const fetchDeals = async () => {
            try {
                const data = await ProductService.getDeals(8);
                if (isMounted) {
                    setDeals(data);
                }
            } catch (err) {
                console.error("Error loading today's deals:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDeals();

        // Live countdown timer until midnight
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(23, 59, 59, 999);
            const diff = midnight - now;
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const formatTime = (num) => String(num).padStart(2, "0");

    if (!loading && deals.length === 0) {
        return null; // Don't render section if no deals
    }

    return (
        <section className="todays-deals-section">
            <div className="container">
                <div className="deals-header">
                    <div className="deals-header-left">
                        <div className="deals-badge">
                            <FiZap /> <span>FLASH MARKETPLACE DEALS</span>
                        </div>
                        <h2 className="deals-title">Today's Best Electronics Deals</h2>
                        <p className="deals-subtitle">
                            Deep discounts curated across verified business and individual sellers.
                        </p>
                    </div>

                    <div className="deals-header-right">
                        <div className="deals-timer">
                            <span className="timer-label"><FiClock /> Ends In:</span>
                            <div className="timer-boxes">
                                <span className="time-box"><strong>{formatTime(timeLeft.hours)}</strong>h</span>
                                <span className="timer-colon">:</span>
                                <span className="time-box"><strong>{formatTime(timeLeft.minutes)}</strong>m</span>
                                <span className="timer-colon">:</span>
                                <span className="time-box highlight"><strong>{formatTime(timeLeft.seconds)}</strong>s</span>
                            </div>
                        </div>

                        <button
                            className="deals-view-all-btn"
                            onClick={() => navigate("/deals")}
                        >
                            <span>All Deals</span>
                            <FiArrowRight />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="deals-grid">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <ProductSkeleton key={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="deals-grid">
                        {deals.slice(0, 8).map((product) => (
                            <div key={product._id} className="deal-card-wrapper">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TodaysDeals;
