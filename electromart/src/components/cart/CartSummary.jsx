import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FiShield, FiTag, FiCheck, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import "./CartSummary.css";

const CartSummary = () => {
    const { subtotal, shippingCharge, taxAmount, grandTotal, cart } = useCart();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponCode.trim().toUpperCase();
        if (code === "ELECTRO10" || code === "NOVA10") {
            const disc = Math.round(subtotal * 0.1);
            setDiscountAmount(disc);
            setCouponApplied(true);
            toast.success("Promo code applied! 10% discount saved.");
        } else if (code) {
            toast.error("Invalid coupon code. Try ELECTRO10");
        }
    };

    const finalTotal = Math.max(0, grandTotal - discountAmount);

    return (
        <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
                <span>Subtotal ({cart.length} {cart.length === 1 ? "item" : "items"})</span>
                <span>₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="summary-row">
                <span>Estimated Shipping</span>
                <span className={shippingCharge === 0 ? "free-shipping-text" : ""}>
                    {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                </span>
            </div>

            <div className="summary-row">
                <span>Estimated GST (18%)</span>
                <span>₹{taxAmount.toLocaleString()}</span>
            </div>

            {couponApplied && (
                <div className="summary-row discount-row">
                    <span>Promo Discount (10%)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
            )}

            <hr className="summary-divider" />

            <div className="summary-total">
                <div>
                    <span>Total Amount</span>
                    <span className="total-hint">Inclusive of all taxes</span>
                </div>
                <span className="total-figure">₹{finalTotal.toLocaleString()}</span>
            </div>

            {/* Coupon Code Section */}
            <form className="coupon-form" onSubmit={handleApplyCoupon}>
                <div className="coupon-input-wrapper">
                    <FiTag className="coupon-tag-icon" />
                    <input
                        type="text"
                        placeholder="Promo code (try ELECTRO10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied}
                    />
                    <button type="submit" disabled={couponApplied || !couponCode.trim()}>
                        {couponApplied ? <FiCheck /> : "Apply"}
                    </button>
                </div>
            </form>

            <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
            >
                <span>Proceed To Checkout</span>
                <FiArrowRight />
            </button>

            <div className="cart-summary-trust">
                <FiShield />
                <span>Guaranteed Safe & Secure 256-Bit Encrypted Checkout</span>
            </div>
        </div>
    );
};

export default CartSummary;
