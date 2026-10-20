import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

import OrderService from "../services/order.service";
import OrderCard from "../components/OrderCard";
import EmptyOrders from "../components/EmptyOrders";

import "./Myorders.css";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const user = JSON.parse(userStr);
            const userId = user?.id || user?._id;

            if (!userId) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const response = await OrderService.getOrders(userId);

            if (response && response.success) {
                const ordersList = response.data?.orders || response.orders || [];
                setOrders(ordersList);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Fetch Orders Error:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleCancelOrder = async (orderId) => {
        await OrderService.cancelOrder(orderId);
        await fetchOrders();
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <h2>Loading Orders...</h2>
            </div>
        );
    }

    return (
        <motion.div
            className="my-orders-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <h1>My Orders</h1>

            {orders && orders.length > 0 ? (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onCancel={handleCancelOrder}
                        />
                    ))}
                </div>
            ) : (
                <EmptyOrders />
            )}
        </motion.div>
    );
};

export default MyOrders;
