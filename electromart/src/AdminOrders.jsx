import React, {
    useEffect,
    useState
}
from "react";

import axios from "axios";

function AdminOrders() {

    const [orders, setOrders] =
        useState([]);

    useEffect(() => {

        fetchOrders();

    }, []);

    const fetchOrders = async () => {

        try {

            const res = await axios.get(
                "http://localhost:8000/all-orders"
            );

            console.log(res.data);

            setOrders(res.data || []);

        }

        catch (error) {

            console.log(error);

        }

    };

    // UPDATE STATUS

    const updateStatus = async (
        id,
        status
    ) => {

        try {

            await axios.put(

                `http://localhost:8000/update-order-status/${id}`,

                { status }

            );

            alert(
                "Status Updated"
            );

            fetchOrders();

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="admin-orders-page">

            <h1 className="admin-orders-title">
                📦 Manage Orders
            </h1>

            {
                orders.length === 0 ? (

                    <h2>
                        No Orders Found
                    </h2>

                ) : (

                    orders.map((order) => (

                        <div
                            className="admin-order-card"
                            key={order._id}
                        >

                            {/* TOP */}

                            <div className="order-top">

                                <div className="customer-details">

                                    <h3>
                                        👤 {order.name}
                                    </h3>

                                    <p>
                                        📧 {order.email}
                                    </p>

                                    <p>
                                        📱 {order.phone}
                                    </p>

                                    <p>
                                        💳 {order.payment}
                                    </p>

                                    <p>
                                        📍 {order.address}
                                    </p>

                                </div>

                                <div className="order-status">

                                    {
                                        order.status ||
                                        "Order Confirmed"
                                    }

                                </div>

                            </div>

                            {/* PRODUCTS */}

                            <div className="order-products">

                                {
                                    order.items?.map(
                                        (item, index) => (

                                            <div
                                                className="admin-product"
                                                key={index}
                                            >

                                                <img
                                                    src={item.image}
                                                    alt=""
                                                />

                                                <div className="product-info">

                                                    <h4>
                                                        {
                                                            item.title
                                                        }
                                                    </h4>

                                                    <p>
                                                        ₹{
                                                            item.price
                                                        }
                                                    </p>

                                                    <p>
                                                        Qty:
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        )
                                    )
                                }

                            </div>

                            {/* STATUS BUTTONS */}

                            <div className="status-buttons">

                                <button
                                    className="packed-btn"
                                    onClick={() =>
                                        updateStatus(
                                            order._id,
                                            "Packed"
                                        )
                                    }
                                >
                                    Packed
                                </button>

                                <button
                                    className="shipped-btn"
                                    onClick={() =>
                                        updateStatus(
                                            order._id,
                                            "Shipped"
                                        )
                                    }
                                >
                                    Shipped
                                </button>

                                <button
                                    className="delivered-btn"
                                    onClick={() =>
                                        updateStatus(
                                            order._id,
                                            "Delivered"
                                        )
                                    }
                                >
                                    Delivered
                                </button>

                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        updateStatus(
                                            order._id,
                                            "Cancelled"
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                    ))

                )
            }

        </div>

    );

}

export default AdminOrders;