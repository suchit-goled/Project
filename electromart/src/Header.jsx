import React from "react";

function Navbar() {
  return (
    <header style={{ background: "#222", color: "#fff", padding: "10px 20px" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Logo */}
        <h2>
          ⚡ Electro<span style={{ color: "orange" }}>Mart</span>
        </h2>

        {/* Navigation Links */}
        <nav>
          <a href="/" style={linkStyle}>Home</a>
          <a href="/Products." style={linkStyle}>Products</a>
          <a href="#Categories" style={linkStyle}>Categories</a>
          <a href="#about" style={linkStyle}>About</a>
        
        </nav>

        {/* Cart Button */}
        <button style={btnStyle}>Cart 🛒</button>

      </div>

    </header>
  );
}

const linkStyle = {
  margin: "0 10px",
  color: "#fff",
  textDecoration: "none"
};

const btnStyle = {
  padding: "5px 10px",
  background: "orange",
  border: "none",
  cursor: "pointer"
};

export default Navbar;