import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    FiHome,
    FiPackage,
    FiGrid,
    FiPlusCircle,
    FiDollarSign,
    FiSettings,
    FiExternalLink,
    FiLogOut,
    FiMenu,
    FiX,
    FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import SellerService from "../../services/seller.service";
import "./SellerLayout.css";

const SellerLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [profileData, setProfileData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchSellerInfo = async () => {
            try {
                const data = await SellerService.getProfile();
                if (isMounted && data) {
                    setProfileData(data);
                }
            } catch (err) {
                console.error("Failed to load seller layout profile:", err);
            }
        };
        fetchSellerInfo();
        return () => { isMounted = false; };
    }, []);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        if (typeof logout === "function") logout();
        navigate("/login");
    };

    const store = profileData?.store || {};
    const seller = profileData?.seller || {};

    return (
        <div className="seller-portal-layout">
            {/* Top Bar */}
            <header className="seller-topbar">
                <div className="topbar-left">
                    <button
                        className="mobile-sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle Navigation"
                    >
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                    <Link to="/seller/dashboard" className="seller-brand-link">
                        <span className="brand-accent">ElectroNova</span>
                        <span className="portal-badge">Seller Central</span>
                    </Link>
                </div>

                <div className="topbar-right">
                    {store.slug && (
                        <Link
                            to={`/stores/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-store-pill"
                        >
                            <span>Live Store</span>
                            <FiExternalLink />
                        </Link>
                    )}

                    <div className="seller-user-pill">
                        <div className="seller-avatar-small">
                            {store.logo ? (
                                <img src={store.logo} alt="Store Logo" />
                            ) : (
                                <span>{(store.name || user?.name || "S")[0]}</span>
                            )}
                        </div>
                        <div className="seller-user-text">
                            <span className="seller-store-name-text">
                                {store.name || "My Store"}
                            </span>
                            <span className="seller-status-label">
                                {seller.status === "approved" ? "Verified Partner" : "Active Seller"}
                            </span>
                        </div>
                    </div>

                    <button
                        className="seller-logout-btn"
                        onClick={handleLogout}
                        title="Sign Out of Seller Central"
                    >
                        <FiLogOut />
                    </button>
                </div>
            </header>

            <div className="seller-body-container">
                {/* Sidebar Navigation */}
                <aside className={`seller-sidebar ${sidebarOpen ? "open" : ""}`}>
                    <div className="sidebar-store-summary">
                        <div className="summary-logo">
                            {store.logo ? (
                                <img src={store.logo} alt={store.name} />
                            ) : (
                                <span>{(store.name || "S")[0]}</span>
                            )}
                        </div>
                        <div className="summary-details">
                            <h4>{store.name || "Seller Store"}</h4>
                            <span className="verified-status">
                                <FiCheckCircle /> Verified Merchant
                            </span>
                        </div>
                    </div>

                    <nav className="seller-nav-menu">
                        <NavLink
                            to="/seller/dashboard"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <FiHome />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/seller/orders"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <FiPackage />
                            <span>Orders & Fulfillment</span>
                        </NavLink>

                        <NavLink
                            to="/seller/products"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <FiGrid />
                            <span>My Products</span>
                        </NavLink>

                        <NavLink
                            to="/seller/products/new"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <FiPlusCircle />
                            <span>Add New Product</span>
                        </NavLink>

                        <NavLink
                            to="/seller/earnings"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <FiDollarSign />
                            <span>Earnings & Payouts</span>
                        </NavLink>

                        <NavLink
                            to="/seller/store"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <FiSettings />
                            <span>Store Profile</span>
                        </NavLink>
                    </nav>

                    <div className="sidebar-footer-info">
                        <div className="commission-rate-box">
                            <span>Standard Commission</span>
                            <strong>
                                {seller.commissionRateOverride !== null && seller.commissionRateOverride !== undefined
                                    ? `${seller.commissionRateOverride}% Special`
                                    : "4.5% - 8% Category"}
                            </strong>
                        </div>
                        <Link to="/" className="back-storefront-link">
                            ← Return to Customer Store
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="seller-main-content">
                    <Outlet context={{ profileData, setProfileData, store, seller }} />
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;
