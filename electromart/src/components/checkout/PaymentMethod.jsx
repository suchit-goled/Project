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
            icon: <FaMoneyBillWave size={22} color="#0284c7" />
        },
        {
            id: "Razorpay",
            title: "Instant Online Payment (Razorpay)",
            description: "Zero fees via UPI, GPay, PhonePe, Cards & NetBanking",
            badge: "Fastest dispatch",
            icon: <FaCreditCard size={22} color="#0284c7" />
        }
    ];

    return (
        <div className="payment-method-options" style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "14px 0" }}>
            {methods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                    <label
                        key={method.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "14px 16px",
                            border: isSelected ? "2px solid #0284c7" : "1.5px solid #cbd5e1",
                            borderRadius: "10px",
                            cursor: "pointer",
                            background: isSelected ? "#f0f9ff" : "#ffffff",
                            boxShadow: isSelected ? "0 2px 10px rgba(2, 132, 199, 0.12)" : "0 1px 2px rgba(15, 23, 42, 0.04)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => onChange(method.id)}
                            style={{ accentColor: "#0284c7", width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                            <div style={{ flexShrink: 0 }}>
                                {method.icon}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                                        {method.title}
                                    </span>
                                    <span style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        color: isSelected ? "#0284c7" : "#64748b",
                                        background: isSelected ? "#e0f2fe" : "#f1f5f9",
                                        border: isSelected ? "1px solid #bae6fd" : "1px solid #e2e8f0",
                                        padding: "1px 7px",
                                        borderRadius: "9999px"
                                    }}>
                                        {method.badge}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                                    {method.description}
                                </div>
                            </div>
                        </div>
                        {isSelected && <FiCheckCircle color="#0284c7" size={20} style={{ flexShrink: 0 }} />}
                    </label>
                );
            })}
        </div>
    );
};

export default PaymentMethod;
