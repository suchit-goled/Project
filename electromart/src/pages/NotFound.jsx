import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiSearch, FiAlertTriangle } from "react-icons/fi";
import "./Policies.css";

const NotFound = () => {
  return (
    <div className="policy-page container" style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "3.5rem", color: "var(--primary)", marginBottom: "16px" }}>
        <FiAlertTriangle />
      </div>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "12px" }}>404 — Page Not Found</h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 32px" }}>
        The page or product you're looking for doesn't exist, has been relocated, or is temporarily unavailable.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
            background: "var(--primary)",
            color: "#fff",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600
          }}
        >
          <FiHome /> Return Home
        </Link>
        <Link
          to="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-sm)",
            fontWeight: 500
          }}
        >
          <FiSearch /> Browse Catalogue
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
