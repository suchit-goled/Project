import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSmartphone,
  FiHeadphones,
  FiMonitor,
  FiWatch,
  FiCamera,
  FiCpu,
  FiSpeaker,
  FiArrowRight
} from "react-icons/fi";
import "./Categories.css";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    { name: "Smartphones", key: "smartphones", icon: <FiSmartphone />, count: "2,400+ Products", desc: "Flagship & performance phones" },
    { name: "Laptops", key: "laptops", icon: <FiMonitor />, count: "1,800+ Products", desc: "Ultrabooks & gaming rigs" },
    { name: "Audio", key: "audio", icon: <FiHeadphones />, count: "1,200+ Products", desc: "Hi-Res noise cancelling" },
    { name: "Wearables", key: "wearables", icon: <FiWatch />, count: "650+ Products", desc: "Smartwatches & fitness trackers" },
    { name: "Gaming", key: "gaming", icon: <FiCpu />, count: "900+ Products", desc: "Consoles, peripherals & gear" },
    { name: "Cameras", key: "cameras", icon: <FiCamera />, count: "480+ Products", desc: "Mirrorless & 4K video" },
    { name: "Speakers", key: "speakers", icon: <FiSpeaker />, count: "550+ Products", desc: "Home audio & portable sound" },
  ];

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-section-header">
          <div>
            <span className="section-pill">Browse Catalogue</span>
            <h2 className="category-title">Shop by Category</h2>
            <p className="category-subtitle">Explore engineered devices tailored for productivity, creative mastery, and entertainment.</p>
          </div>
          <button
            className="view-all-cats-btn"
            onClick={() => navigate("/products")}
          >
            All Categories <FiArrowRight />
          </button>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="category-card"
              onClick={() => navigate(`/products/category/${cat.key}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/products/category/${cat.key}`)}
            >
              <div className="category-icon-wrapper">
                {cat.icon}
              </div>
              <div className="category-card-info">
                <h3 className="category-name">{cat.name}</h3>
                <span className="category-count">{cat.count}</span>
                <p className="category-desc">{cat.desc}</p>
              </div>
              <div className="category-card-arrow">
                <FiArrowRight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
