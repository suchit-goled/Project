import React from "react";

function Footer() {
  return (
    <div id="about" className="footer">

      {/* Left */}
      <div className="footer-left">
        <h2> Electro<span>Nova</span></h2>
        <p>
          Tech that powers your life — curated electronics for the modern home.
        </p>
      </div>

      {/* Shop */}
      <div className="footer-column">
        <h3>Shop</h3>
        <p>Smartphones</p>
        <p>Laptops</p>
        <p>Audio</p>
        <p>Wearables</p>
      </div>

      {/* Support */}
      <div className="footer-column">
        <h3>Support</h3>
        <p>Contact</p>
        <p>Shipping</p>
        <p>Returns</p>
        <p>Warranty</p>
      </div>

      {/* Company */}
      <div className="footer-column">
        <h3>Company</h3>
        <p>About</p>
        <p>Careers</p>
        <p>Press</p>
        <p>Blog</p>
      </div>

    </div>
  );
}

export default Footer;