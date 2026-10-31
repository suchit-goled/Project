import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    FiMapPin,
    FiUser,
    FiPhone,
    FiHome,
    FiCompass,
    FiMap,
    FiHash,
    FiCheck
} from "react-icons/fi";
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

    const isPrefilled = Boolean(
        user && (user.name || user.phone || user.address || user.city)
    );

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
                <div className="header-icon-circle">
                    <FiMapPin />
                </div>
                <div className="header-text-block">
                    <div className="header-title-row">
                        <h2>Shipping & Delivery Address</h2>
                        {isPrefilled && (
                            <span className="address-prefilled-tag">
                                <FiCheck size={13} /> Prefilled from Profile
                            </span>
                        )}
                    </div>
                    <p>Enter your full delivery address where you would like your package sent.</p>
                </div>
            </div>

            <div className="address-grid">
                <div className="form-group col-half">
                    <label htmlFor="address-fullName">
                        Full Name <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                        <FiUser className="field-icon" />
                        <input
                            id="address-fullName"
                            type="text"
                            name="fullName"
                            placeholder="Recipient's Name (e.g. John Doe)"
                            value={address.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group col-half">
                    <label htmlFor="address-phone">
                        Phone Number <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                        <FiPhone className="field-icon" />
                        <input
                            id="address-phone"
                            type="tel"
                            name="phone"
                            placeholder="10-digit mobile number"
                            value={address.phone}
                            onChange={handleChange}
                            maxLength={10}
                            required
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="address-street">
                        Street Address / Apartment / Flat No. <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                        <FiHome className="field-icon" />
                        <input
                            id="address-street"
                            type="text"
                            name="address"
                            placeholder="Flat/House No., Building Name, Street & Area"
                            value={address.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group col-third">
                    <label htmlFor="address-city">
                        City / Town <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                        <FiCompass className="field-icon" />
                        <input
                            id="address-city"
                            type="text"
                            name="city"
                            placeholder="e.g. Bengaluru"
                            value={address.city}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group col-third">
                    <label htmlFor="address-state">
                        State <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                        <FiMap className="field-icon" />
                        <input
                            id="address-state"
                            type="text"
                            name="state"
                            placeholder="e.g. Karnataka"
                            value={address.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group col-third">
                    <label htmlFor="address-pincode">
                        Postal PIN Code <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                        <FiHash className="field-icon" />
                        <input
                            id="address-pincode"
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
        </div>
    );
};

export default AddressForm;
