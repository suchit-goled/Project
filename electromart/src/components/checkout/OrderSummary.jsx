import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import OrderService from "../../services/order.service";
import PaymentService from "../../services/payment.service";
import PaymentMethod from "./PaymentMethod";
import toast from "react-hot-toast";
import { FiLock, FiShield } from "react-icons/fi";
import "./OrderSummary.css";

const OrderSummary = ({ address }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, clearCart, subtotal, shippingCharge, taxAmount, grandTotal } = useCart();

    const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOnlinePayment = async (order) => {
        try {
            const razorpayOrder = await PaymentService.createOrder(order._id);
            const rzpData = razorpayOrder.data || razorpayOrder;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_ElectroNova",
                amount: rzpData.amount,
                currency: rzpData.currency || "INR",
                name: "ElectroNova Tech Store",
                description: `Payment for Order #${order._id.slice(-6).toUpperCase()}`,
                order_id: rzpData.id,
                prefill: {
                    name: address.fullName,
                    contact: address.phone,
                    email: user?.email || "",
                },
                theme: {
                    color: "#ff6e26",
                },
                modal: {
                    ondismiss: function () {
                        toast("Payment window closed. Your order is saved as Pending in My Orders.", {
                            icon: "ℹ️",
                        });
                        navigate("/orders");
                    },
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await PaymentService.verifyPayment({
                            orderId: order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyRes.success) {
                            await clearCart();
                            toast.success("Payment verified! Order placed successfully.");
                            navigate("/order-success", {
                                state: { order: verifyRes.data || order },
                            });
                        } else {
                            toast.error("Payment verification failed on server.");
                        }
                    } catch (verifyErr) {
                        console.error("Verification error:", verifyErr);
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
            };

            if (window.Razorpay) {
                const razorpay = new window.Razorpay(options);
                razorpay.on("payment.failed", function (response) {
                    toast.error(`Payment failed: ${response.error.description || "Transaction declined"}`);
                });
                razorpay.open();
            } else {
                toast.error("Razorpay SDK not loaded. Please check your internet connection.");
            }
        } catch (error) {
            console.error("Online payment error:", error);
            const msg = error.response?.data?.message || "Could not initialize online payment gateway";
            toast.error(msg);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error("Please sign in to place your order");
            navigate("/login?redirect=/checkout");
            return;
        }

        if (cart.length === 0) {
            toast.error("Your cart is empty");
            navigate("/products");
            return;
        }

        // Validate address
        if (
            !address?.fullName?.trim() ||
            !address?.phone?.trim() ||
            !address?.address?.trim() ||
            !address?.city?.trim() ||
            !address?.state?.trim() ||
            !address?.pincode?.trim()
        ) {
            toast.error("Please fill in all delivery address fields.");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await OrderService.createOrder({
                shippingAddress: address,
                paymentMethod,
            });

            if (response.success) {
                const order = response.data;

                if (paymentMethod === "Cash On Delivery") {
                    await clearCart();
                    toast.success("Order placed successfully via Cash on Delivery!");
                    navigate("/order-success", {
                        state: { order },
                    });
                } else {
                    await handleOnlinePayment(order);
                }
            } else {
                toast.error(response.message || "Failed to create order");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            const msg = error.response?.data?.message || error.message || "An error occurred during checkout";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="order-summary-card">
            <h2>Order Review</h2>

            {/* Cart Items Preview */}
            <div className="summary-items-scroll">
                {cart.map((item, idx) => {
                    const product = item.productId || {};
                    const title = product.product_title || item.title || "Product";
                    const image = product.product_image_url || item.image || "";
                    const price = product.discounted_price ?? item.price ?? 0;
                    const key = product._id || item.productId || idx;

                    return (
                        <div className="summary-item-row" key={key}>
                            <img src={image} alt={title} className="summary-item-thumb" />
                            <div className="summary-item-meta">
                                <span className="summary-item-title">{title}</span>
                                <span className="summary-item-qty">Qty: {item.quantity || 1}</span>
                            </div>
                            <span className="summary-item-price">
                                ₹{(price * (item.quantity || 1)).toLocaleString()}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Calculations Breakdown */}
            <div className="summary-breakdown">
                <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                    <span>Shipping</span>
                    <span className={shippingCharge === 0 ? "free-tag" : ""}>
                        {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                    </span>
                </div>
                <div className="breakdown-row">
                    <span>GST (18%)</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                </div>

                <hr className="summary-divider" />

                <div className="breakdown-total">
                    <div>
                        <strong>Total Amount</strong>
                        <span className="sub-hint">Includes all taxes</span>
                    </div>
                    <span className="grand-price">₹{grandTotal.toLocaleString()}</span>
                </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-selection-section">
                <h3>Select Payment Method</h3>
                <PaymentMethod
                    selectedMethod={paymentMethod}
                    onChange={setPaymentMethod}
                />
            </div>

            {/* Place Order CTA */}
            <button
                className="place-order-btn"
                onClick={handleCheckout}
                disabled={isSubmitting || cart.length === 0}
            >
                <FiLock />
                <span>
                    {isSubmitting
                        ? "Processing Order..."
                        : paymentMethod === "Cash On Delivery"
                        ? "Confirm & Place Order"
                        : `Pay ₹${grandTotal.toLocaleString()} via Razorpay`}
                </span>
            </button>

            <div className="checkout-trust-notice">
                <FiShield />
                <span>Encrypted 256-bit SSL transaction guarantee.</span>
            </div>
        </div>
    );
};

export default OrderSummary;
