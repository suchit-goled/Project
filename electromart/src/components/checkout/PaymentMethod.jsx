import React from "react";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

const PaymentMethod = ({ selectedMethod, onChange }) => {
    const methods = [
        {
            id: "Cash On Delivery",
            title: "Cash on Delivery",
            description: "Pay with cash or UPI on doorstep delivery",
            badge: "Available nationwide",
            icon: <FaMoneyBillWave size={22} color="var(--primary)" />
        },
        {
            id: "Razorpay",
            title: "Instant Online Payment (Razorpay)",
            description: "Zero transaction fees via UPI, Google Pay, PhonePe, Cards, NetBanking",
            badge: "Fastest dispatch",
            icon: <FaCreditCard size={22} color="var(--primary)" />
        }
    ];

    return (
        <div className="payment-method-options" style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
            {methods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                    <label
                        key={method.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "16px 18px",
                            border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            background: isSelected ? "rgba(255, 110, 38, 0.08)" : "var(--bg-card)",
                            transition: "all var(--transition-fast)"
                        }}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => onChange(method.id)}
                            style={{ accentColor: "var(--primary)", width: "18px", height: "18px" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                            {method.icon}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                                        {method.title}
                                    </span>
                                    <span style={{
                                        fontSize: "0.72rem",
                                        fontWeight: 600,
                                        color: isSelected ? "var(--primary)" : "var(--text-muted)",
                                        background: isSelected ? "var(--primary-light)" : "var(--bg-secondary)",
                                        padding: "2px 8px",
                                        borderRadius: "var(--radius-pill)"
                                    }}>
                                        {method.badge}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                    {method.description}
                                </div>
                            </div>
                        </div>
                        {isSelected && <FiCheckCircle color="var(--primary)" size={20} />}
                    </label>
                );
            })}
        </div>
    );
};

export default PaymentMethod;
