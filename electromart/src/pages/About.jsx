import React from "react";
import { FiShield, FiTrendingUp, FiZap, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Policies.css";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page container">
      <div className="policy-header">
        <span className="policy-badge">Our Mission</span>
        <h1>Engineered for Tech Enthusiasts</h1>
        <p>Curating cutting-edge electronics with relentless quality standards and transparent service.</p>
      </div>

      <div className="policy-card">
        <h2>Who We Are</h2>
        <p>
          Founded in 2024, ElectroNova was created to bridge the gap between premium consumer electronics and dependable, authenticated customer service. We handpick flagship devices across laptops, flagship smartphones, studio monitors, noise-cancelling headphones, and smart home ecosystems.
        </p>
      </div>

      <div className="policy-grid">
        <div className="policy-grid-card">
          <FiShield className="policy-grid-icon" />
          <h3>100% Genuine Guaranteed</h3>
          <p>Every product is sourced directly from authorized manufacturers or licensed brand distributors.</p>
        </div>
        <div className="policy-grid-card">
          <FiTrendingUp className="policy-grid-icon" />
          <h3>Strict Quality Control</h3>
          <p>Multi-point diagnostic inspection ensuring flawless build and authentic warranties.</p>
        </div>
        <div className="policy-grid-card">
          <FiZap className="policy-grid-icon" />
          <h3>Rapid Delivery</h3>
          <p>Express fulfillment hubs across all metropolitan zones for 2-4 day doorstep arrival.</p>
        </div>
        <div className="policy-grid-card">
          <FiUsers className="policy-grid-icon" />
          <h3>Dedicated Support</h3>
          <p>Direct access to hardware specialists for guidance, setups, and claims.</p>
        </div>
      </div>

      <div className="policy-footer">
        <p>Have questions or looking for partner opportunities?</p>
        <button className="policy-cta-btn" onClick={() => navigate("/contact")}>
          Contact Our Team
        </button>
      </div>
    </div>
  );
};

export default About;
