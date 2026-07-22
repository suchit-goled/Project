import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCalendarAlt,
    FaMoneyBillWave,
    FaEye,
    FaTimesCircle,
} from "react-icons/fa";

import "./OrderCard.css";

const OrderCard = ({ order }) => {

    const navigate = useNavigate();

    const canCancel =
        order.orderStatus === "Pending" ||
        order.orderStatus === "Confirmed";

    return (
        <div className="order-card">

            <div className="order-header">

                <div>

                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>

                    <p>
                        <FaCalendarAlt />
                        {" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                </div>

                <div className="badges">

                    <span
                        className={`badge payment ${order.paymentStatus.toLowerCase()}`}
                    >
                        {order.paymentStatus}
                    </span>

                    <span
                        className={`badge order ${order.orderStatus.toLowerCase()}`}
                    >
                        {order.orderStatus}
                    </span>

                </div>

            </div>

            <div className="products">

                {order.products.map((product) => (

                    <div
                        className="product-row"
                        key={product.productId}
                    >

                        <img
                            src={product.image}
                            alt={product.title}
                        />

                        <div className="product-info">

                            <h4>{product.title}</h4>

                            <p>
                                Qty : {product.quantity}
                            </p>

                        </div>

                        <div className="product-price">

                            ₹{(product.price * product.quantity).toLocaleString()}

                        </div>

                    </div>

                ))}

            </div>

            <div className="order-footer">

                <h2>

                    <FaMoneyBillWave />

                    ₹{order.total.toLocaleString()}

                </h2>

                <div className="footer-buttons">

                    <button
                        className="details-btn"
                        onClick={() =>
                            navigate(`/orders/details/${order._id}`)
                        }
                    >
                        <FaEye />
                        View Details
                    </button>

                    {canCancel && (

                        <button className="cancel-btn">

                            <FaTimesCircle />

                            Cancel

                        </button>

                    )}

                </div>

            </div>

        </div>
    );
};

export default OrderCard;