import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import "./Cart.css";

const Cart = () => {
    const { cart, loading, cartCount, clearCart } = useCart();

    if (loading && cart.length === 0) {
        return (
            <div className="cart-page container">
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <h2>Loading your shopping cart...</h2>
                </div>
            </div>
        );
    }

    if (!cart || cart.length === 0) {
        return <EmptyCart />;
    }

    return (
        <section className="cart-page container">
            <div className="cart-header-row">
                <div>
                    <h1>Shopping Cart</h1>
                    <span className="cart-items-subtitle">
                        {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
                    </span>
                </div>

                <div className="cart-header-actions">
                    <Link to="/products" className="continue-shopping-link">
                        <FiArrowLeft /> Continue Shopping
                    </Link>
                    <button
                        className="clear-cart-text-btn"
                        onClick={clearCart}
                        title="Remove all items from cart"
                    >
                        <FiTrash2 /> Clear Cart
                    </button>
                </div>
            </div>

            <div className="cart-layout">
                <div className="cart-left">
                    <div className="cart-items-list">
                        {cart.map((item, index) => {
                            const key = item.productId?._id || item.productId || index;
                            return <CartItem key={key} item={item} />;
                        })}
                    </div>
                </div>

                <div className="cart-right">
                    <CartSummary />
                </div>
            </div>
        </section>
    );
};

export default Cart;
