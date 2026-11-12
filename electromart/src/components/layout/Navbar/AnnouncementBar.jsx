import React from "react";
import "./AnnouncementBar.css";
import { FiTruck, FiShield, FiZap, FiLock } from "react-icons/fi";

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="container announcement-bar__container">
        <div className="announcement-item">
          <FiTruck className="announcement-icon" />
          <span>Free Express Shipping on Orders Over ₹1,000</span>
        </div>
        <div className="announcement-item announcement-item--desktop">
          <FiShield className="announcement-icon" />
          <span>100% Genuine Products with 1-Year Brand Warranty</span>
        </div>
        <div className="announcement-item announcement-item--desktop">
          <FiLock className="announcement-icon" />
          <span>256-Bit SSL Encrypted & Verified</span>
        </div>
        <div className="announcement-item announcement-item--desktop">
          <FiZap className="announcement-icon" />
          <span>24/7 Premium Customer Support</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
