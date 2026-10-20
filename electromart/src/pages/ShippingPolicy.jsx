import React from "react";
import { FiTruck, FiClock, FiShield, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Policies.css";

const ShippingPolicy = () => {
  return (
    <div className="policy-page container">
      <div className="policy-header">
        <span className="policy-badge">Customer Assurance</span>
        <h1>Shipping & Delivery Policy</h1>
        <p>Fast, secure, and fully tracked delivery across India for all electronics.</p>
      </div>

      <div className="policy-grid">
        <div className="policy-card">
          <div className="policy-icon-box"><FiTruck /></div>
          <h3>Free Shipping Threshold</h3>
          <p>We provide <strong>FREE express delivery</strong> on all orders above <strong>₹1,000</strong>. Orders under ₹1,000 incur a flat nominal shipping fee of ₹99.</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiClock /></div>
          <h3>Delivery Timelines</h3>
          <p>Metro cities (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata): <strong>2–3 business days</strong>. Tier 2 & Tier 3 cities: <strong>3–5 business days</strong>.</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiPackage /></div>
          <h3>Discreet & Secure Packaging</h3>
          <p>Every flagship device is packed in tamper-evident, multi-layered anti-shock packaging to prevent transit damage or unauthorized inspection.</p>
        </div>

        <div className="policy-card">
          <div className="policy-icon-box"><FiShield /></div>
          <h3>Transit Insurance</h3>
          <p>All shipments are 100% insured against loss or damage in transit. If an issue occurs, we immediately dispatch an expedited replacement.</p>
        </div>
      </div>

      <div className="policy-body">
        <h2>Order Tracking & Dispatch Process</h2>
        <p>Once your payment is confirmed or Cash on Delivery order verified, our automated warehouse fulfills the order within 24 hours. You will receive an immediate SMS and email notification with your tracking number and order details.</p>
        <p>You can also check live status directly inside your <Link to="/orders" className="policy-link">My Orders</Link> dashboard at any time.</p>

        <h2>Delivery FAQs</h2>
        <div className="faq-item">
          <strong>Do you deliver on weekends?</strong>
          <p>Yes, our courier partners (BlueDart, Delhivery, and DTDC) deliver on Saturdays and Sundays in most major metropolitan areas.</p>
        </div>
        <div className="faq-item">
          <strong>Can I change my delivery address after placing an order?</strong>
          <p>Address modifications can be requested through <Link to="/contact" className="policy-link">Customer Support</Link> within 2 hours of order placement before shipment handover.</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
