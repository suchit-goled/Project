import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/ui/Loader/Loader";
import CatalogImage from "../components/common/CatalogImage";
import { formatINR, formatDateIN } from "../utils/formatCurrency";
import {
    FiArrowLeft,
    FiCheck,
    FiXCircle,
    FiMapPin,
    FiCreditCard,
    FiRefreshCw,
} from "react-icons/fi";
import "./OrderDetails.css";

const SHIPMENT_STEPS = [
    { key: "Confirmed", label: "Order Confirmed" },
    { key: "Packed", label: "Packed by Seller" },
    { key: "Dispatched", label: "Dispatched" },
    { key: "Out for Delivery", label: "Out for Delivery" },
    { key: "Delivered", label: "Delivered" },
];

const getTimelineStepIndex = (status) => {
    switch (status) {
        case "Pending":
        case "Confirmed":
            return 0;
        case "Packed":
            return 1;
        case "Shipped":
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

const getStepTimestamp = (timeline, stepKey) => {
    if (!Array.isArray(timeline) || timeline.length === 0) return null;
    const aliases = {
        Confirmed: ["Pending", "Confirmed"],
        Packed: ["Packed"],
        Dispatched: ["Dispatched", "Shipped", "In Transit"],
        "Out for Delivery": ["Out for Delivery"],
        Delivered: ["Delivered"],
    };
    const matchKeys = aliases[stepKey] || [stepKey];
    const found = timeline.find((ev) => matchKeys.includes(ev.status));
    if (!found) return null;
    return {
        date: found.timestamp ? formatDateIN(found.timestamp, { hour: "2-digit", minute: "2-digit" }) : null,
        note: found.note || null,
    };
};

const VerticalShipmentTimeline = ({
    status,
    timeline,
    animatedConnectorIdx,
}) => {
    const isCancelled = status === "Cancelled";
    const currentStep = getTimelineStepIndex(status);

    if (isCancelled) {
        const cancelEvent = Array.isArray(timeline)
            ? timeline.find((ev) => ev.status === "Cancelled")
            : null;
        return (
            <div className="tracker-cancelled-box" role="status">
                <FiXCircle size={18} />
                <div>
                    <strong>Shipment Cancelled</strong>
                    <p>
                        {cancelEvent?.note || "This shipment was cancelled and will not be dispatched."}
                        {cancelEvent?.timestamp ? ` · ${formatDateIN(cancelEvent.timestamp)}` : ""}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ol className="vertical-timeline" aria-label="Shipment progress">
            {SHIPMENT_STEPS.map((step, idx) => {
                const isCompleted = currentStep > idx || (currentStep === 4 && idx === 4);
                const isCurrent = currentStep === idx && currentStep < 4;
                const stateLabel = isCompleted ? "Completed" : isCurrent ? "Current" : "Upcoming";
                const stepMeta = getStepTimestamp(timeline, step.key);
                const shouldAnimateConnector = animatedConnectorIdx === idx;

                return (
                    <li
                        key={step.key}
                        className={`timeline-step ${isCompleted ? "is-completed" : ""} ${isCurrent ? "is-current" : ""} ${!isCompleted && !isCurrent ? "is-upcoming" : ""}`}
                        aria-current={isCurrent ? "step" : undefined}
                    >
                        <div className="timeline-track">
                            <span className="timeline-marker" aria-hidden="true">
                                {isCompleted ? (
                                    <FiCheck size={13} strokeWidth={2.5} />
                                ) : isCurrent ? (
                                    <span className="timeline-current-dot" />
                                ) : null}
                            </span>
                            {idx < SHIPMENT_STEPS.length - 1 && (
                                <span className="timeline-connector-bg">
                                    {(isCompleted || isCurrent) && currentStep > idx && (
                                        <span
                                            className={`timeline-connector-fill ${shouldAnimateConnector ? "tracker-connector-animate" : ""}`}
                                        />
                                    )}
                                </span>
                            )}
                        </div>

                        <div className="timeline-content">
                            <div className="timeline-row-top">
                                <span className="timeline-step-label">{step.label}</span>
                                <span className={`timeline-state-tag state-${stateLabel.toLowerCase()}`}>
                                    {stateLabel}
                                </span>
                            </div>
                            {stepMeta?.date ? (
                                <div className="timeline-step-meta tabular-nums">
                                    {stepMeta.date}
                                    {stepMeta.note ? ` — ${stepMeta.note}` : ""}
                                </div>
                            ) : stepMeta?.note ? (
                                <div className="timeline-step-meta">{stepMeta.note}</div>
                            ) : isCompleted || isCurrent ? (
                                <div className="timeline-step-meta">Recorded</div>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");

    // Track previous step indices per package key so connector animates ONLY on real status updates
    const prevStepMapRef = useRef({});
    const [animatedConnectors, setAnimatedConnectors] = useState({});

    const applyOrderWithTransitionDetection = (nextOrder, isInitialLoad = false) => {
        if (!nextOrder) return;

        if (!isInitialLoad) {
            const updates = {};
            if (Array.isArray(nextOrder.sellerOrders) && nextOrder.sellerOrders.length > 0) {
                nextOrder.sellerOrders.forEach((so, idx) => {
                    const pkgKey = so._id || `pkg_${idx}`;
                    const prevIdx = prevStepMapRef.current[pkgKey];
                    const nextIdx = getTimelineStepIndex(so.orderStatus);
                    if (typeof prevIdx === "number" && nextIdx > prevIdx) {
                        updates[pkgKey] = prevIdx;
                    }
                    prevStepMapRef.current[pkgKey] = nextIdx;
                });
            } else {
                const prevIdx = prevStepMapRef.current.single;
                const nextIdx = getTimelineStepIndex(nextOrder.orderStatus);
                if (typeof prevIdx === "number" && nextIdx > prevIdx) {
                    updates.single = prevIdx;
                }
                prevStepMapRef.current.single = nextIdx;
            }
            setAnimatedConnectors(updates);
        } else {
            // Initial load / refresh: record current step without animating
            if (Array.isArray(nextOrder.sellerOrders) && nextOrder.sellerOrders.length > 0) {
                nextOrder.sellerOrders.forEach((so, idx) => {
                    prevStepMapRef.current[so._id || `pkg_${idx}`] = getTimelineStepIndex(so.orderStatus);
                });
            } else {
                prevStepMapRef.current.single = getTimelineStepIndex(nextOrder.orderStatus);
            }
        }

        setOrder(nextOrder);
    };

    const fetchOrder = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await api.get(`/orders/details/${orderId}`);
            const fetched = response.data.data?.order || response.data.order;
            applyOrderWithTransitionDetection(fetched, !isManualRefresh);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load order details");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order? All seller packages will be cancelled.")) return;

        try {
            setCancelling(true);
            await api.put(`/orders/cancel/${orderId}`);
            setOrder((prev) => ({
                ...prev,
                orderStatus: "Cancelled",
                sellerOrders: prev.sellerOrders?.map((so) => ({ ...so, orderStatus: "Cancelled" })),
            }));
            toast.success("Order cancelled.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not cancel order");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="tracker-loading-wrap">
                <Loader text="Loading order tracking..." />
            </div>
        );
    }

    if (error || !order) {
        return (
            <main className="tracker-empty-wrap">
                <h1>Order not found</h1>
                <p>{error || "The requested order could not be located."}</p>
                <Link to="/orders" className="btn-outline-catalog">
                    Back to My Orders
                </Link>
            </main>
        );
    }

    const hasSellerOrders = Array.isArray(order.sellerOrders) && order.sellerOrders.length > 0;
    const orderNumberDisplay = order.orderNumber || order._id?.slice(-8).toUpperCase();
    const orderDateDisplay = formatDateIN(order.createdAt, { hour: "2-digit", minute: "2-digit" });
    const backendEstimate = order.estimatedDeliveryDate || order.estimatedDelivery || null;

    return (
        <main className="order-tracker-page">
            <div className="catalog-container-narrow">
                <div className="tracker-top-bar">
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="tracker-back-btn"
                    >
                        <FiArrowLeft size={15} />
                        <span>All orders</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fetchOrder(true)}
                        disabled={refreshing}
                        className="tracker-refresh-btn"
                    >
                        <FiRefreshCw size={14} />
                        <span>{refreshing ? "Checking…" : "Refresh status"}</span>
                    </button>
                </div>

                {/* Primary Status Headline */}
                <header className="tracker-headline-block">
                    <span className="tracker-kicker">Order Status</span>
                    <h1 className="tracker-status-headline">{order.orderStatus}</h1>
                    <div className="tracker-meta-strip tabular-nums">
                        <span>Order #{orderNumberDisplay}</span>
                        {orderDateDisplay && <span>· Placed {orderDateDisplay}</span>}
                        {backendEstimate && <span>· Estimated delivery {formatDateIN(backendEstimate) || backendEstimate}</span>}
                    </div>
                </header>

                {/* Multi-Seller Packages or Older Single-Seller Order */}
                {hasSellerOrders ? (
                    <section className="tracker-packages-list" aria-label="Shipment packages">
                        {order.sellerOrders.map((so, idx) => {
                            const pkgKey = so._id || `pkg_${idx}`;
                            const pkgEstimate = so.estimatedDeliveryDate || so.estimatedDelivery || null;

                            return (
                                <article key={pkgKey} className="tracker-package-card">
                                    <div className="tracker-package-head">
                                        <div>
                                            <span className="tracker-package-num tabular-nums">
                                                Package {idx + 1} of {order.sellerOrders.length} · {so.sellerOrderNumber || `#${so._id?.slice(-6).toUpperCase()}`}
                                            </span>
                                            <h2 className="tracker-package-status">{so.orderStatus}</h2>
                                            <div className="tracker-package-seller">
                                                Sold by{" "}
                                                {so.storeId ? (
                                                    <Link to={`/stores/${so.storeId.slug || ""}`} className="tracker-seller-link">
                                                        {so.storeId.name || so.storeId.storeName}
                                                    </Link>
                                                ) : (
                                                    <strong>Verified Seller</strong>
                                                )}
                                                {pkgEstimate ? ` · Est. delivery ${formatDateIN(pkgEstimate) || pkgEstimate}` : ""}
                                            </div>
                                        </div>

                                        {so.trackingNumber && (
                                            <div className="tracker-awb-box tabular-nums">
                                                <span>{so.courierPartner || "Courier"}</span>
                                                <strong>{so.trackingNumber}</strong>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items in this shipment immediately below header */}
                                    <div className="tracker-items-list">
                                        {(so.products || []).map((itm, iIdx) => (
                                            <div key={iIdx} className="tracker-item-row">
                                                <CatalogImage
                                                    src={itm.image}
                                                    alt={itm.title}
                                                    className="tracker-item-thumb"
                                                />
                                                <div className="tracker-item-info">
                                                    <div className="tracker-item-title">{itm.title}</div>
                                                    <div className="tracker-item-qty tabular-nums">
                                                        Qty {itm.quantity} × {formatINR(itm.price)}
                                                    </div>
                                                </div>
                                                <div className="tracker-item-total tabular-nums">
                                                    {formatINR(Number(itm.price || 0) * Number(itm.quantity || 1))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Vertical Shipment Timeline */}
                                    <div className="tracker-timeline-wrap">
                                        <VerticalShipmentTimeline
                                            status={so.orderStatus}
                                            timeline={so.shipmentTimeline}
                                            animatedConnectorIdx={animatedConnectors[pkgKey]}
                                        />
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                ) : (
                    /* Older Single-Seller Order Layout */
                    <article className="tracker-package-card">
                        <div className="tracker-items-list">
                            {(order.products || []).map((item, idx) => (
                                <div key={idx} className="tracker-item-row">
                                    <CatalogImage
                                        src={item.image}
                                        alt={item.title}
                                        className="tracker-item-thumb"
                                    />
                                    <div className="tracker-item-info">
                                        <div className="tracker-item-title">{item.title}</div>
                                        <div className="tracker-item-qty tabular-nums">
                                            Qty {item.quantity} × {formatINR(item.price)}
                                        </div>
                                    </div>
                                    <div className="tracker-item-total tabular-nums">
                                        {formatINR(Number(item.price || 0) * Number(item.quantity || 1))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="tracker-timeline-wrap">
                            <VerticalShipmentTimeline
                                status={order.orderStatus}
                                timeline={order.shipmentTimeline}
                                animatedConnectorIdx={animatedConnectors.single}
                            />
                        </div>
                    </article>
                )}

                {/* Shipping Address & Payment Totals */}
                <div className="tracker-details-grid">
                    <div className="tracker-info-box">
                        <h3><FiMapPin size={14} /> Delivery Address</h3>
                        <p>
                            {order.shippingAddress?.fullName && (
                                <><strong>{order.shippingAddress.fullName}</strong><br /></>
                            )}
                            {order.shippingAddress?.address}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                            <span className="tabular-nums">{order.shippingAddress?.pincode}</span>
                        </p>
                    </div>

                    <div className="tracker-info-box tabular-nums">
                        <h3><FiCreditCard size={14} /> Payment &amp; Totals</h3>
                        <div className="tracker-summary-lines">
                            <div><span>Method</span><strong>{order.paymentMethod} ({order.paymentStatus})</strong></div>
                            <div><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
                            <div><span>Shipping</span><span>{order.shippingCharge === 0 ? "Free" : formatINR(order.shippingCharge)}</span></div>
                            <div><span>Tax</span><span>{formatINR(order.tax)}</span></div>
                            <div className="tracker-summary-total"><span>Total</span><strong>{formatINR(order.total)}</strong></div>
                        </div>
                    </div>
                </div>

                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                    <div className="tracker-cancel-bar">
                        <button
                            type="button"
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="tracker-cancel-btn"
                        >
                            {cancelling ? "Cancelling…" : "Cancel order"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default OrderDetails;
