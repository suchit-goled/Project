import React from "react";
import { FiCpu, FiAward, FiTool, FiCheckSquare } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Policies.css";

const WarrantyGuide = () => {
  return (
    <div className="policy-page container">
      <div className="policy-header">
        <span className="policy-badge">Brand Certified</span>
        <h1>1-Year Manufacturer Warranty Guide</h1>
        <p>Every product sold on ElectroNova is sourced directly from authorized brand distributors with valid manufacturer warranty.</p>
      </div>

      <div className="policy-grid">
        <div className="policy-card">
          <div className="policy-icon-box"><FiAward /></div>
          <h3>100% Genuine Brand Warranty</h3>
          <p>You receive the full original manufacturer warranty (minimum 1 year for smartphones, laptops, monitors, and audio gear).</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiCpu /></div>
          <h3>Authorized Service Centers</h3>
          <p>Warranty is serviceable at any authorized service center nationwide (Apple Care, Samsung Service, Sony, Dell, Lenovo, Asus, etc.).</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiTool /></div>
          <h3>What Is Covered</h3>
          <p>Internal hardware failures, motherboard malfunctions, battery degradation beyond threshold, defective displays, and factory assembly flaws.</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiCheckSquare /></div>
          <h3>Instant GST Tax Invoice</h3>
          <p>Your official tax invoice downloaded from <Link to="/orders" className="policy-link">My Orders</Link> acts as proof of purchase for all warranty claims.</p>
        </div>
      </div>

      <div className="policy-body">
        <h2>How to Claim Warranty</h2>
        <p>1. Download your order invoice from your ElectroNova account profile.</p>
        <p>2. Locate your nearest authorized brand service center using the brand's official support portal.</p>
        <p>3. Present the invoice and the product along with its retail serial number.</p>
        <p>Need assistance finding a service center or resolving a warranty dispute? Reach out via our <Link to="/contact" className="policy-link">Customer Help Center</Link>.</p>
      </div>
    </div>
  );
};

export default WarrantyGuide;
