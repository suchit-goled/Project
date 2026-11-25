import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import "./Hero.css";

const SPOTLIGHT_SPECS = {
  Laptops: {
    name: 'Apple MacBook Pro 16"',
    spec: "Apple M3 Max Chip",
    category: "laptops",
    price: "₹3,49,900",
  },
  Phones: {
    name: "iPhone 16 Pro Max",
    spec: "A18 Pro Bionic",
    category: "smartphones",
    price: "₹1,44,900",
  },
  Wearables: {
    name: "Apple Watch Ultra 2",
    spec: "Precision Dual GPS",
    category: "wearables",
    price: "₹89,900",
  },
};

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Laptops");
  const current = SPOTLIGHT_SPECS[activeTab];

  return (
    <section className="catalog-hero">
      <div className="catalog-container catalog-hero__grid">
        {/* Left: Editorial Copy Column (Clean Breathing Space) */}
        <div className="catalog-hero__copy">
          <span className="catalog-hero__kicker">
            Authorised Consumer Electronics Retailer
          </span>
          <h1 className="catalog-hero__headline font-serif">
            Precision Hardware, Delivered to Your Door.
          </h1>
          <p className="catalog-hero__lead">
            Independent equipment catalog featuring verified laptops, cameras,
            mechanical keyboards, and reference audio backed by manufacturer warranty.
          </p>

          <div className="catalog-hero__actions">
            <button
              type="button"
              className="btn-accent-catalog"
              onClick={() => navigate("/products")}
            >
              <span>Explore 8,800+ Products</span>
              <FiArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn-outline-catalog"
              onClick={() => navigate("/deals")}
            >
              Festive Flash Deals
            </button>
          </div>

          <dl className="catalog-hero__specs tabular-nums">
            <div className="catalog-hero__spec-item">
              <dt>Verified Products</dt>
              <dd>8,800+</dd>
            </div>
            <div className="catalog-hero__spec-item">
              <dt>Brand Warranty</dt>
              <dd>100%</dd>
            </div>
            <div className="catalog-hero__spec-item">
              <dt>Dispatch Window</dt>
              <dd>Free 48h</dd>
            </div>
          </dl>
        </div>

        {/* Right: Studio Editorial Photograph + Spec Index Card */}
        <div className="catalog-hero__visual">
          <div className="catalog-hero__photo-frame">
            <img
              src="/media/design/hero-headphones.webp"
              alt="Matte black and anodized aluminum studio reference headphones on warm stone surface"
              className="catalog-hero__photo"
            />
            <div className="catalog-hero__photo-bar">
              <span>Studio Reference Audio</span>
              <Link to="/products/category/headphones" className="catalog-hero__photo-link">
                Shop Headphones <FiArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Printed Spec Switcher */}
          <div className="catalog-hero__switcher" aria-label="Featured equipment index">
            <div className="catalog-hero__tabs">
              {Object.keys(SPOTLIGHT_SPECS).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={activeTab === tab}
                  className={`catalog-hero__tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="catalog-hero__tab-body">
              <div>
                <div className="catalog-hero__tab-name">{current.name}</div>
                <div className="catalog-hero__tab-spec">{current.spec}</div>
              </div>
              <div className="catalog-hero__tab-right">
                <span className="catalog-hero__tab-price tabular-nums">{current.price}</span>
                <Link
                  to={`/products/category/${current.category}`}
                  className="catalog-hero__tab-link"
                >
                  View department
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
