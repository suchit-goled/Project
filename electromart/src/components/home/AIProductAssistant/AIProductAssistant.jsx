import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiCpu, 
  FiZap, 
  FiSearch, 
  FiSliders, 
  FiArrowRight, 
  FiCheckCircle, 
  FiActivity 
} from "react-icons/fi";
import "./AIProductAssistant.css";

const AIProductAssistant = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedPill, setSelectedPill] = useState(null);

  const smartPills = [
    {
      id: "gaming",
      label: "🎮 Ultra Gaming Laptops",
      query: "Laptop",
      category: "Laptops",
      match: "99% Neural Match",
      desc: "High refresh OLED, RTX graphics & multi-core performance",
    },
    {
      id: "audio",
      label: "🎧 Studio ANC Headphones",
      query: "Sony",
      category: "Headphones",
      match: "98% Neural Match",
      desc: "Audiophile Hi-Res wireless audio with active noise cancellation",
    },
    {
      id: "phones",
      label: "📱 Flagship 5G Smartphones",
      query: "iPhone",
      category: "Smartphones",
      match: "96% Neural Match",
      desc: "Pro cameras, titanium builds, and all-day battery efficiency",
    },
    {
      id: "cameras",
      label: "📸 4K Cinematic Cameras",
      query: "Camera",
      category: "Cameras",
      match: "94% Neural Match",
      desc: "Full-frame image sensors & professional stabilized video",
    },
    {
      id: "express",
      label: "⚡ Express 24h Delivery",
      query: "Watch",
      category: "Smartwatches",
      match: "97% Neural Match",
      desc: "Local certified seller inventory ready for immediate dispatch",
    },
  ];

  const handlePillClick = (pill) => {
    setSelectedPill(pill);
    setQuery(pill.query);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="ai-assistant-section">
      <div className="container">
        <div className="ai-assistant-card holographic-panel">
          {/* Header Bar */}
          <div className="ai-assistant-header">
            <div className="ai-assistant-title-group">
              <div className="ai-icon-badge">
                <FiCpu className="pulse-icon" />
              </div>
              <div>
                <div className="ai-badge-row">
                  <span className="cyber-badge">
                    <FiActivity size={11} />
                    ElectroNova Neural Discovery
                  </span>
                  <span className="ai-live-indicator">
                    <span className="live-dot" />
                    AI Engine Online
                  </span>
                </div>
                <h2 className="ai-heading">
                  Intelligent Gear Matchmaker
                </h2>
                <p className="ai-subtitle">
                  Describe what you need or pick an intelligent preset to instantly filter the marketplace with AI precision.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Search Bar */}
          <form className="ai-search-form" onSubmit={handleSearchSubmit}>
            <div className="ai-input-wrapper">
              <FiSearch className="ai-search-icon" />
              <input
                type="text"
                placeholder="Ask ElectroNova AI (e.g., 'MacBook M3 Max', 'Wireless earbuds with mic', 'Sony OLED')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="ai-submit-btn">
                <span>Run Discovery</span>
                <FiZap />
              </button>
            </div>
          </form>

          {/* Quick AI Presets */}
          <div className="ai-presets-container">
            <span className="presets-label">
              <FiSliders size={12} />
              Instant Neural Presets:
            </span>
            <div className="presets-pills-row">
              {smartPills.map((pill) => (
                <button
                  key={pill.id}
                  className={`preset-pill ${selectedPill?.id === pill.id ? "active" : ""}`}
                  onClick={() => handlePillClick(pill)}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Preset Preview Drawer */}
          {selectedPill && (
            <div className="ai-preset-preview">
              <div className="preview-left">
                <div className="match-tag">
                  <FiCheckCircle size={13} />
                  <span>{selectedPill.match}</span>
                </div>
                <h4>{selectedPill.label}</h4>
                <p>{selectedPill.desc}</p>
              </div>
              <button 
                className="preview-cta-btn"
                onClick={() => navigate(`/products?search=${encodeURIComponent(selectedPill.query)}`)}
              >
                <span>Browse {selectedPill.category} Matches</span>
                <FiArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIProductAssistant;
