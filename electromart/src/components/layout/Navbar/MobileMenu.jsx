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
  FiSearch,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { useSearch } from "../../../context/SearchContext";
import Logo from "./Logo";
import { useDelivery } from "../../../context/DeliveryContext";
import "./MobileMenu.css";

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { search, setSearch } = useSearch();
  const navigate = useNavigate();
  const { openPincodeModal } = useDelivery();

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onClose();
    navigate("/products?search=" + encodeURIComponent(search.trim()));
  };

  const handleNavClick = (path) => {
    onClose();
    navigate(path);
  };

  const categories = [
    { label: "Smartphones", path: "/products?category=Smartphones" },
    { label: "Laptops", path: "/products?category=Laptops" },
    { label: "Audio", path: "/products?category=Headphones" },
    { label: "Wearables", path: "/products?category=Smartwatches" },
    { label: "Gaming", path: "/products?category=Gaming%20Accessories" },
    { label: "Cameras", path: "/products?category=Cameras" },
    { label: "Smart Home", path: "/products?category=Home%20Electronics" },
  ];

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <aside
        className="mobile-menu-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-menu-header">
          <div onClick={onClose} style={{ cursor: "pointer" }}>
            <Logo size="sm" />
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
            aria-label="Search products and brands" placeholder="Search products and brands"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="mobile-menu-content">
          {/* Main Navigation */}
          <div className="mobile-section">
            <button type="button" className="drawer-location" onClick={() => { onClose(); openPincodeModal(); }}>
              Change delivery location
            </button>
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
              {user?.role === "seller" ? (
                <NavLink to="/seller/dashboard" onClick={onClose} className="mobile-nav-item">
                  <FiShoppingBag /> <span>Seller Dashboard</span>
                </NavLink>
              ) : (
                <NavLink to="/seller/register" onClick={onClose} className="mobile-nav-item">
                  <FiTrendingUp /> <span>Sell on ElectroNova</span>
                </NavLink>
              )}
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
