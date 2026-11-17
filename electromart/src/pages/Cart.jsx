import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";
import { FiArrowLeft, FiTrash2, FiBox } from "react-icons/fi";
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

    // Compute distinct seller stores in cart
    const storeMap = new Map();
    cart.forEach((item) => {
        const store = item.storeId || item.productId?.storeId;
        const key = store?._id || store?.slug || "platform_direct";
        if (!storeMap.has(key)) {
            storeMap.set(key, {
                store: store || { name: "ElectroNova Direct", slug: "" },
                count: 0,
            });
        }
        storeMap.get(key).count += 1;
    });

    const isMultiSellerCart = storeMap.size > 1;

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
                    {isMultiSellerCart && (
                        <div className="multi-seller-notice-banner">
                            <FiBox />
                            <div>
                                <strong>Multi-Seller Order ({storeMap.size} Stores)</strong>
                                <p>Your order contains products from {storeMap.size} different sellers. Items will be packed and dispatched separately.</p>
                            </div>
                        </div>
                    )}
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
