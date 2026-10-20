import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiMapPin, FiUser, FiPhone, FiHome } from "react-icons/fi";
import "./AddressForm.css";

const AddressForm = ({ onAddressChange }) => {
    const { user } = useAuth();

    const [address, setAddress] = useState({
        fullName: user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
        state: user?.state || "",
        pincode: user?.pincode || ""
    });

    useEffect(() => {
        if (user) {
            setAddress((prev) => ({
                fullName: prev.fullName || user.name || "",
                phone: prev.phone || user.phone || "",
                address: prev.address || user.address || "",
                city: prev.city || user.city || "",
                state: prev.state || user.state || "",
                pincode: prev.pincode || user.pincode || ""
            }));
        }
    }, [user]);

    useEffect(() => {
        if (onAddressChange) {
            onAddressChange(address);
        }
    }, [address, onAddressChange]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = {
            ...address,
            [name]: value
        };
        setAddress(updated);
        if (onAddressChange) {
            onAddressChange(updated);
        }
    };

    return (
        <div className="address-card">
            <div className="address-card-header">
                <FiMapPin className="address-header-icon" />
                <div>
                    <h2>Shipping & Delivery Address</h2>
                    <p>Enter the complete address where your order should be delivered.</p>
                </div>
            </div>

            <div className="address-grid">
                <div className="form-group">
                    <label>Full Name *</label>
                    <div className="input-with-icon">
                        <FiUser />
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Recipient's Name"
                            value={address.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Phone Number *</label>
                    <div className="input-with-icon">
                        <FiPhone />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="10-digit mobile number"
                            value={address.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Street Address / Apartment *</label>
                    <div className="input-with-icon">
                        <FiHome />
                        <input
                            type="text"
                            name="address"
                            placeholder="Flat/House No, Building, Street, Area"
                            value={address.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>City *</label>
                    <input
                        type="text"
                        name="city"
                        placeholder="e.g. Bengaluru"
                        value={address.city}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>State *</label>
                    <input
                        type="text"
                        name="state"
                        placeholder="e.g. Karnataka"
                        value={address.state}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>PIN Code *</label>
                    <input
                        type="text"
                        name="pincode"
                        placeholder="6-digit PIN"
                        value={address.pincode}
                        onChange={handleChange}
                        maxLength={6}
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default AddressForm;
