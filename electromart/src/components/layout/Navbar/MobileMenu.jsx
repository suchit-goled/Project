import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiX,
  FiHome,
  FiGrid,
  FiTag,
  FiMail,
  FiInfo,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiUser,
  FiPackage,
  FiHeart,
  FiLogOut,
  FiSearch
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { useSearch } from "../../../context/SearchContext";
import "./MobileMenu.css";

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { search, setSearch } = useSearch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onClose();
    navigate("/products");
  };

  const handleNavClick = (path) => {
    onClose();
    navigate(path);
  };

  const categories = [
    { label: "Smartphones", path: "/products/category/smartphones" },
    { label: "Laptops", path: "/products/category/laptops" },
    { label: "Audio", path: "/products/category/audio" },
    { label: "Wearables", path: "/products/category/wearables" },
    { label: "Gaming", path: "/products/category/gaming" },
    { label: "Cameras", path: "/products/category/cameras" },
    { label: "Smart Home", path: "/products/category/smart home" },
  ];

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <aside
        className="mobile-menu-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-menu-header">
          <div className="mobile-brand">
            <span className="brand-bolt">⚡</span>
            <strong>ElectroNova</strong>
          </div>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        {/* Mobile Search */}
        <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
          <FiSearch className="mobile-search-icon" />
          <input
            type="text"
            placeholder="Search 8,000+ tech products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="mobile-menu-content">
          {/* Main Navigation */}
          <div className="mobile-section">
            <div className="mobile-section-title">Navigation</div>
            <nav className="mobile-nav-list">
              <NavLink to="/" onClick={onClose} className="mobile-nav-item">
                <FiHome /> <span>Home</span>
              </NavLink>
              <NavLink to="/products" onClick={onClose} className="mobile-nav-item">
                <FiGrid /> <span>All Products</span>
              </NavLink>
              <NavLink to="/deals" onClick={onClose} className="mobile-nav-item deals-link">
                <FiTag /> <span>Deals & Offers</span>
              </NavLink>
              <NavLink to="/contact" onClick={onClose} className="mobile-nav-item">
                <FiMail /> <span>Support & Contact</span>
              </NavLink>
              <NavLink to="/about" onClick={onClose} className="mobile-nav-item">
                <FiInfo /> <span>About ElectroNova</span>
              </NavLink>
            </nav>
          </div>

          {/* Quick Categories */}
          <div className="mobile-section">
            <div className="mobile-section-title">Shop by Category</div>
            <div className="mobile-categories-chips">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  className="mobile-category-chip"
                  onClick={() => handleNavClick(cat.path)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Support & Policies */}
          <div className="mobile-section">
            <div className="mobile-section-title">Help & Policies</div>
            <nav className="mobile-nav-list">
              <button onClick={() => handleNavClick("/shipping")} className="mobile-nav-item sub-item">
                <FiTruck /> <span>Shipping & Delivery</span>
              </button>
              <button onClick={() => handleNavClick("/returns")} className="mobile-nav-item sub-item">
                <FiRotateCcw /> <span>Returns & Refunds</span>
              </button>
              <button onClick={() => handleNavClick("/warranty")} className="mobile-nav-item sub-item">
                <FiShield /> <span>Warranty Guide</span>
              </button>
            </nav>
          </div>

          {/* Account Footer */}
          <div className="mobile-menu-footer">
            {user ? (
              <div className="mobile-user-profile">
                <div className="mobile-user-info">
                  <div className="user-avatar-sm">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="user-name-text">{user.name}</div>
                    <div className="user-email-text">{user.email}</div>
                  </div>
                </div>

                <div className="mobile-user-links">
                  {user.role === "admin" && (
                    <button onClick={() => handleNavClick("/admin")} className="mobile-user-btn admin">
                      <FiShield /> Admin Dashboard
                    </button>
                  )}
                  <button onClick={() => handleNavClick("/profile")} className="mobile-user-btn">
                    <FiUser /> Profile
                  </button>
                  <button onClick={() => handleNavClick("/orders")} className="mobile-user-btn">
                    <FiPackage /> Orders
                  </button>
                  <button onClick={() => handleNavClick("/wishlist")} className="mobile-user-btn">
                    <FiHeart /> Wishlist
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                      navigate("/");
                    }}
                    className="mobile-user-btn logout"
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mobile-guest-actions">
                <button
                  onClick={() => handleNavClick("/login")}
                  className="mobile-primary-btn"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick("/register")}
                  className="mobile-secondary-btn"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileMenu;
