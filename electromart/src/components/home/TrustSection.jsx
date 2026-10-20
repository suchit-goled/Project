import React from "react";
import { FiShield, FiTruck, FiAward, FiRotateCcw, FiLock } from "react-icons/fi";
import "./TrustSection.css";

const TrustSection = () => {
  const trustItems = [
    {
      icon: <FiAward />,
      title: "100% Genuine Tech",
      desc: "Sourced directly from brand-authorized distributors with serial numbers intact."
    },
    {
      icon: <FiTruck />,
      title: "Free Express Shipping",
      desc: "Complimentary priority dispatch on all orders over ₹1,000 across India."
    },
    {
      icon: <FiShield />,
      title: "Official 1-Year Warranty",
      desc: "Manufacturer-backed warranty honored at all authorized service centers nationwide."
    },
    {
      icon: <FiRotateCcw />,
      title: "7-Day Replacement",
      desc: "Hassle-free replacement for any dead-on-arrival or defective hardware."
    },
    {
      icon: <FiLock />,
      title: "256-Bit SSL Checkout",
      desc: "Bank-grade encrypted payments via UPI, Razorpay, Credit/Debit cards & COD."
    }
  ];

  return (
    <section className="home-trust-section">
      <div className="container">
        <div className="trust-grid">
          {trustItems.map((item, idx) => (
            <div key={idx} className="home-trust-card">
              <div className="home-trust-icon">
                {item.icon}
              </div>
              <div className="home-trust-content">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
