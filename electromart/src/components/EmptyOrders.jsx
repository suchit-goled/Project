import React from "react";
import { FaBoxOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./EmptyOrders.css";

const EmptyOrders = () => {

    const navigate = useNavigate();

    return (
        <div className="empty-orders">

            <FaBoxOpen className="empty-icon"/>

            <h2>No Orders Yet</h2>

            <p>
                Looks like you haven't placed any orders.
            </p>

            <button
                onClick={() => navigate("/products")}
            >
                Start Shopping
            </button>

        </div>
    );
};

export default EmptyOrders;