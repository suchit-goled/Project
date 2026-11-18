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
import "./OrderDetails.css";

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
                <p style={{ color: "var(--text-secondary)", margin: "14px 0" }}>{error || "The requested order could not be found."}</p>
                <Link to="/orders" className="back-to-orders-btn">
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
        <div className="order-details-page">
            <button
                onClick={() => navigate("/orders")}
                className="back-to-orders-btn"
            >
                <FaArrowLeft /> Back to Orders
            </button>

            <div className="order-details-card">
                {/* Header Section */}
                <div className="order-header-row">
                    <div>
                        <div className="order-title-group">
                            <h2 className="order-main-title">
                                Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                            </h2>
                            {order.isMultiSeller && (
                                <span className="multi-seller-badge">
                                    Multi-Seller Order ({order.sellerOrders?.length || "Multiple"} Packages)
                                </span>
                            )}
                        </div>
                        <span className="order-placed-date">
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                    <div className="order-badges-group">
                        <Badge variant={getStatusVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                        <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                    </div>
                </div>

                {/* Multi-Seller Fulfillment Packages Section */}
                {hasSellerOrders ? (
                    <div className="fulfillment-packages-container">
                        <div className="packages-heading-row">
                            <FaTruck className="packages-heading-icon" />
                            <h3 className="packages-heading-title">
                                Fulfillment Packages ({order.sellerOrders.length})
                            </h3>
                            <span className="packages-heading-subtitle">
                                (Dispatched separately by independent sellers)
                            </span>
                        </div>

                        <div className="packages-stack">
                            {order.sellerOrders.map((so, idx) => {
                                const currentStep = getTimelineStepIndex(so.orderStatus);
                                const steps = ["Confirmed", "Packed", "Dispatched", "Out for Delivery", "Delivered"];
                                const isCancelled = so.orderStatus === "Cancelled";

                                return (
                                    <div
                                        key={so._id || idx}
                                        className="package-box"
                                    >
                                        {/* Package Header */}
                                        <div className="package-header">
                                            <div>
                                                <div className="package-title-row">
                                                    <span className="package-number-tag">
                                                        Package {idx + 1}: {so.sellerOrderNumber || `Sub-Order #${so._id?.slice(-8).toUpperCase()}`}
                                                    </span>
                                                    <span className={`delivery-method-pill ${so.deliveryMethod === "seller_delivery" ? "seller" : "platform"}`}>
                                                        {so.deliveryMethod === "seller_delivery" ? "Seller Direct Delivery" : "ElectroNova Logistics"}
                                                    </span>
                                                </div>

                                                <div className="sold-by-row">
                                                    <FaStore />
                                                    <span>Sold by: </span>
                                                    {so.storeId ? (
                                                        <Link
                                                            to={`/stores/${so.storeId.slug || ""}`}
                                                            className="store-link-accent"
                                                        >
                                                            {so.storeId.name || so.storeId.storeName}
                                                        </Link>
                                                    ) : (
                                                        <strong>Verified Electronics Partner</strong>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                                                <Badge variant={getStatusVariant(so.orderStatus)}>{so.orderStatus}</Badge>
                                                {so.trackingNumber && (
                                                    <span className="tracking-info-text">
                                                        Track: <strong>{so.courierPartner || "Express"}: {so.trackingNumber}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Shipment Step Indicator */}
                                        {!isCancelled ? (
                                            <div className="stepper-container">
                                                <div className="stepper-steps-row">
                                                    {steps.map((st, stepIdx) => {
                                                        const isDone = currentStep >= stepIdx;
                                                        const isCurrent = currentStep === stepIdx;
                                                        return (
                                                            <div key={st} className="step-item">
                                                                <div
                                                                    className={`step-circle ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                                                                >
                                                                    {isDone ? <FaCheckCircle size={14} /> : stepIdx + 1}
                                                                </div>
                                                                <span className={`step-label ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                                                                    {st}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ margin: "14px 0", padding: "10px 14px", background: "var(--error-bg)", color: "var(--error)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}>
                                                This package has been cancelled.
                                            </div>
                                        )}

                                        {/* Products in this Package */}
                                        <div className="package-products-list">
                                            {(so.products || []).map((itm, iIdx) => (
                                                <div
                                                    key={iIdx}
                                                    className="package-product-item"
                                                >
                                                    <img
                                                        src={itm.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80"}
                                                        alt={itm.title}
                                                        className="package-product-img"
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <h5 className="package-product-title">{itm.title}</h5>
                                                        <span className="package-product-qty">
                                                            Qty: {itm.quantity} × ₹{Number(itm.price || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className="package-product-price">
                                                        ₹{(Number(itm.price || 0) * Number(itm.quantity || 1)).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipment timeline events if logged */}
                                        {Array.isArray(so.shipmentTimeline) && so.shipmentTimeline.length > 0 && (
                                            <div className="timeline-updates-box">
                                                <span className="timeline-updates-title">
                                                    <FaClock size={11} /> Shipment Updates:
                                                </span>
                                                <div className="timeline-events-list">
                                                    {so.shipmentTimeline.slice(-3).map((ev, eIdx) => (
                                                        <div key={eIdx} className="timeline-event-item">
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
                        <h3 style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FaBox style={{ color: "var(--electric-blue)" }} /> Products ({order.products?.length || 0})
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {order.products?.map((item, idx) => (
                                <div key={idx} className="package-product-item">
                                    {item.image && (
                                        <img src={item.image} alt={item.title} className="package-product-img" />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h4 className="package-product-title">{item.title}</h4>
                                        <span className="package-product-qty">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</span>
                                    </div>
                                    <span className="package-product-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shipping & Payment Address Grid */}
                <div className="order-info-grid">
                    <div className="order-info-card">
                        <h4>
                            <FaMapMarkerAlt /> Shipping Address
                        </h4>
                        <p>
                            {order.shippingAddress?.fullName && <strong>{order.shippingAddress.fullName}<br /></strong>}
                            {order.shippingAddress?.address}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                        </p>
                    </div>

                    <div className="order-info-card">
                        <h4>
                            <FaCreditCard /> Payment Details
                        </h4>
                        <p>
                            Method: <strong>{order.paymentMethod}</strong><br />
                            Status: <strong style={{ color: order.paymentStatus === "Paid" ? "var(--success)" : "var(--warning)" }}>{order.paymentStatus}</strong>
                        </p>
                    </div>
                </div>

                {/* Total Summary */}
                <div className="order-totals-card">
                    <div className="order-total-row">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="order-total-row">
                        <span>Shipping:</span>
                        <span>{order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}</span>
                    </div>
                    <div className="order-total-row">
                        <span>Tax:</span>
                        <span>₹{order.tax?.toLocaleString()}</span>
                    </div>
                    <div className="order-total-grand">
                        <span>Total:</span>
                        <span className="order-total-grand-amount">₹{order.total?.toLocaleString()}</span>
                    </div>
                </div>

                {/* Cancellation Action */}
                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", textAlign: "right" }}>
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="cancel-order-btn"
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
