import React from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiArrowRight } from "react-icons/fi";
import "./EmptyCart.css";

const EmptyCart = () => {
    return (
        <section className="empty-cart-page">
            <div className="empty-cart-card holographic-panel">
                <div className="empty-cart-illustration-wrapper">
                    <div className="empty-cart-halo-ring" />
                    <div className="empty-cart-icon">
                        <FiShoppingCart />
                    </div>
                </div>

                <h2>Your Cart is Empty</h2>

                <p>
                    Looks like you haven't added anything yet.
                    <br />
                    Explore our latest gadgets and exclusive deals.
                </p>

                <Link
                    to="/products"
                    className="continue-btn"
                >
                    <span>Continue Shopping</span>
                    <FiArrowRight />
                </Link>
            </div>
        </section>
    );
};

export default EmptyCart;
