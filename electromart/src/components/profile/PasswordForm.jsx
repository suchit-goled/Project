import React, { useState } from "react";
import api from "../../api/axios";

const PasswordForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match." });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters long." });
            return;
        }

        try {
            setLoading(true);
            await api.post("/password/reset-password", {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: "success", text: "Password updated successfully!" });
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to update password."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {message.text && (
                <div style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: message.type === "error" ? "#ef4444" : "#10b981",
                    background: message.type === "error" ? "#fef2f2" : "#f0fdf4"
                }}>
                    {message.text}
                </div>
            )}
            <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
                    Current Password
                </label>
                <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                />
            </div>
            <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
                    New Password
                </label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                />
            </div>
            <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
                    Confirm New Password
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: "12px 20px",
                    background: "#ff6b35",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer"
                }}
            >
                {loading ? "Updating..." : "Update Password"}
            </button>
        </form>
    );
};

export default PasswordForm;
