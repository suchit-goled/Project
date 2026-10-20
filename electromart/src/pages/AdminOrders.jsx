import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import AdminService from "../services/admin.service";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Admin.css";

function AdminOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminService.getOrders(statusFilter);
            setOrders(data || []);
        } catch (error) {
            console.error("Fetch admin orders error:", error);
            toast.error("Failed to load orders");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        if (user && user.role === "admin") {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    if (!user || user.role !== "admin") {
        return (
            <div className="admin-access-denied container">
                <h2>Admin Privileges Required</h2>
                <p>Only administrators can access the order dispatch pipeline.</p>
                <Link to="/" className="denied-home-btn">Return Home</Link>
            </div>
        );
    }

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await AdminService.updateOrderStatus(id, newStatus);
            toast.success(`Order marked as ${newStatus}`);
            setOrders(orders.map((o) => (o._id === id ? { ...o, orderStatus: newStatus } : o)));
        } catch (error) {
            console.error("Update status error:", error);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="admin-portal container">
            <div className="admin-portal-header">
                <div>
                    <Link to="/admin" className="back-admin-link">
                        <FiArrowLeft /> Back to Admin Overview
                    </Link>
                    <h1>Order Fulfillment Pipeline</h1>
                    <p>Track, manage, and update live shipment statuses for customer orders.</p>
                </div>
                <button className="refresh-admin-btn" onClick={fetchOrders}>
                    <FiRefreshCw /> Refresh Orders
                </button>
            </div>

            {/* Filter pills */}
            <div className="section-toolbar">
                <div className="status-filter-pills">
                    {["", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                        <button
                            key={st}
                            className={`status-filter-pill ${statusFilter === st ? "active" : ""}`}
                            onClick={() => setStatusFilter(st)}
                        >
                            {st || "All Orders"}
                        </button>
                    ))}
                </div>
                <span className="toolbar-count">
                    {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
            </div>

            {loading ? (
                <div className="admin-loading-state">
                    <p>Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="admin-card-table-box" style={{ padding: "48px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-secondary)" }}>No orders found for this status.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer & Address</th>
                                <th>Products</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Current Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((ord) => (
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
                                        <div className="admin-order-products-preview">
                                            {(ord.products || []).map((p, idx) => (
                                                <div key={idx} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                    • {p.title} (x{p.quantity})
                                                </div>
                                            ))}
                                        </div>
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
                                            onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
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
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
