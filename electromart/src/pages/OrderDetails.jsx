import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/ui/Loader/Loader";
import Badge from "../components/ui/Badge/Badge";
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orders/details/${orderId}`);
                setOrder(response.data.data?.order || response.data.order);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            setCancelling(true);
            await api.put(`/orders/cancel/${orderId}`);
            setOrder(prev => ({ ...prev, orderStatus: "Cancelled" }));
        } catch (err) {
            alert(err.response?.data?.message || "Could not cancel order");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "80px 20px", display: "flex", justifyContent: "center" }}>
                <Loader text="Loading order details..." />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "30px" }}>
                <h2>Order Not Found</h2>
                <p style={{ color: "#64748b", margin: "14px 0" }}>{error || "The requested order could not be found."}</p>
                <Link to="/orders" style={{ display: "inline-block", padding: "10px 20px", background: "#ff6b35", color: "#fff", borderRadius: "8px", textDecoration: "none" }}>
                    Back to My Orders
                </Link>
            </div>
        );
    }

    const getStatusVariant = (status) => {
        switch (status) {
            case "Delivered": return "success";
            case "Cancelled": return "danger";
            case "Shipped":
            case "Out for Delivery": return "primary";
            default: return "warning";
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
            <button
                onClick={() => navigate("/orders")}
                style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#64748b", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}
            >
                <FaArrowLeft /> Back to Orders
            </button>

            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                        <h2 style={{ fontSize: "22px", margin: 0, color: "#0f172a" }}>Order #{order._id?.slice(-8).toUpperCase()}</h2>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Badge variant={getStatusVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                        <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                    </div>
                </div>

                <div style={{ margin: "24px 0" }}>
                    <h3 style={{ fontSize: "16px", color: "#334155", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaBox color="#ff6b35" /> Products ({order.products?.length || 0})
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {order.products?.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", border: "1px solid #f1f5f9", borderRadius: "10px" }}>
                                {item.image && (
                                    <img src={item.image} alt={item.title} style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "6px" }} />
                                )}
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b" }}>{item.title}</h4>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</span>
                                </div>
                                <span style={{ fontWeight: 600, color: "#ff6b35" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", margin: "24px 0" }}>
                    <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaMapMarkerAlt color="#ff6b35" /> Shipping Address
                        </h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "#1e293b", lineHeight: 1.6 }}>
                            {order.shippingAddress?.fullName && <strong>{order.shippingAddress.fullName}<br /></strong>}
                            {order.shippingAddress?.address}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                        </p>
                    </div>

                    <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaCreditCard color="#ff6b35" /> Payment Details
                        </h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "#1e293b", lineHeight: 1.6 }}>
                            Method: <strong>{order.paymentMethod}</strong><br />
                            Status: <strong style={{ color: order.paymentStatus === "Paid" ? "#10b981" : "#f59e0b" }}>{order.paymentStatus}</strong>
                        </p>
                    </div>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px", marginLeft: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
                        <span>Shipping:</span>
                        <span>{order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
                        <span>Tax:</span>
                        <span>₹{order.tax?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: 700, color: "#0f172a", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                        <span>Total:</span>
                        <span style={{ color: "#ff6b35" }}>₹{order.total?.toLocaleString()}</span>
                    </div>
                </div>

                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            style={{ padding: "10px 18px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: 600, cursor: cancelling ? "not-allowed" : "pointer" }}
                        >
                            {cancelling ? "Cancelling..." : "Cancel Order"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
