import React from "react";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

const PaymentMethod = ({ selectedMethod, onChange }) => {
    const methods = [
        {
            id: "Cash On Delivery",
            title: "Cash on Delivery",
            description: "Pay with cash when your shipment arrives",
            icon: <FaMoneyBillWave size={22} color="#ff6b35" />
        },
        {
            id: "Razorpay",
            title: "Online Payment (Razorpay / UPI / Cards)",
            description: "Fast and secure online payment via Razorpay",
            icon: <FaCreditCard size={22} color="#ff6b35" />
        }
    ];

    return (
        <div className="payment-method-options" style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
            {methods.map((method) => (
                <label
                    key={method.id}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 18px",
                        border: selectedMethod === method.id ? "2px solid #ff6b35" : "1.5px solid #e2e8f0",
                        borderRadius: "12px",
                        cursor: "pointer",
                        background: selectedMethod === method.id ? "rgba(255, 107, 53, 0.05)" : "#fff",
                        transition: "all 0.2s ease"
                    }}
                >
                    <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={() => onChange(method.id)}
                        style={{ accentColor: "#ff6b35", width: "18px", height: "18px" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        {method.icon}
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "15px", color: "#1e293b" }}>{method.title}</div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>{method.description}</div>
                        </div>
                    </div>
                </label>
            ))}
        </div>
    );
};

export default PaymentMethod;
