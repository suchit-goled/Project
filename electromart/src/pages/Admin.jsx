import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    FiPackage,
    FiShoppingCart,
    FiUsers,
    FiDollarSign,
    FiTrendingUp,
    FiPlus,
    FiTrash2,
    FiSearch,
    FiShield,
    FiRefreshCw,
    FiXCircle,
    FiPercent,
    FiBriefcase,
    FiEdit2
} from "react-icons/fi";
import AdminService from "../services/admin.service";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Admin.css";

function Admin() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("overview"); // overview, products, orders, sellers, commission, users
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [commissionSettings, setCommissionSettings] = useState(null);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Product search & Add Form
    const [productSearch, setProductSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        product_title: "",
        product_category: "Smartphones",
        discounted_price: "",
        original_price: "",
        discount_percentage: 0,
        product_image_url: "",
        isFeatured: false
    });
    const [savingProduct, setSavingProduct] = useState(false);

    // Order status filter
    const [orderStatusFilter, setOrderStatusFilter] = useState("");

    // Seller search & filters
    const [sellerFilter, setSellerFilter] = useState("all");
    const [sellerSearch, setSellerSearch] = useState("");
    const [editSellerCommModal, setEditSellerCommModal] = useState(null);

    // Commission Engine
    const [defaultRateInput, setDefaultRateInput] = useState(5.0);
    const [newCatRate, setNewCatRate] = useState({ category: "Smartphones", rate: 5.0 });
    const [savingCommission, setSavingCommission] = useState(false);

    // Payout Settlements
    const [processPayoutModal, setProcessPayoutModal] = useState(null);

    const fetchAdminData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashData, prods, ords, usrs, sellrs, comm, pays] = await Promise.allSettled([
                AdminService.getDashboard(),
                AdminService.getProducts(),
                AdminService.getOrders(),
                AdminService.getUsers(),
                AdminService.getSellers(),
                AdminService.getCommissionSettings(),
                AdminService.getPayouts()
            ]);

            if (dashData.status === "fulfilled") setStats(dashData.value);
            if (prods.status === "fulfilled") setProducts(prods.value || []);
            if (ords.status === "fulfilled") setOrders(ords.value || []);
            if (usrs.status === "fulfilled") setUsers(usrs.value || []);
            if (sellrs.status === "fulfilled") setSellers(sellrs.value || []);
            if (comm.status === "fulfilled") {
                setCommissionSettings(comm.value);
                if (comm.value?.defaultRate !== undefined) {
                    setDefaultRateInput(comm.value.defaultRate);
                }
            }
            if (pays.status === "fulfilled") {
                const pList = pays.value?.payouts || pays.value || [];
                setPayouts(Array.isArray(pList) ? pList : []);
            }
        } catch (err) {
            console.error("Failed to load admin data:", err);
            toast.error("Failed to load administrative data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user && user.role === "admin") {
            fetchAdminData();
        }
    }, [user, fetchAdminData]);

    // Role check
    if (!user || user.role !== "admin") {
        return (
            <div className="admin-access-denied container">
                <FiShield className="denied-icon" />
                <h2>Administrator Access Required</h2>
                <p>This management suite is restricted to authorized platform administrators.</p>
                <div className="denied-actions">
                    <Link to="/" className="denied-home-btn">Return to Storefront</Link>
                    {!user && <Link to="/login" className="denied-login-btn">Sign In as Administrator</Link>}
                </div>
            </div>
        );
    }

    // Add Product
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.product_title || !newProduct.discounted_price) {
            toast.error("Title and price are required");
            return;
        }

        try {
            setSavingProduct(true);
            const disc = Number(newProduct.discounted_price);
            const orig = Number(newProduct.original_price) || disc;
            const pct = orig > disc ? Math.round(((orig - disc) / orig) * 100) : 0;

            await AdminService.createProduct({
                ...newProduct,
                discounted_price: disc,
                original_price: orig,
                discount_percentage: pct
            });

            toast.success("Product created successfully!");
            setShowAddModal(false);
            setNewProduct({
                product_title: "",
                product_category: "Smartphones",
                discounted_price: "",
                original_price: "",
                discount_percentage: 0,
                product_image_url: "",
                isFeatured: false
            });
            fetchAdminData();
        } catch (err) {
            console.error("Failed to add product:", err);
            toast.error(err.response?.data?.message || "Failed to add product");
        } finally {
            setSavingProduct(false);
        }
    };

    // Delete Product
    const handleDeleteProduct = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await AdminService.deleteProduct(id);
            toast.success("Product deleted successfully");
            setProducts(products.filter((p) => p._id !== id));
        } catch (err) {
            console.error("Failed to delete product:", err);
            toast.error("Failed to delete product");
        }
    };

    // Update Order Status
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await AdminService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order updated to ${newStatus}`);
            setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
        } catch (err) {
            console.error("Failed to update order status:", err);
            toast.error("Failed to update status");
        }
    };

    // Toggle User Role
    const handleToggleUserRole = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        if (!window.confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return;

        try {
            await AdminService.updateUserRole(userId, newRole);
            toast.success(`Role changed to ${newRole}`);
            setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        } catch (err) {
            console.error("Failed to update role:", err);
            toast.error(err.response?.data?.message || "Failed to change user role");
        }
    };

    // Delete User
    const handleDeleteUser = async (userId, name) => {
        if (!window.confirm(`Delete customer account for "${name}"? This cannot be undone.`)) return;

        try {
            await AdminService.deleteUser(userId);
            toast.success("Account deleted");
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err) {
            console.error("Failed to delete user:", err);
            toast.error("Failed to delete user");
        }
    };

    // Seller Status Update
    const handleUpdateSellerStatus = async (sellerId, newStatus) => {
        try {
            await AdminService.updateSellerStatus(sellerId, newStatus);
            toast.success(`Seller status updated to ${newStatus}`);
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update seller status");
        }
    };

    // Seller Commission Override Save
    const handleSaveSellerCommission = async (e) => {
        e.preventDefault();
        if (!editSellerCommModal) return;
        try {
            await AdminService.updateSellerCommission(editSellerCommModal._id, Number(editSellerCommModal.rate));
            toast.success("Seller commission override updated successfully");
            setEditSellerCommModal(null);
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update commission override");
        }
    };

    // Default Commission Update
    const handleUpdateDefaultRate = async (e) => {
        e.preventDefault();
        try {
            setSavingCommission(true);
            await AdminService.updateDefaultCommissionRate(Number(defaultRateInput));
            toast.success(`Platform default commission set to ${defaultRateInput}%`);
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update default commission");
        } finally {
            setSavingCommission(false);
        }
    };

    // Add Category Commission Rate
    const handleAddCategoryRate = async (e) => {
        e.preventDefault();
        try {
            await AdminService.setCategoryCommissionRate(newCatRate.category, Number(newCatRate.rate));
            toast.success(`Commission set for category '${newCatRate.category}'`);
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to set category commission");
        }
    };

    // Delete Category Commission Rate
    const handleDeleteCategoryRate = async (category) => {
        if (!window.confirm(`Remove specific commission rate for category '${category}'?`)) return;
        try {
            await AdminService.deleteCategoryCommissionRate(category);
            toast.success(`Removed commission rate for '${category}'`);
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove category rate");
        }
    };

    // Payout Status Update (Disburse Settlement)
    const handleProcessPayout = async (e) => {
        e.preventDefault();
        if (!processPayoutModal) return;
        try {
            await AdminService.updatePayoutStatus(processPayoutModal._id, {
                status: processPayoutModal.status,
                transactionReference: processPayoutModal.transactionReference,
                remarks: processPayoutModal.remarks,
            });
            toast.success(`Payout ${processPayoutModal.payoutNumber || ""} marked as ${processPayoutModal.status}`);
            setProcessPayoutModal(null);
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update payout settlement");
        }
    };

    // Filter Products
    const filteredProducts = products.filter((p) =>
        (p.product_title || "").toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.product_category || "").toLowerCase().includes(productSearch.toLowerCase())
    );

    // Filter Orders
    const filteredOrders = orderStatusFilter
        ? orders.filter((o) => o.orderStatus === orderStatusFilter)
        : orders;

    // Filter Sellers
    const filteredSellers = sellers.filter((s) => {
        const matchesStatus = sellerFilter === "all" || s.status === sellerFilter;
        const searchLow = sellerSearch.toLowerCase();
        const matchesSearch = !sellerSearch.trim() ||
            (s.displayName || "").toLowerCase().includes(searchLow) ||
            (s.legalName || "").toLowerCase().includes(searchLow) ||
            (s.store?.name || "").toLowerCase().includes(searchLow) ||
            (s.gstin || "").toLowerCase().includes(searchLow) ||
            (s.contactEmail || "").toLowerCase().includes(searchLow);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="admin-portal container">
            {/* Header */}
            <div className="admin-portal-header">
                <div>
                    <span className="admin-badge">Super Admin Control Center</span>
                    <h1>ElectroNova Marketplace Management</h1>
                    <p>Live inventory, multi-vendor stores, commissions & automated settlement ledger.</p>
                </div>
                <div className="header-actions">
                    <button className="refresh-admin-btn" onClick={fetchAdminData}>
                        <FiRefreshCw /> Refresh Data
                    </button>
                    <button className="add-product-cta" onClick={() => setShowAddModal(true)}>
                        <FiPlus /> New Product
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-nav-tabs">
                <button
                    className={`admin-tab-item ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    <FiTrendingUp /> Overview
                </button>
                <button
                    className={`admin-tab-item ${activeTab === "products" ? "active" : ""}`}
                    onClick={() => setActiveTab("products")}
                >
                    <FiPackage /> Products ({products.length})
                </button>
                <button
                    className={`admin-tab-item ${activeTab === "orders" ? "active" : ""}`}
                    onClick={() => setActiveTab("orders")}
                >
                    <FiShoppingCart /> Orders ({orders.length})
                </button>
                <button
                    className={`admin-tab-item ${activeTab === "sellers" ? "active" : ""}`}
                    onClick={() => setActiveTab("sellers")}
                >
                    <FiBriefcase /> Sellers ({sellers.length})
                </button>
                <button
                    className={`admin-tab-item ${activeTab === "commission" ? "active" : ""}`}
                    onClick={() => setActiveTab("commission")}
                >
                    <FiPercent /> Commission & Payouts
                </button>
                <button
                    className={`admin-tab-item ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    <FiUsers /> Customers ({users.length})
                </button>
            </div>

            {loading ? (
                <div className="admin-loading-state">
                    <p>Loading marketplace platform metrics and database records...</p>
                </div>
            ) : (
                <div className="admin-tab-panel">
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="admin-overview-section">
                            <div className="stats-metric-grid">
                                <div className="stat-metric-card revenue">
                                    <div className="metric-icon-box"><FiDollarSign /></div>
                                    <div>
                                        <span className="metric-label">Gross Merchandise Value (GMV)</span>
                                        <h3 className="metric-val">₹{(stats?.grossMerchandiseValue || stats?.totalRevenue || 0).toLocaleString()}</h3>
                                        <span className="metric-sub">Total marketplace transaction volume</span>
                                    </div>
                                </div>

                                <div className="stat-metric-card revenue" style={{ borderLeftColor: "#10b981" }}>
                                    <div className="metric-icon-box" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}><FiPercent /></div>
                                    <div>
                                        <span className="metric-label">Marketplace Commission</span>
                                        <h3 className="metric-val">₹{(stats?.totalCommissionRevenue || 0).toLocaleString()}</h3>
                                        <span className="metric-sub">Platform earned revenue</span>
                                    </div>
                                </div>

                                <div className="stat-metric-card users">
                                    <div className="metric-icon-box"><FiBriefcase /></div>
                                    <div>
                                        <span className="metric-label">Marketplace Sellers</span>
                                        <h3 className="metric-val">{stats?.totalSellers || sellers.length}</h3>
                                        <span className="metric-sub">{stats?.activeStores || 0} active stores</span>
                                    </div>
                                </div>

                                <div className="stat-metric-card orders">
                                    <div className="metric-icon-box"><FiShoppingCart /></div>
                                    <div>
                                        <span className="metric-label">Total Customer Orders</span>
                                        <h3 className="metric-val">{stats?.totalOrders || orders.length}</h3>
                                        <span className="metric-sub">{stats?.pendingOrders || 0} pending fulfillment</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders Preview */}
                            <div className="admin-card-table-box" style={{ marginTop: "24px" }}>
                                <div className="card-box-header">
                                    <h3>Recent Order Dispatches</h3>
                                    <button onClick={() => setActiveTab("orders")} className="view-all-table-btn">
                                        View All Orders →
                                    </button>
                                </div>

                                <div className="table-responsive">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Amount</th>
                                                <th>Payment Method</th>
                                                <th>Order Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map((ord) => (
                                                <tr key={ord._id}>
                                                    <td><strong>#{ord._id.slice(-6).toUpperCase()}</strong></td>
                                                    <td>{ord.shippingAddress?.fullName || "Customer"}</td>
                                                    <td>₹{(ord.total || 0).toLocaleString()}</td>
                                                    <td>{ord.paymentMethod}</td>
                                                    <td>
                                                        <span className={`status-pill ${ord.orderStatus.toLowerCase()}`}>
                                                            {ord.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                                                        No orders placed yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PRODUCTS */}
                    {activeTab === "products" && (
                        <div className="admin-products-section">
                            <div className="section-toolbar">
                                <div className="search-input-wrap">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search by title or category..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                    {productSearch && (
                                        <button className="clear-search-btn" onClick={() => setProductSearch("")}>
                                            <FiXCircle />
                                        </button>
                                    )}
                                </div>
                                <span className="toolbar-count">
                                    Showing {filteredProducts.length} of {products.length} products
                                </span>
                            </div>

                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Offer Price</th>
                                            <th>Original Price</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((prod) => (
                                            <tr key={prod._id}>
                                                <td>
                                                    <div className="product-table-item">
                                                        <img
                                                            src={prod.product_image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80"}
                                                            alt={prod.product_title}
                                                            className="table-item-thumb"
                                                        />
                                                        <div>
                                                            <strong className="item-title">{prod.product_title}</strong>
                                                            {prod.isFeatured && <span className="featured-tag">Featured</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="cat-pill">{prod.product_category}</span></td>
                                                <td><strong>₹{(prod.discounted_price || 0).toLocaleString()}</strong></td>
                                                <td>₹{(prod.original_price || prod.discounted_price || 0).toLocaleString()}</td>
                                                <td>
                                                    <span style={{ color: (prod.stock ?? 10) < 5 ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                                                        {prod.stock ?? 10} units
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="table-row-actions">
                                                        <Link to={`/products/${prod._id}`} className="view-link-btn" title="View product page">
                                                            View
                                                        </Link>
                                                        <button
                                                            className="delete-icon-btn"
                                                            onClick={() => handleDeleteProduct(prod._id, prod.product_title)}
                                                            title="Delete product"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ORDERS */}
                    {activeTab === "orders" && (
                        <div className="admin-orders-section">
                            <div className="section-toolbar">
                                <div className="filter-group">
                                    <label>Filter by Status:</label>
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                                        className="status-select-input"
                                    >
                                        <option value="">All Orders ({orders.length})</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <span className="toolbar-count">{filteredOrders.length} orders listed</span>
                            </div>

                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((ord) => (
                                            <tr key={ord._id}>
                                                <td><strong>#{ord.orderNumber || ord._id.slice(-6).toUpperCase()}</strong></td>
                                                <td>
                                                    <div>
                                                        <strong>{ord.shippingAddress?.fullName || "Customer"}</strong>
                                                        <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                                                            {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>{ord.products?.length || 1} items</td>
                                                <td><strong>₹{(ord.total || 0).toLocaleString()}</strong></td>
                                                <td>
                                                    <span className={`status-pill ${ord.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                                                        {ord.paymentStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select
                                                        value={ord.orderStatus}
                                                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                                                        className={`status-select-input ${ord.orderStatus.toLowerCase()}`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <Link to={`/orders/${ord._id}`} className="view-link-btn">
                                                        Inspect
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: SELLERS MANAGEMENT */}
                    {activeTab === "sellers" && (
                        <div className="admin-sellers-section">
                            <div className="section-toolbar">
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                    <div className="search-input-wrap">
                                        <FiSearch className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search by store name, GSTIN, legal name..."
                                            value={sellerSearch}
                                            onChange={(e) => setSellerSearch(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={sellerFilter}
                                        onChange={(e) => setSellerFilter(e.target.value)}
                                        className="status-select-input"
                                    >
                                        <option value="all">All Statuses ({sellers.length})</option>
                                        <option value="pending">Pending Approval</option>
                                        <option value="approved">Approved / Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <span className="toolbar-count">
                                    Showing {filteredSellers.length} of {sellers.length} registered sellers
                                </span>
                            </div>

                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Store & Seller</th>
                                            <th>Entity Type</th>
                                            <th>GSTIN / PAN</th>
                                            <th>Contact</th>
                                            <th>Commission Override</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSellers.map((s) => (
                                            <tr key={s._id}>
                                                <td>
                                                    <div>
                                                        <strong>{s.store?.name || s.displayName || s.legalName}</strong>
                                                        <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                                                            {s.legalName} • Owner: {s.userId?.name || "Registered User"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="cat-pill" style={{ textTransform: "capitalize" }}>
                                                        {s.sellerType || "business"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: "12px" }}>
                                                        <div>GST: {s.gstin || "N/A"}</div>
                                                        <div>PAN: {s.pan || "N/A"}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: "12px" }}>
                                                        <div>{s.contactEmail || s.userId?.email}</div>
                                                        <div>{s.contactPhone || s.userId?.mobile || "—"}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <span style={{ fontWeight: 600 }}>
                                                            {s.commissionRateOverride !== null && s.commissionRateOverride !== undefined
                                                                ? `${s.commissionRateOverride}%`
                                                                : "Default"}
                                                        </span>
                                                        <button
                                                            className="btn-action-edit"
                                                            onClick={() => setEditSellerCommModal({ _id: s._id, name: s.displayName || s.legalName, rate: s.commissionRateOverride ?? 5.0 })}
                                                            title="Edit commission override"
                                                        >
                                                            <FiEdit2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-pill ${s.status}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                        {s.status === "pending" && (
                                                            <button
                                                                className="btn-action-approve"
                                                                onClick={() => handleUpdateSellerStatus(s._id, "approved")}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {s.status === "approved" && (
                                                            <button
                                                                className="btn-action-suspend"
                                                                onClick={() => handleUpdateSellerStatus(s._id, "suspended")}
                                                            >
                                                                Suspend
                                                            </button>
                                                        )}
                                                        {s.status === "suspended" && (
                                                            <button
                                                                className="btn-action-approve"
                                                                onClick={() => handleUpdateSellerStatus(s._id, "approved")}
                                                            >
                                                                Reactivate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredSellers.length === 0 && (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                    No sellers found matching the selected filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: COMMISSION & PAYOUTS */}
                    {activeTab === "commission" && (
                        <div className="admin-commission-section">
                            {/* Commission Configuration Boxes */}
                            <div className="commission-config-grid">
                                {/* Default Platform Commission */}
                                <div className="commission-box">
                                    <h4><FiPercent color="#ff6b35" /> Platform Default Commission</h4>
                                    <p>Global baseline fee charged across all marketplace sales unless overridden by category or seller rules.</p>
                                    <form onSubmit={handleUpdateDefaultRate} className="rate-input-row">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={defaultRateInput}
                                            onChange={(e) => setDefaultRateInput(e.target.value)}
                                            className="rate-number-input"
                                            required
                                        />
                                        <span style={{ fontWeight: 700, fontSize: "16px" }}>%</span>
                                        <button type="submit" className="rate-save-btn" disabled={savingCommission}>
                                            {savingCommission ? "Saving..." : "Update Default"}
                                        </button>
                                    </form>
                                </div>

                                {/* Add Category Commission Rule */}
                                <div className="commission-box">
                                    <h4><FiPlus color="#ff6b35" /> Add Category Commission</h4>
                                    <p>Configure dedicated commission margins for specific product types.</p>
                                    <form onSubmit={handleAddCategoryRate} className="rate-input-row" style={{ flexWrap: "wrap" }}>
                                        <select
                                            value={newCatRate.category}
                                            onChange={(e) => setNewCatRate({ ...newCatRate, category: e.target.value })}
                                            className="status-select-input"
                                            style={{ flex: 1, minWidth: "140px" }}
                                        >
                                            <option value="Smartphones">Smartphones</option>
                                            <option value="Laptops">Laptops</option>
                                            <option value="Headphones">Headphones</option>
                                            <option value="Gaming Accessories">Gaming Accessories</option>
                                            <option value="Mobile Accessories">Mobile Accessories</option>
                                            <option value="Home Electronics">Home Electronics</option>
                                            <option value="Smartwatches">Smartwatches</option>
                                            <option value="Speakers">Speakers</option>
                                        </select>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={newCatRate.rate}
                                            onChange={(e) => setNewCatRate({ ...newCatRate, rate: e.target.value })}
                                            className="rate-number-input"
                                            style={{ width: "80px" }}
                                            required
                                        />
                                        <span style={{ fontWeight: 700 }}>%</span>
                                        <button type="submit" className="rate-save-btn">
                                            Save Rule
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Category Commission Rates Table */}
                            <div className="admin-card-table-box" style={{ marginBottom: "28px" }}>
                                <div className="card-box-header">
                                    <h3>Configured Category Commission Margins</h3>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>Product Category</th>
                                                <th>Commission Margin</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(commissionSettings?.categoryRates || []).map((cr) => (
                                                <tr key={cr.category}>
                                                    <td><strong>{cr.category}</strong></td>
                                                    <td><strong style={{ color: "#ff6b35" }}>{cr.rate}%</strong></td>
                                                    <td>
                                                        <button
                                                            className="delete-icon-btn"
                                                            onClick={() => handleDeleteCategoryRate(cr.category)}
                                                            title="Delete category rule"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!commissionSettings?.categoryRates || commissionSettings.categoryRates.length === 0) && (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                                                        No category-specific overrides configured. Platform default rate applies to all products.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payout Settlements Ledger */}
                            <div className="admin-card-table-box">
                                <div className="card-box-header">
                                    <div>
                                        <h3>Seller Settlement Payouts Ledger</h3>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                                            Review and disburse net earnings to verified seller bank accounts.
                                        </span>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>Payout ID</th>
                                                <th>Seller / Store</th>
                                                <th>Gross Sales</th>
                                                <th>Commission Deducted</th>
                                                <th>Net Payout</th>
                                                <th>Status</th>
                                                <th>UTR / Reference</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payouts.map((pay) => (
                                                <tr key={pay._id}>
                                                    <td><strong>{pay.payoutNumber || `#${pay._id.slice(-6).toUpperCase()}`}</strong></td>
                                                    <td>
                                                        <div>
                                                            <strong>{pay.storeId?.name || pay.sellerId?.name || "Seller Store"}</strong>
                                                            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                                                                {pay.sellerId?.email}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>₹{(pay.grossSales || 0).toLocaleString()}</td>
                                                    <td>-₹{(pay.commissionDeducted || 0).toLocaleString()}</td>
                                                    <td><strong style={{ color: "#10b981" }}>₹{(pay.netAmount || 0).toLocaleString()}</strong></td>
                                                    <td>
                                                        <span className={`status-pill ${pay.status.toLowerCase()}`}>
                                                            {pay.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                                                            {pay.transactionReference || "Pending Disbursal"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {pay.status !== "Completed" && (
                                                            <button
                                                                className="btn-action-approve"
                                                                onClick={() => setProcessPayoutModal({
                                                                    _id: pay._id,
                                                                    payoutNumber: pay.payoutNumber,
                                                                    netAmount: pay.netAmount,
                                                                    status: "Completed",
                                                                    transactionReference: `NEFT${Date.now().toString().slice(-8)}`,
                                                                    remarks: "Disbursed via bank transfer"
                                                                })}
                                                            >
                                                                Disburse
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {payouts.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                                                        No settlement payout batches generated yet. Payouts are computed from delivered orders.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: CUSTOMERS / USERS */}
                    {activeTab === "users" && (
                        <div className="admin-users-section">
                            <div className="section-toolbar">
                                <h3>Registered Customer Directory</h3>
                                <span className="toolbar-count">{users.length} total users</span>
                            </div>

                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Customer Name</th>
                                            <th>Email Address</th>
                                            <th>Phone</th>
                                            <th>City / State</th>
                                            <th>Role</th>
                                            <th>Joined Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((usr) => (
                                            <tr key={usr._id}>
                                                <td>
                                                    <div className="user-table-cell">
                                                        <div className="user-cell-avatar">
                                                            {usr.name ? usr.name[0].toUpperCase() : "U"}
                                                        </div>
                                                        <strong>{usr.name}</strong>
                                                    </div>
                                                </td>
                                                <td>{usr.email}</td>
                                                <td>{usr.phone || usr.mobile || "—"}</td>
                                                <td>{usr.city ? `${usr.city}, ${usr.state || ""}` : "—"}</td>
                                                <td>
                                                    <button
                                                        className={`role-toggle-btn ${usr.role}`}
                                                        onClick={() => handleToggleUserRole(usr._id, usr.role)}
                                                        title="Click to toggle role"
                                                    >
                                                        {usr.role === "admin" ? "Admin" : "Customer"}
                                                    </button>
                                                </td>
                                                <td>{new Date(usr.createdAt || Date.now()).toLocaleDateString()}</td>
                                                <td>
                                                    {usr._id !== user._id && (
                                                        <button
                                                            className="delete-icon-btn"
                                                            onClick={() => handleDeleteUser(usr._id, usr.name)}
                                                            title="Delete user account"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: ADD PRODUCT */}
            {showAddModal && (
                <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Catalogue Product</h3>
                            <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                                <FiXCircle />
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} className="modal-form">
                            <div className="form-group">
                                <label>Product Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                                    value={newProduct.product_title}
                                    onChange={(e) => setNewProduct({ ...newProduct, product_title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={newProduct.product_category}
                                        onChange={(e) => setNewProduct({ ...newProduct, product_category: e.target.value })}
                                    >
                                        <option value="Smartphones">Smartphones</option>
                                        <option value="Laptops">Laptops</option>
                                        <option value="Audio">Audio</option>
                                        <option value="Wearables">Wearables</option>
                                        <option value="Gaming">Gaming</option>
                                        <option value="Cameras">Cameras</option>
                                        <option value="Speakers">Speakers</option>
                                        <option value="Smart Home">Smart Home</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Offer Price (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 29990"
                                        value={newProduct.discounted_price}
                                        onChange={(e) => setNewProduct({ ...newProduct, discounted_price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Original Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 34990"
                                        value={newProduct.original_price}
                                        onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Image URL *</label>
                                <input
                                    type="url"
                                    placeholder="https://... image link"
                                    value={newProduct.product_image_url}
                                    onChange={(e) => setNewProduct({ ...newProduct, product_image_url: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="modal-submit-btn"
                                    disabled={savingProduct}
                                >
                                    {savingProduct ? "Creating..." : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT SELLER COMMISSION OVERRIDE */}
            {editSellerCommModal && (
                <div className="admin-modal-backdrop" onClick={() => setEditSellerCommModal(null)}>
                    <div className="admin-modal-card" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Set Commission Override</h3>
                            <button className="modal-close-btn" onClick={() => setEditSellerCommModal(null)}>
                                <FiXCircle />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSellerCommission} className="modal-form">
                            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
                                Configure an individual commission rate override for <strong>{editSellerCommModal.name}</strong>.
                            </p>
                            <div className="form-group">
                                <label>Commission Rate (%) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={editSellerCommModal.rate}
                                    onChange={(e) => setEditSellerCommModal({ ...editSellerCommModal, rate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="modal-cancel-btn" onClick={() => setEditSellerCommModal(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-btn">
                                    Save Override
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: PROCESS / DISBURSE PAYOUT */}
            {processPayoutModal && (
                <div className="admin-modal-backdrop" onClick={() => setProcessPayoutModal(null)}>
                    <div className="admin-modal-card" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Disburse Settlement Payout</h3>
                            <button className="modal-close-btn" onClick={() => setProcessPayoutModal(null)}>
                                <FiXCircle />
                            </button>
                        </div>
                        <form onSubmit={handleProcessPayout} className="modal-form">
                            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>Payout ID: <strong>{processPayoutModal.payoutNumber}</strong></div>
                                <div style={{ fontSize: "16px", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
                                    Net Amount: ₹{Number(processPayoutModal.netAmount || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Bank Transaction Reference / UTR Number *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. NEFT20261118001"
                                    value={processPayoutModal.transactionReference}
                                    onChange={(e) => setProcessPayoutModal({ ...processPayoutModal, transactionReference: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Disbursal Remarks</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Settled to registered HDFC bank account"
                                    value={processPayoutModal.remarks}
                                    onChange={(e) => setProcessPayoutModal({ ...processPayoutModal, remarks: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="modal-cancel-btn" onClick={() => setProcessPayoutModal(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-submit-btn">
                                    Confirm Disbursal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
