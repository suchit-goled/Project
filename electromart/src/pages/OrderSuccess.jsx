import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import "./OrderSuccess.css";
import ShippingAddressCard from "../components/common/order/ShippingCard";

import SuccessAnimation from "../components/SuccessAnimation";
import OrderSummaryCard from "../components/common/order/OrderSummaryCard";
import OrderTimeline from "../components/common/order/OrderTimeline";

const OrderSuccess = () => {

    const navigate = useNavigate();

    const { state } = useLocation();

    const order = state?.order;

    if (!order) {
        return (
            <div className="order-success-empty">

                <h2>Order not found</h2>

                <button onClick={() => navigate("/")}>
                    Go Home
                </button>

            </div>
        );
    }

    return (

        <motion.div
            className="order-success-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >

            <SuccessAnimation />

            <motion.div
                className="success-heading"
                initial={{ y: -40 }}
                animate={{ y: 0 }}
            >

                <h1>Order Placed Successfully!</h1>

                <p>
                    Thank you for shopping with ElectroNova.
                </p>

                <p>
                    Your order has been confirmed.
                </p>

            </motion.div>

            <motion.div
                className="order-info-card"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
            >

                <div className="info-row">
                    <span>Order ID</span>
                    <strong>{order._id}</strong>
                </div>

                <div className="info-row">
                    <span>Payment</span>
                    <strong>{order.paymentMethod}</strong>
                </div>

                <div className="info-row">
                    <span>Status</span>
                    <strong>{order.paymentStatus}</strong>
                </div>

                <div className="info-row">
                    <span>Date</span>
                    <strong>
                        {new Date(order.createdAt).toLocaleDateString()}
                    </strong>
                </div>

            </motion.div>

            <OrderSummaryCard order={order} />

            <OrderTimeline status={order.orderStatus} />

            <motion.div
                className="success-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >

                <button
                    onClick={() => navigate("/products")}
                >
                    Continue Shopping
                </button>

                <button
                    onClick={() => navigate("/orders")}
                >
                    My Orders
                </button>

            </motion.div>

        </motion.div>
    );
};

export default OrderSuccess;