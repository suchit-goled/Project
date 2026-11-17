import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FiShoppingBag, FiEdit2, FiTruck, FiCheckCircle } from "react-icons/fi";
import "./CheckoutItemsReview.css";

const CheckoutItemsReview = () => {
    const { cart, cartCount, subtotal, shippingCharge } = useCart();

    if (!cart || cart.length === 0) {
        return null;
    }

    return (
        <div className="checkout-items-card">
            <div className="checkout-items-header">
                <div className="header-left">
                    <div className="header-icon-circle">
                        <FiShoppingBag />
                    </div>
                    <div>
                        <h2>Review Order Items</h2>
                        <p>
                            {cartCount} {cartCount === 1 ? "item" : "items"} ready for dispatch
                        </p>
                    </div>
                </div>
                <Link to="/cart" className="modify-cart-btn" title="Edit items in cart">
                    <FiEdit2 />
                    <span>Modify Cart</span>
                </Link>
            </div>

            <div className="checkout-items-list">
                {cart.map((item, index) => {
                    const product = item.productId || {};
                    const title = product.product_title || item.title || "Product";
                    const image = product.product_image_url || item.image || "";
                    const unitPrice = item.price ?? product.discounted_price ?? product.price ?? 0;
                    const quantity = item.quantity || 1;
                    const itemTotal = unitPrice * quantity;
                    const key = product._id || item.productId || index;

                    return (
                        <div className="checkout-item-row" key={key}>
                            <div className="checkout-item-image-wrapper">
                                <img
                                    src={image}
                                    alt={title}
                                    className="checkout-item-img"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80";
                                    }}
                                />
                            </div>

                            <div className="checkout-item-details">
                                <h3 className="checkout-item-title" title={title}>
                                    {title}
                                </h3>
                                <div className="checkout-item-meta-row">
                                    <span className="checkout-item-badge in-stock">
                                        <FiCheckCircle size={12} /> In Stock
                                    </span>
                                    <span className="checkout-item-badge category">
                                        Sold by: {item.storeId?.name || product.storeId?.name || "ElectroNova Direct"}
                                    </span>
                                    <span className="checkout-item-unit-price">
                                        ₹{unitPrice.toLocaleString()} each
                                    </span>
                                </div>
                            </div>

                            <div className="checkout-item-qty-col">
                                <span className="qty-label">Quantity</span>
                                <span className="qty-value">{quantity}</span>
                            </div>

                            <div className="checkout-item-price-col">
                                <span className="total-label">Subtotal</span>
                                <span className="checkout-item-total-price">
                                    ₹{itemTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="checkout-items-footer">
                <div className="delivery-perk">
                    <FiTruck className="delivery-icon" />
                    <span>
                        {shippingCharge === 0 ? (
                            <>
                                <strong>Free Express Delivery</strong> unlocked on this order!
                            </>
                        ) : (
                            <>
                                <strong>Standard Delivery:</strong> Add ₹
                                {Math.max(0, 1000 - subtotal).toLocaleString()} more for Free Shipping.
                            </>
                        )}
                    </span>
                </div>
                <div className="items-subtotal-preview">
                    <span>Items Subtotal:</span>
                    <strong>₹{subtotal.toLocaleString()}</strong>
                </div>
            </div>
        </div>
    );
};

export default CheckoutItemsReview;
