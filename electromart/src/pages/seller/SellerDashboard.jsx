import React, { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
    FiBox,
    FiCheckCircle,
    FiShoppingBag,
    FiClock,
    FiTrendingUp,
    FiPercent,
    FiDollarSign,
    FiAlertTriangle,
    FiArrowRight,
    FiPlus,
    FiExternalLink
} from "react-icons/fi";
import SellerService from "../../services/seller.service";
import "./SellerDashboard.css";

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { store } = useOutletContext() || {};

    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await SellerService.getDashboard();
                if (isMounted && data) {
                    setMetrics(data);
                }
            } catch (err) {
                console.error("Failed to load seller dashboard metrics:", err);
                if (isMounted) setError("Unable to load seller metrics.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDashboardData();
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="seller-dashboard-loading">
                <div className="seller-skeleton-card" style={{ height: "120px" }} />
                <div className="metrics-grid-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="seller-skeleton-card" style={{ height: "110px" }} />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="seller-dashboard-error">
                <h3>Error Loading Dashboard</h3>
                <p>{error || "Unable to fetch store metrics. Please check your network connection."}</p>
                <button onClick={() => window.location.reload()} className="seller-retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    const {
        totalProducts = 0,
        activeProducts = 0,
        lowStockProducts = 0,
        totalOrders = 0,
        pendingOrders = 0,
        completedOrders = 0,
        grossSales = 0,
        commissionDeducted = 0,
        availableEarnings = 0,
        recentOrders = [],
    } = metrics;

    return (
        <div className="seller-dashboard-view">
            {/* Top Welcome Banner */}
            <div className="seller-welcome-card">
                <div className="welcome-left">
                    <span className="welcome-tag">MERCHANT OVERVIEW</span>
                    <h2>Welcome back, {store?.name || "Partner Store"}!</h2>
                    <p>
                        Track your live product listings, customer order dispatches, and marketplace settlement earnings.
                    </p>
                </div>

                <div className="welcome-actions">
                    <button
                        className="quick-add-product-btn"
                        onClick={() => navigate("/seller/products/new")}
                    >
                        <FiPlus /> Add New Product
                    </button>
                    {store?.slug && (
                        <Link
                            to={`/stores/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="quick-view-store-btn"
                        >
                            View Storefront <FiExternalLink />
                        </Link>
                    )}
                </div>
            </div>

            {/* Low-Stock Warning Banner if any */}
            {lowStockProducts > 0 && (
                <div className="low-stock-alert-bar">
                    <FiAlertTriangle className="alert-icon" />
                    <div className="alert-text">
                        <strong>Inventory Notice:</strong> You have {lowStockProducts} products with low stock (&le; 5 units). Replenish inventory to avoid missed customer orders.
                    </div>
                    <Link to="/seller/products" className="manage-inventory-link">
                        Update Stock &rarr;
                    </Link>
                </div>
            )}

            {/* KPI Metrics Grid: 8 Cards */}
            <div className="seller-metrics-grid">
                {/* 1. Gross Sales */}
                <div className="kpi-card accent-blue">
                    <div className="kpi-icon-box">
                        <FiTrendingUp />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Gross Sales</span>
                        <h3 className="kpi-value">₹{grossSales.toLocaleString()}</h3>
                        <span className="kpi-sub">Total product value ordered</span>
                    </div>
                </div>

                {/* 2. Platform Commission */}
                <div className="kpi-card accent-amber">
                    <div className="kpi-icon-box">
                        <FiPercent />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Commission Deducted</span>
                        <h3 className="kpi-value">₹{commissionDeducted.toLocaleString()}</h3>
                        <span className="kpi-sub">Marketplace fee on sales</span>
                    </div>
                </div>

                {/* 3. Net Earnings */}
                <div className="kpi-card accent-green">
                    <div className="kpi-icon-box">
                        <FiDollarSign />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Net Seller Earnings</span>
                        <h3 className="kpi-value">₹{availableEarnings.toLocaleString()}</h3>
                        <span className="kpi-sub">Ready for settlement</span>
                    </div>
                </div>

                {/* 4. Total Orders */}
                <div className="kpi-card accent-purple">
                    <div className="kpi-icon-box">
                        <FiShoppingBag />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Total Orders</span>
                        <h3 className="kpi-value">{totalOrders}</h3>
                        <span className="kpi-sub">Across all customer orders</span>
                    </div>
                </div>

                {/* 5. Pending Dispatch */}
                <div className="kpi-card">
                    <div className="kpi-icon-box">
                        <FiClock />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Pending Dispatch</span>
                        <h3 className="kpi-value highlight-amber">{pendingOrders}</h3>
                        <span className="kpi-sub">Awaiting packing / shipping</span>
                    </div>
                </div>

                {/* 6. Completed Deliveries */}
                <div className="kpi-card">
                    <div className="kpi-icon-box">
                        <FiCheckCircle />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Completed Orders</span>
                        <h3 className="kpi-value highlight-green">{completedOrders}</h3>
                        <span className="kpi-sub">Delivered to customers</span>
                    </div>
                </div>

                {/* 7. Total Products */}
                <div className="kpi-card">
                    <div className="kpi-icon-box">
                        <FiBox />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Total Products</span>
                        <h3 className="kpi-value">{totalProducts}</h3>
                        <span className="kpi-sub">In your store catalog</span>
                    </div>
                </div>

                {/* 8. Active Listings */}
                <div className="kpi-card">
                    <div className="kpi-icon-box">
                        <FiCheckCircle />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Active Listings</span>
                        <h3 className="kpi-value">{activeProducts}</h3>
                        <span className="kpi-sub">In-stock & live on marketplace</span>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="seller-dashboard-section">
                <div className="section-header-row">
                    <div>
                        <h3>Recent Customer Sub-Orders</h3>
                        <p>Orders received for your store products requiring fulfillment.</p>
                    </div>
                    <Link to="/seller/orders" className="view-all-orders-link">
                        View All Orders ({totalOrders}) <FiArrowRight />
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="empty-orders-state-box">
                        <FiShoppingBag size={36} />
                        <h4>No customer orders yet</h4>
                        <p>When customers buy items from your store, their sub-orders will appear here with fulfillment tracking.</p>
                    </div>
                ) : (
                    <div className="seller-table-card">
                        <table className="seller-data-table">
                            <thead>
                                <tr>
                                    <th>Sub-Order #</th>
                                    <th>Parent Order</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Subtotal</th>
                                    <th>Commission</th>
                                    <th>Your Earnings</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((ord) => (
                                    <tr key={ord._id}>
                                        <td className="bold-cell">{ord.sellerOrderNumber}</td>
                                        <td className="subtle-cell">{ord.parentOrderNumber || "—"}</td>
                                        <td>
                                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </td>
                                        <td>{ord.products?.length || 1} Item(s)</td>
                                        <td>₹{(ord.subtotal || 0).toLocaleString()}</td>
                                        <td className="commission-cell">
                                            -₹{(ord.commissionAmount || 0).toLocaleString()}
                                            <small>({ord.commissionRate || 5}%)</small>
                                        </td>
                                        <td className="earnings-cell">
                                            ₹{(ord.sellerEarnings || 0).toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={`seller-status-badge status-${ord.orderStatus?.toLowerCase()}`}>
                                                {ord.orderStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="table-manage-btn"
                                                onClick={() => navigate("/seller/orders")}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
