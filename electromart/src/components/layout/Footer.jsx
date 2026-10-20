import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiArrowRight, FiShield, FiLock, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import "./Footer.css";

function Footer() {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing! Check your inbox for 10% off.");
    setNewsletterEmail("");
  };

  return (
    <footer className="footer">
      <div className="container footer__container">
        {/* Brand & Newsletter Column */}
        <div className="footer-col footer-col--brand">
          <Link to="/" className="footer-brand">
            <span className="brand-icon">⚡</span>
            <h2>Electro<span>Nova</span></h2>
          </Link>

          <p className="footer-bio">
            Engineered for high performance. Curated smartphones, laptops, audio systems, and smart home technology backed by official warranty.
          </p>

          <div className="footer-contact-info">
            <div className="contact-item">
              <FiPhone />
              <span>+91 1800 258 3690 (Mon-Sat, 9AM-8PM)</span>
            </div>
            <div className="contact-item">
              <FiMail />
              <span>support@electronova.tech</span>
            </div>
            <div className="contact-item">
              <FiMapPin />
              <span>ElectroNova Tech Park, Bengaluru, Karnataka, 560103</span>
            </div>
          </div>

          <form className="footer-newsletter" onSubmit={handleSubscribe}>
            <span className="newsletter-title">Subscribe for exclusive member drops & 10% off</span>
            <div className="newsletter-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" aria-label="Subscribe to newsletter">
                <FiArrowRight />
              </button>
            </div>
          </form>
        </div>

        {/* Categories */}
        <div className="footer-col">
          <h3>Shop Categories</h3>
          <ul className="footer-links">
            <li><button onClick={() => navigate("/products/category/smartphones")}>Smartphones</button></li>
            <li><button onClick={() => navigate("/products/category/laptops")}>Laptops & Ultrabooks</button></li>
            <li><button onClick={() => navigate("/products/category/audio")}>Premium Audio</button></li>
            <li><button onClick={() => navigate("/products/category/wearables")}>Smartwatches & Wearables</button></li>
            <li><button onClick={() => navigate("/products/category/gaming")}>Gaming & Gear</button></li>
            <li><button onClick={() => navigate("/products/category/cameras")}>Pro Cameras & Lenses</button></li>
            <li><button onClick={() => navigate("/deals")}>Flash Deals & Offers</button></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer-col">
          <h3>Customer Support</h3>
          <ul className="footer-links">
            <li><button onClick={() => navigate("/contact")}>Help & Contact Center</button></li>
            <li><button onClick={() => navigate("/shipping")}>Shipping & Delivery Info</button></li>
            <li><button onClick={() => navigate("/returns")}>Return & Replacement Policy</button></li>
            <li><button onClick={() => navigate("/warranty")}>1-Year Warranty Guide</button></li>
            <li><button onClick={() => navigate("/orders")}>Track Your Order</button></li>
            <li><button onClick={() => navigate("/profile")}>My Account</button></li>
          </ul>
        </div>

        {/* Company & Policies */}
        <div className="footer-col">
          <h3>About & Trust</h3>
          <ul className="footer-links">
            <li><button onClick={() => navigate("/about")}>About ElectroNova</button></li>
            <li><button onClick={() => navigate("/shipping")}>Free Delivery Above ₹1,000</button></li>
            <li><button onClick={() => navigate("/returns")}>7-Day Replacement Guarantee</button></li>
            <li><button onClick={() => navigate("/warranty")}>Authorised Brand Partner</button></li>
          </ul>

          <div className="footer-trust-badges">
            <div className="trust-pill">
              <FiShield /> 100% Genuine Tech
            </div>
            <div className="trust-pill">
              <FiLock /> 256-bit SSL Checkout
            </div>
            <div className="trust-pill">
              <FiCheckCircle /> Verified Merchant
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom__container">
          <p>© {new Date().getFullYear()} ElectroNova Inc. All rights reserved.</p>
          <div className="footer-payment-methods">
            <span>Accepted Payments:</span>
            <strong>UPI</strong> • <strong>Razorpay</strong> • <strong>Credit/Debit Cards</strong> • <strong>Net Banking</strong> • <strong>Cash on Delivery</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
