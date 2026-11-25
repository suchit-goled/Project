import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "../common/Card/ProductCard";
import ProductSkeleton from "../common/Skeleton/ProductSkeleton";
import ProductService from "../../services/product.service";
import "./TodaysDeals.css";

const TodaysDeals = () => {
    const navigate = useNavigate();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

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
        return () => {
            isMounted = false;
        };
    }, []);

    if (!loading && deals.length === 0) {
        return null;
    }

    return (
        <section className="todays-deals-section">
            <div className="catalog-container">
                <div className="deals-header">
                    <div className="deals-header-left">
                        <span className="deals-kicker">Price Reductions</span>
                        <h2 className="deals-title font-serif">Current Equipment Markdowns</h2>
                        <p className="deals-subtitle">
                            Verified discounts across authorised sellers.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="deals-view-all-btn"
                        onClick={() => navigate("/deals")}
                    >
                        <span>View all deals</span>
                        <FiArrowRight size={15} />
                    </button>
                </div>

                {loading ? (
                    <div className="deals-grid">
                        {[...Array(4)].map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="deals-grid">
                        {deals.map((item) => (
                            <ProductCard key={item._id} product={item} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TodaysDeals;
