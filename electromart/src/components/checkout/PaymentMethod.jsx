import React from "react";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import "./PaymentMethod.css";

const PaymentMethod = ({ selectedMethod, onChange }) => {
    const methods = [
        {
            id: "Cash On Delivery",
            title: "Cash on Delivery",
            description: "Pay with cash or UPI on doorstep delivery",
            badge: "Available nationwide",
            icon: <FaMoneyBillWave size={22} />
        },
        {
            id: "Razorpay",
            title: "Instant Online Payment (Razorpay)",
            description: "Zero fees via UPI, GPay, PhonePe, Cards & NetBanking",
            badge: "Fastest dispatch",
            icon: <FaCreditCard size={22} />
        }
    ];

    return (
        <div className="payment-method-options">
            {methods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                    <label
                        key={method.id}
                        className={`payment-method-card ${isSelected ? "selected" : ""}`}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => onChange(method.id)}
                            className="payment-method-radio"
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                            <div className="payment-method-icon-wrap">
                                {method.icon}
                            </div>
                            <div className="payment-method-content">
                                <div className="payment-method-header">
                                    <span className="payment-method-title">
                                        {method.title}
                                    </span>
                                    <span className="payment-method-badge">
                                        {method.badge}
                                    </span>
                                </div>
                                <span className="payment-method-desc">
                                    {method.description}
                                </span>
                            </div>
                        </div>
                        {isSelected && <FiCheckCircle className="payment-selected-check" />}
                    </label>
                );
            })}
        </div>
    );
};

export default PaymentMethod;
