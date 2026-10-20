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
    FiXCircle
} from "react-icons/fi";
import AdminService from "../services/admin.service";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Admin.css";

function Admin() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("overview"); // overview, products, orders, users
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
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

    const fetchAdminData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashData, prods, ords, usrs] = await Promise.allSettled([
                AdminService.getDashboard(),
                AdminService.getProducts(),
                AdminService.getOrders(),
                AdminService.getUsers()
            ]);

            if (dashData.status === "fulfilled") setStats(dashData.value);
            if (prods.status === "fulfilled") setProducts(prods.value || []);
            if (ords.status === "fulfilled") setOrders(ords.value || []);
            if (usrs.status === "fulfilled") setUsers(usrs.value || []);
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
            const discPrice = Number(newProduct.discounted_price);
            const origPrice = Number(newProduct.original_price) || discPrice;
            const discPct = origPrice > discPrice ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0;

            await AdminService.createProduct({
                ...newProduct,
                discounted_price: discPrice,
                original_price: origPrice,
                discount_percentage: discPct,
                product_rating: 4.5,
                total_reviews: 1,
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
            console.error("Create product error:", err);
            toast.error(err.response?.data?.message || "Failed to create product");
        } finally {
            setSavingProduct(false);
        }
    };

    // Delete Product
    const handleDeleteProduct = async (id, title) => {
        if (!window.confirm(`Delete product "${title}" permanently?`)) return;

        try {
            await AdminService.deleteProduct(id);
            toast.success("Product deleted successfully");
            setProducts(products.filter((p) => p._id !== id));
        } catch (err) {
            console.error("Delete product error:", err);
            toast.error("Failed to delete product");
        }
    };

    // Update Order Status
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await AdminService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
        } catch (err) {
            console.error("Update status error:", err);
            toast.error("Failed to update order status");
        }
    };

    // Update User Role
    const handleToggleUserRole = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        if (!window.confirm(`Change role of this user to ${newRole.toUpperCase()}?`)) return;

        try {
            await AdminService.updateUserRole(userId, newRole);
            toast.success(`Role updated to ${newRole}`);
            setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        } catch (err) {
            console.error("Role update error:", err);
            toast.error("Failed to update user role");
        }
    };

    // Delete User
    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}" and their associated data?`)) return;

        try {
            await AdminService.deleteUser(userId);
            toast.success("User deleted successfully");
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err) {
            console.error("Delete user error:", err);
            toast.error(err.response?.data?.message || "Failed to delete user");
        }
    };

    const filteredProducts = products.filter((p) =>
        (p.product_title || "").toLowerCase().includes(productSearch.toLowerCase())
    );

    const filteredOrders = orderStatusFilter
        ? orders.filter((o) => o.orderStatus === orderStatusFilter)
        : orders;

    return (
        <div className="admin-portal container">
            {/* Header */}
            <div className="admin-portal-header">
                <div>
                    <span className="admin-badge">Admin Operations Suite</span>
                    <h1>ElectroNova Management Portal</h1>
                    <p>Live inventory control, order fulfillment pipeline, and customer analytics.</p>
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
                    className={`admin-tab-item ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    <FiUsers /> Customers ({users.length})
                </button>
            </div>

            {loading ? (
                <div className="admin-loading-state">
                    <p>Loading platform metrics and database records...</p>
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
                                        <span className="metric-label">Delivered Revenue</span>
                                        <h3 className="metric-val">₹{(stats?.totalRevenue || 0).toLocaleString()}</h3>
                                    </div>
                                </div>

                                <div className="stat-metric-card orders">
                                    <div className="metric-icon-box"><FiShoppingCart /></div>
                                    <div>
                                        <span className="metric-label">Total Orders</span>
                                        <h3 className="metric-val">{stats?.totalOrders || orders.length}</h3>
                                        <span className="metric-sub">{stats?.pendingOrders || 0} pending</span>
                                    </div>
                                </div>

                                <div className="stat-metric-card products">
                                    <div className="metric-icon-box"><FiPackage /></div>
                                    <div>
                                        <span className="metric-label">Live Catalogue</span>
                                        <h3 className="metric-val">{stats?.totalProducts || products.length}</h3>
                                        <span className="metric-sub">Active electronics</span>
                                    </div>
                                </div>

                                <div className="stat-metric-card users">
                                    <div className="metric-icon-box"><FiUsers /></div>
                                    <div>
                                        <span className="metric-label">Registered Accounts</span>
                                        <h3 className="metric-val">{stats?.totalUsers || users.length}</h3>
                                        <span className="metric-sub">Customers & staff</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders Preview */}
                            <div className="admin-card-table-box">
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
                                                    <td>{ord.shippingAddress?.fullName || "Guest Customer"}</td>
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
                                <div className="table-search-box">
                                    <FiSearch />
                                    <input
                                        type="text"
                                        placeholder="Search products by title..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                </div>
                                <span className="toolbar-count">
                                    Showing {filteredProducts.length} items
                                </span>
                            </div>

                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Offer Price</th>
                                            <th>Original Price</th>
                                            <th>Discount</th>
                                            <th>Rating</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.slice(0, 50).map((prod) => (
                                            <tr key={prod._id}>
                                                <td>
                                                    <div className="product-table-item">
                                                        <img
                                                            src={prod.product_image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80"}
                                                            alt={prod.product_title}
                                                            className="table-item-thumb"
                                                        />
                                                        <div>
                                                            <strong className="table-item-title">{prod.product_title}</strong>
                                                            <span className="table-item-id">ID: {prod._id.slice(-6)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="category-chip">{prod.product_category}</span></td>
                                                <td><strong>₹{(prod.discounted_price || 0).toLocaleString()}</strong></td>
                                                <td>₹{(prod.original_price || 0).toLocaleString()}</td>
                                                <td>{prod.discount_percentage}% OFF</td>
                                                <td>⭐ {prod.product_rating || 4.5}</td>
                                                <td>
                                                    <div className="table-row-actions">
                                                        <Link
                                                            to={`/products/${prod._id}`}
                                                            target="_blank"
                                                            className="view-link-btn"
                                                            title="View product page"
                                                        >
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
                                <div className="status-filter-pills">
                                    {["", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                                        <button
                                            key={st}
                                            className={`status-filter-pill ${orderStatusFilter === st ? "active" : ""}`}
                                            onClick={() => setOrderStatusFilter(st)}
                                        >
                                            {st || "All Statuses"}
                                        </button>
                                    ))}
                                </div>
                                <span className="toolbar-count">
                                    {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
                                </span>
                            </div>

                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer & Address</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Update Status</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((ord) => (
                                            <tr key={ord._id}>
                                                <td>
                                                    <strong>#{ord._id.slice(-8).toUpperCase()}</strong>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                        {new Date(ord.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div><strong>{ord.shippingAddress?.fullName}</strong></div>
                                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                        Ph: {ord.shippingAddress?.phone}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="items-count-badge">
                                                        {(ord.products || []).length} items
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong style={{ color: "var(--primary)" }}>
                                                        ₹{(ord.total || 0).toLocaleString()}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span className={`status-pill ${(ord.paymentStatus || "pending").toLowerCase()}`}>
                                                        {ord.paymentStatus || "Pending"}
                                                    </span>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                                        {ord.paymentMethod}
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        className="status-select-input"
                                                        value={ord.orderStatus}
                                                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
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

                    {/* TAB 4: USERS */}
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
                                                <td>{usr.phone || "—"}</td>
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

            {/* ADD PRODUCT MODAL */}
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
        </div>
    );
}

export default Admin;
