import React from "react";
import { FiRotateCcw, FiCheckCircle, FiAlertCircle, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Policies.css";

const ReturnsPolicy = () => {
  return (
    <div className="policy-page container">
      <div className="policy-header">
        <span className="policy-badge">Hassle-Free Returns</span>
        <h1>Returns & Refund Policy</h1>
        <p>Transparent, fair, and customer-first return guidelines for your peace of mind.</p>
      </div>

      <div className="policy-grid">
        <div className="policy-card">
          <div className="policy-icon-box"><FiRotateCcw /></div>
          <h3>7-Day Replacement Window</h3>
          <p>Eligible products can be returned or replaced within <strong>7 days of delivery</strong> in case of hardware defects, dead-on-arrival (DOA) units, or incorrect items.</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiCheckCircle /></div>
          <h3>Eligible Return Conditions</h3>
          <p>The product must be returned with its original retail box, serial numbers intact, warranty cards, power adapters, and all bundled accessories.</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiAlertCircle /></div>
          <h3>Non-Returnable Items</h3>
          <p>Opened consumables, screen protectors once applied, software activation keys, and devices with customer-induced physical or liquid damage are exempt.</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiShield /></div>
          <h3>Refund Timelines</h3>
          <p>Once inspected and verified at our fulfillment center, refunds are credited to the original payment method within <strong>3–5 business days</strong>.</p>
        </div>
      </div>

      <div className="policy-body">
        <h2>How to Initiate a Return or Replacement</h2>
        <ol className="policy-steps">
          <li>Navigate to your <Link to="/orders" className="policy-link">My Orders</Link> page.</li>
          <li>Select the relevant order and view the items.</li>
          <li>Contact our support team via <Link to="/contact" className="policy-link">Support Contact</Link> or email <strong>returns@electronova.tech</strong> with your Order ID and photos/videos of the defect.</li>
          <li>Our reverse courier partner will pick up the package from your doorstep at zero cost.</li>
        </ol>

        <h2>Cash on Delivery (COD) Refunds</h2>
        <p>For orders paid via Cash on Delivery, our support team will prompt you for secure bank transfer (NEFT/IMPS) details or UPI ID upon return pickup verification.</p>
      </div>
    </div>
  );
};

export default ReturnsPolicy;
