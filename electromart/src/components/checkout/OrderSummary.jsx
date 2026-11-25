import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import OrderService from "../../services/order.service";
import PaymentService from "../../services/payment.service";
import PaymentMethod from "./PaymentMethod";
import CatalogImage from "../common/CatalogImage";
import { formatINR } from "../../utils/formatCurrency";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import "./OrderSummary.css";

const OrderSummary = ({ address }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, clearCart, subtotal, shippingCharge, taxAmount, grandTotal } = useCart();

    const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalFlash, setTotalFlash] = useState(false);
    const prevTotalRef = useRef(grandTotal);

    useEffect(() => {
        if (prevTotalRef.current !== grandTotal) {
            setTotalFlash(true);
            prevTotalRef.current = grandTotal;
            const t = setTimeout(() => setTotalFlash(false), 400);
            return () => clearTimeout(t);
        }
    }, [grandTotal]);

    const handleOnlinePayment = async (order) => {
        try {
            const razorpayOrder = await PaymentService.createOrder(order._id);
            const rzpData = razorpayOrder.data || razorpayOrder;

            const razorpayKey = rzpData.keyId || rzpData.key || process.env.REACT_APP_RAZORPAY_KEY_ID;
            if (!razorpayKey) {
                toast.error("Online payment is not configured. Please choose Cash on Delivery or contact support.");
                setIsSubmitting(false);
                return;
            }

            const options = {
                key: razorpayKey,
                amount: rzpData.amount,
                currency: rzpData.currency || "INR",
                name: "ElectroNova",
                description: `Order #${order._id.slice(-6).toUpperCase()}`,
                order_id: rzpData.id,
                prefill: {
                    name: address.fullName,
                    contact: address.phone,
                    email: user?.email || "",
                },
                theme: {
                    color: "#C84B1E",
                },
                modal: {
                    ondismiss: function () {
                        setIsSubmitting(false);
                        toast("Payment cancelled. Your order remains Pending in My Orders.");
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
                            clearCart(true);
                            toast.success("Payment verified. Order confirmed.");
                            navigate("/order-success", {
                                state: { order: verifyRes.data || order },
                            });
                        } else {
                            setIsSubmitting(false);
                            toast.error("Payment verification failed on server.");
                        }
                    } catch (verifyErr) {
                        setIsSubmitting(false);
                        console.error("Verification error:", verifyErr);
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
            };

            if (window.Razorpay) {
                const razorpay = new window.Razorpay(options);
                razorpay.on("payment.failed", function (response) {
                    setIsSubmitting(false);
                    toast.error(`Payment failed: ${response.error?.description || "Transaction declined"}`);
                });
                razorpay.open();
            } else {
                setIsSubmitting(false);
                toast.error("Razorpay SDK not loaded. Check your connection and try again.");
            }
        } catch (error) {
            setIsSubmitting(false);
            console.error("Online payment error:", error);
            const msg = error.response?.data?.message || "Could not initialize online payment gateway";
            toast.error(msg);
        }
    };

    const handleCheckout = async () => {
        if (isSubmitting) return;

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
                    clearCart(true);
                    toast.success("Order confirmed via Cash on Delivery.");
                    navigate("/order-success", {
                        state: { order },
                    });
                } else {
                    await handleOnlinePayment(order);
                }
            } else {
                toast.error(response.message || "Failed to create order");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            const msg = error.response?.data?.message || error.message || "An error occurred during checkout";
            toast.error(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <aside className="order-summary-card" aria-label="Order summary and payment">
            <div className="order-summary-header">
                <h2>Order Summary</h2>
                <span className="summary-item-count">
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
            </div>

            <div className="summary-items-scroll">
                {cart.map((item, idx) => {
                    const product = item.productId || {};
                    const title = product.product_title || item.title || "Product";
                    const image = product.product_image_url || item.image || "";
                    const unitPrice = item.price ?? product.discounted_price ?? product.price ?? 0;
                    const qty = item.quantity || 1;
                    const lineTotal = unitPrice * qty;
                    const key = product._id || item.productId || idx;

                    return (
                        <div key={key} className="summary-item-row">
                            <CatalogImage
                                src={image}
                                alt={title}
                                className="summary-item-thumb"
                            />
                            <div className="summary-item-meta">
                                <div className="summary-item-name">{title}</div>
                                <div className="summary-item-qty">Qty: {qty}</div>
                            </div>
                            <span className="summary-item-total">{formatINR(lineTotal)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="summary-payment-block">
                <h3 className="summary-payment-title">Payment Method</h3>
                <PaymentMethod
                    selectedMethod={paymentMethod}
                    onChange={setPaymentMethod}
                />
                <div key={paymentMethod} className="payment-context-note checkout-field-reveal">
                    {paymentMethod === "Cash On Delivery"
                        ? "Pay in cash or via UPI QR upon doorstep delivery."
                        : "You will be directed to Razorpay to complete UPI, Card, or NetBanking payment. Order confirms only after verification."}
                </div>
            </div>

            <div className="summary-breakdown">
                <div className="summary-line">
                    <span>Subtotal</span>
                    <span>{formatINR(subtotal)}</span>
                </div>
                <div className="summary-line">
                    <span>Shipping</span>
                    <span>{shippingCharge === 0 ? "Free" : formatINR(shippingCharge)}</span>
                </div>
                <div className="summary-line">
                    <span>Estimated GST (Included / Tax)</span>
                    <span>{formatINR(taxAmount)}</span>
                </div>

                <div className={`summary-total-row ${totalFlash ? "total-changed-flash" : ""}`}>
                    <span className="summary-total-label">Total</span>
                    <span className="summary-total-amount">{formatINR(grandTotal)}</span>
                </div>
            </div>

            <button
                type="button"
                className="place-order-btn"
                onClick={handleCheckout}
                disabled={isSubmitting || cart.length === 0}
            >
                {isSubmitting
                    ? (paymentMethod === "Razorpay" ? "Opening Payment…" : "Placing Order…")
                    : (paymentMethod === "Razorpay" ? `Pay ${formatINR(grandTotal)}` : `Place Order (${formatINR(grandTotal)})`)}
            </button>

            <div className="summary-trust-footer">
                <FiLock size={13} />
                <span>256-bit encrypted checkout · Official seller warranty</span>
            </div>
        </aside>
    );
};

export default OrderSummary;
