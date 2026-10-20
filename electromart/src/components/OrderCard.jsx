import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCalendarAlt,
    FaMoneyBillWave,
    FaEye,
    FaTimesCircle,
} from "react-icons/fa";
import OrderService from "../services/order.service";
import toast from "react-hot-toast";

import "./OrderCard.css";

const OrderCard = ({ order, onCancel }) => {
    const navigate = useNavigate();
    const [cancelling, setCancelling] = useState(false);

    const canCancel =
        order.orderStatus === "Pending" ||
        order.orderStatus === "Confirmed";

    const handleCancelClick = async (e) => {
        e.stopPropagation();

        if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) {
            return;
        }

        try {
            setCancelling(true);
            if (onCancel) {
                await onCancel(order._id);
            } else {
                await OrderService.cancelOrder(order._id);
            }
            toast.success("Order cancelled successfully");
        } catch (err) {
            console.error("Cancel order error:", err);
            const msg = err.response?.data?.message || "Failed to cancel order";
            toast.error(msg);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="order-card" onClick={() => navigate(`/orders/${order._id}`)}>
            <div className="order-header">
                <div>
                    <h3>Order #{order._id ? order._id.slice(-8).toUpperCase() : "N/A"}</h3>
                    <p>
                        <FaCalendarAlt />
                        {" "}
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }) : "Recent"}
                    </p>
                </div>

                <div className="badges">
                    <span
                        className={`badge payment ${(order.paymentStatus || "pending").toLowerCase()}`}
                    >
                        {order.paymentStatus || "Pending"}
                    </span>

                    <span
                        className={`badge order ${(order.orderStatus || "pending").toLowerCase()}`}
                    >
                        {order.orderStatus || "Pending"}
                    </span>
                </div>
            </div>

            <div className="products">
                {(order.products || []).map((product, idx) => (
                    <div
                        className="product-row"
                        key={product.productId || idx}
                    >
                        <img
                            src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                            alt={product.title}
                        />

                        <div className="product-info">
                            <h4>{product.title}</h4>
                            <p>Qty : {product.quantity}</p>
                        </div>

                        <div className="product-price">
                            ₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="order-footer">
                <h2>
                    <FaMoneyBillWave />
                    ₹{(order.total || 0).toLocaleString()}
                </h2>

                <div className="footer-buttons" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="details-btn"
                        onClick={() => navigate(`/orders/${order._id}`)}
                    >
                        <FaEye />
                        View Details
                    </button>

                    {canCancel && (
                        <button
                            className="cancel-btn"
                            disabled={cancelling}
                            onClick={handleCancelClick}
                        >
                            <FaTimesCircle />
                            {cancelling ? "Cancelling..." : "Cancel Order"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
