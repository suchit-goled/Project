import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiTag,
  FiShield,
  FiTruck,
  FiAward,
  FiZap,
  FiCheckCircle
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import "./Hero.css";

import macbook from "../../../assets/products/macbook.png";
import iphone from "../../../assets/products/iphone.png";
import watch from "../../../assets/products/watch.png";
import headphone from "../../../assets/products/headphone.png";

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const showcaseItems = [
    {
      id: "macbook",
      tabLabel: "Laptops",
      title: "Apple MacBook Pro 16\"",
      category: "High-Performance Laptops",
      price: "₹1,99,900",
      oldPrice: "₹2,49,900",
      discount: "20% OFF",
      specs: ["Apple M3 Max Chip", "36GB Unified Memory", "Liquid Retina XDR"],
      image: macbook,
      searchQuery: "MacBook"
    },
    {
      id: "iphone",
      tabLabel: "Phones",
      title: "iPhone 16 Pro Max",
      category: "Flagship Smartphones",
      price: "₹1,34,900",
      oldPrice: "₹1,44,900",
      discount: "₹10,000 Off",
      specs: ["A18 Pro Bionic", "Grade 5 Titanium", "48MP Fusion Camera"],
      image: iphone,
      searchQuery: "iPhone"
    },
    {
      id: "watch",
      tabLabel: "Wearables",
      title: "Apple Watch Ultra 2",
      category: "Smart Wearables",
      price: "₹79,900",
      oldPrice: "₹89,900",
      discount: "11% OFF",
      specs: ["49mm Titanium Case", "36h Battery Life", "Precision Dual GPS"],
      image: watch,
      searchQuery: "Watch"
    },
    {
      id: "headphone",
      tabLabel: "Audio",
      title: "Sony WH-1000XM5 Wireless",
      category: "Hi-Res Noise Cancelling",
      price: "₹26,990",
      oldPrice: "₹34,990",
      discount: "23% OFF",
      specs: ["Auto NC Optimizer", "30h Battery Life", "Integrated Processor V1"],
      image: headphone,
      searchQuery: "Sony"
    }
  ];

  const currentItem = showcaseItems[activeTab];

  return (
    <section className="hero">
      <div className="container hero__container">
        {/* LEFT COLUMN */}
        <div className="hero__left">
          <div className="hero__badge">
            <FiZap className="badge-zap" />
            <span>Authorised Consumer Electronics Retailer</span>
          </div>

          <h1 className="hero__title">
            Next-Gen Tech, <br />
            <span className="hero__title-gradient">Delivered to Your Door.</span>
          </h1>

          <p className="hero__description">
            Discover over 8,800+ authentic smartphones, pro laptops, hi-res audio, and smart gear from Apple, Sony, Samsung, HP, and Bose. 100% genuine sealed stock backed by official manufacturer warranty.
          </p>

          <div className="hero__buttons">
            <button
              className="hero__btn-primary"
              onClick={() => navigate("/products")}
            >
              <span>Explore 8,800+ Products</span>
              <FiArrowRight />
            </button>

            <button
              className="hero__btn-secondary"
              onClick={() => navigate("/deals")}
            >
              <FiTag />
              <span>Festive Flash Deals</span>
            </button>
          </div>

          <div className="hero__stats">
            <div className="stat-card">
              <div className="stat-icon"><FiAward /></div>
              <div>
                <h3>8,800+</h3>
                <span>Verified Products</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiShield /></div>
              <div>
                <h3>100%</h3>
                <span>Brand Warranty</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiTruck /></div>
              <div>
                <h3>Free 48h</h3>
                <span>Express Shipping</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - BESPOKE PRODUCT SPOTLIGHT */}
        <div className="hero__right">
          <div className="spotlight-card">
            {/* Device Switcher Tabs */}
            <div className="spotlight-tabs">
              {showcaseItems.map((item, idx) => (
                <button
                  key={item.id}
                  className={`spotlight-tab ${activeTab === idx ? "active" : ""}`}
                  onClick={() => setActiveTab(idx)}
                >
                  {item.tabLabel}
                </button>
              ))}
            </div>

            {/* Floating Top Badge */}
            <div className="spotlight-top-badge">
              <FiCheckCircle size={13} color="#059669" />
              <span>Sealed Manufacturer Stock</span>
            </div>

            {/* Image Preview */}
            <div className="spotlight-image-container">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="spotlight-img"
                width="320"
                height="180"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Details Box */}
            <div className="spotlight-content">
              <div className="spotlight-meta-header">
                <span className="spotlight-category">{currentItem.category}</span>
                <span className="spotlight-discount-badge">{currentItem.discount}</span>
              </div>

              <h2 className="spotlight-title">{currentItem.title}</h2>

              <div className="spotlight-specs-row">
                {currentItem.specs.map((spec, i) => (
                  <span key={i} className="spotlight-spec-chip">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="spotlight-price-row">
                <div className="spotlight-prices">
                  <span className="spotlight-current-price">{currentItem.price}</span>
                  <span className="spotlight-old-price">{currentItem.oldPrice}</span>
                </div>

                <button
                  className="spotlight-action-btn"
                  onClick={() => navigate(`/products?search=${encodeURIComponent(currentItem.searchQuery)}`)}
                >
                  <span>View Details</span>
                  <FiArrowRight />
                </button>
              </div>

              <div className="spotlight-footer-trust">
                <div className="spotlight-rating">
                  <FaStar color="#f59e0b" size={12} />
                  <span>4.9/5 Rating (1,200+ Reviews)</span>
                </div>
                <span className="spotlight-stock-status">• In Stock for Same-Day Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
