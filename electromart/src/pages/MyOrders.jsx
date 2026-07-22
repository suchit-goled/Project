import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import OrderService from "../services/order.service";
import OrderCard from "../components/OrderCard";
import EmptyOrders from "../components/EmptyOrders";

import "./Myorders.css";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            console.log("Logged User:", user);

            if (!user || !user.id) {
                console.error("User not found");
                setLoading(false);
                return;
            }

            const response = await OrderService.getOrders(user.id);

            console.log("API Response:", response);

            if (response.success) {
                console.log("Orders:", response.orders);
                console.log("Orders Count:", response.orders.length);

                setOrders(response.orders);
            } else {
                console.error("API returned success=false");
            }
        } catch (error) {
            console.error("Fetch Orders Error:", error);
        } finally {
            setLoading(false);
        }
    };

    console.log("Orders State:", orders);

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

            {orders.length > 0 ? (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
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