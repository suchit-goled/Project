import React from "react";
import { useNavigate } from "react-router-dom";
import "../layout/Footer.css";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">

      {/* Left */}
      <div className="footer-left">
        <h2>
          Electro<span>Nova</span>
        </h2>

        <p>
          Tech that powers your life — curated electronics for the modern home.
        </p>
      </div>

      {/* Shop */}
      <div className="footer-column">
        <h3>Shop</h3>

        <button onClick={() => navigate("/products?category=smartphones")}>
          Smartphones
        </button>

        <button onClick={() => navigate("/products?category=laptops")}>
          Laptops
        </button>

        <button onClick={() => navigate("/products?category=audio")}>
          Audio
        </button>

        <button onClick={() => navigate("/products?category=wearables")}>
          Wearables
        </button>
      </div>

      {/* Support */}
      <div className="footer-column">
        <h3>Support</h3>

        <button onClick={() => navigate("/contact")}>
          Contact
        </button>

        <button onClick={() => navigate("/shipping")}>
          Shipping
        </button>

        <button onClick={() => navigate("/returns")}>
          Returns
        </button>

        <button onClick={() => navigate("/warranty")}>
          Warranty
        </button>
      </div>

      {/* Company */}
      <div className="footer-column">
        <h3>Company</h3>

        <button onClick={() => navigate("/about")}>
          About
        </button>

        <button onClick={() => navigate("/careers")}>
          Careers
        </button>

        <button onClick={() => navigate("/press")}>
          Press
        </button>

        <button onClick={() => navigate("/blog")}>
          Blog
        </button>
      </div>

    </footer>
  );
}

export default Footer;