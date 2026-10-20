import React, { useEffect, useState } from "react";
import { FiTag, FiClock, FiZap, FiPercent } from "react-icons/fi";
import ProductService from "../services/product.service";
import ProductCard from "../components/common/Card/ProductCard";
import ProductSkeleton from "../components/common/Skeleton/ProductSkeleton";
import "./Deals.css";

const Deals = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minDiscount, setMinDiscount] = useState(15);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError("");
        // Fetch up to 50 products and filter for good discounts
        const response = await ProductService.getProducts({ limit: 50, sort: "priceLow" });
        const items = response.data?.products || [];
        setDealProducts(items);
      } catch (err) {
        console.error("Deals error:", err);
        setError("Unable to load latest deals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const filteredDeals = dealProducts.filter((p) => (p.discount_percentage || 0) >= minDiscount);

  return (
    <div className="deals-page container">
      {/* Banner */}
      <div className="deals-hero">
        <div className="deals-hero-content">
          <div className="deals-badge">
            <FiZap /> Limited Time Flash Deals
          </div>
          <h1>Massive Savings on Flagship Electronics</h1>
          <p>Verified discounts across premium smartphones, ultrabooks, gaming monitors, and audio gear.</p>
          <div className="deals-timer-pill">
            <FiClock /> <span>Deals refresh daily at midnight IST</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="deals-filter-bar">
        <div className="discount-tabs">
          <span className="filter-label">Filter by minimum discount:</span>
          {[10, 15, 20, 30].map((disc) => (
            <button
              key={disc}
              className={`discount-tab ${minDiscount === disc ? "active" : ""}`}
              onClick={() => setMinDiscount(disc)}
            >
              <FiPercent /> {disc}%+ OFF
            </button>
          ))}
        </div>
        <div className="deals-count">
          Showing <strong>{filteredDeals.length}</strong> discounted items
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="deals-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="deals-error">
          <p>{error}</p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="deals-empty">
          <FiTag className="empty-icon" />
          <h3>No deals matching {minDiscount}%+ discount right now</h3>
          <p>Try selecting a lower discount threshold above or check back shortly.</p>
          <button className="reset-deal-btn" onClick={() => setMinDiscount(10)}>
            View All Offers
          </button>
        </div>
      ) : (
        <div className="deals-grid">
          {filteredDeals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Deals;
