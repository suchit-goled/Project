import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/ui/Loader/Loader";
import Badge from "../components/ui/Badge/Badge";
import {
    FaArrowLeft,
    FaBox,
    FaMapMarkerAlt,
    FaCreditCard,
    FaTruck,
    FaStore,
    FaCheckCircle,
    FaClock
} from "react-icons/fa";

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
        if (!window.confirm("Are you sure you want to cancel this order? All seller packages will be cancelled.")) return;

        try {
            setCancelling(true);
            await api.put(`/orders/cancel/${orderId}`);
            setOrder(prev => ({
                ...prev,
                orderStatus: "Cancelled",
                sellerOrders: prev.sellerOrders?.map(so => ({ ...so, orderStatus: "Cancelled" }))
            }));
            toast.success("Order cancelled successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not cancel order");
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
            case "Dispatched":
            case "Out for Delivery":
            case "In Transit": return "primary";
            default: return "warning";
        }
    };

    const getTimelineStepIndex = (status) => {
        switch (status) {
            case "Confirmed":
            case "Pending":
                return 0;
            case "Packed":
                return 1;
            case "Dispatched":
            case "In Transit":
                return 2;
            case "Out for Delivery":
                return 3;
            case "Delivered":
                return 4;
            default:
                return -1;
        }
    };

    const hasSellerOrders = Array.isArray(order.sellerOrders) && order.sellerOrders.length > 0;

    return (
        <div style={{ maxWidth: "960px", margin: "40px auto", padding: "0 20px" }}>
            <button
                onClick={() => navigate("/orders")}
                style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#64748b", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}
            >
                <FaArrowLeft /> Back to Orders
            </button>

            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                {/* Header Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <h2 style={{ fontSize: "22px", margin: 0, color: "#0f172a" }}>
                                Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                            </h2>
                            {order.isMultiSeller && (
                                <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>
                                    Multi-Seller Order ({order.sellerOrders?.length || "Multiple"} Packages)
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: "13px", color: "#64748b", display: "block", marginTop: "4px" }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Badge variant={getStatusVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                        <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                    </div>
                </div>

                {/* Multi-Seller Fulfillment Packages Section */}
                {hasSellerOrders ? (
                    <div style={{ margin: "28px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                            <FaTruck color="#ff6b35" size={18} />
                            <h3 style={{ fontSize: "17px", color: "#1e293b", margin: 0 }}>
                                Fulfillment Packages ({order.sellerOrders.length})
                            </h3>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                                (Dispatched separately by independent sellers)
                            </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {order.sellerOrders.map((so, idx) => {
                                const currentStep = getTimelineStepIndex(so.orderStatus);
                                const steps = ["Confirmed", "Packed", "Dispatched", "Out for Delivery", "Delivered"];
                                const isCancelled = so.orderStatus === "Cancelled";

                                return (
                                    <div
                                        key={so._id || idx}
                                        style={{
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            background: "#fafafa"
                                        }}
                                    >
                                        {/* Package Header */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #edf2f7", paddingBottom: "14px" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>
                                                        Package {idx + 1}: {so.sellerOrderNumber || `Sub-Order #${so._id?.slice(-8).toUpperCase()}`}
                                                    </span>
                                                    <span style={{ fontSize: "12px", background: so.deliveryMethod === "seller_delivery" ? "#fef3c7" : "#e0e7ff", color: so.deliveryMethod === "seller_delivery" ? "#92400e" : "#3730a3", padding: "2px 8px", borderRadius: "6px", fontWeight: 500 }}>
                                                        {so.deliveryMethod === "seller_delivery" ? "Seller Direct Delivery" : "ElectroNova Logistics"}
                                                    </span>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", fontSize: "13px", color: "#475569" }}>
                                                    <FaStore color="#64748b" />
                                                    <span>Sold by: </span>
                                                    {so.storeId ? (
                                                        <Link
                                                            to={`/stores/${so.storeId.slug || ""}`}
                                                            style={{ color: "#ff6b35", fontWeight: 600, textDecoration: "none" }}
                                                        >
                                                            {so.storeId.name || so.storeId.storeName}
                                                        </Link>
                                                    ) : (
                                                        <strong>Verified Electronics Partner</strong>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                                <Badge variant={getStatusVariant(so.orderStatus)}>{so.orderStatus}</Badge>
                                                {so.trackingNumber && (
                                                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                                                        Track: <strong style={{ color: "#0f172a" }}>{so.courierPartner || "Express"}: {so.trackingNumber}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Shipment Step Indicator */}
                                        {!isCancelled ? (
                                            <div style={{ margin: "20px 0 16px 0", padding: "12px 16px", background: "#fff", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                                                    {steps.map((st, stepIdx) => {
                                                        const isDone = currentStep >= stepIdx;
                                                        const isCurrent = currentStep === stepIdx;
                                                        return (
                                                            <div key={st} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
                                                                <div
                                                                    style={{
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        borderRadius: "50%",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        fontSize: "12px",
                                                                        fontWeight: 700,
                                                                        background: isDone ? "#10b981" : "#e2e8f0",
                                                                        color: isDone ? "#fff" : "#64748b",
                                                                        boxShadow: isCurrent ? "0 0 0 4px #d1fae5" : "none",
                                                                        transition: "all 0.2s"
                                                                    }}
                                                                >
                                                                    {isDone ? <FaCheckCircle size={14} /> : stepIdx + 1}
                                                                </div>
                                                                <span style={{ fontSize: "11px", marginTop: "6px", color: isDone ? "#0f172a" : "#94a3b8", fontWeight: isCurrent ? 700 : 500, textAlign: "center" }}>
                                                                    {st}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ margin: "14px 0", padding: "10px 14px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", fontSize: "13px" }}>
                                                This package has been cancelled.
                                            </div>
                                        )}

                                        {/* Products in this Package */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                                            {(so.products || []).map((itm, iIdx) => (
                                                <div
                                                    key={iIdx}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "14px",
                                                        padding: "10px",
                                                        background: "#fff",
                                                        borderRadius: "8px",
                                                        border: "1px solid #f1f5f9"
                                                    }}
                                                >
                                                    <img
                                                        src={itm.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80"}
                                                        alt={itm.title}
                                                        style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "6px", background: "#f8fafc" }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <h5 style={{ margin: 0, fontSize: "14px", color: "#1e293b" }}>{itm.title}</h5>
                                                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                                                            Qty: {itm.quantity} × ₹{Number(itm.price || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "14px" }}>
                                                        ₹{(Number(itm.price || 0) * Number(itm.quantity || 1)).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipment timeline events if logged */}
                                        {Array.isArray(so.shipmentTimeline) && so.shipmentTimeline.length > 0 && (
                                            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #e2e8f0" }}>
                                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <FaClock size={11} /> Shipment Updates:
                                                </span>
                                                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                                    {so.shipmentTimeline.slice(-3).map((ev, eIdx) => (
                                                        <div key={eIdx} style={{ fontSize: "11px", color: "#475569" }}>
                                                            • <strong>{ev.status}</strong>: {ev.note || "Status updated"} {ev.timestamp ? `(${new Date(ev.timestamp).toLocaleDateString()})` : ""}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Fallback Single Store / Legacy Products List */
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
                )}

                {/* Shipping & Payment Address Grid */}
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

                {/* Total Summary */}
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

                {/* Cancellation Action */}
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