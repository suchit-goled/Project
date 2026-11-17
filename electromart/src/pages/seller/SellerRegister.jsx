import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FiBriefcase,
    FiUser,
    FiShoppingBag,
    FiCreditCard,
    FiArrowRight,
    FiShield
} from "react-icons/fi";
import toast from "react-hot-toast";
import SellerService from "../../services/seller.service";
import { useAuth } from "../../context/AuthContext";
import "./SellerRegister.css";

const SellerRegister = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [sellerType, setSellerType] = useState("business"); // 'business' | 'individual'
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        legalName: user?.name || "",
        displayName: user?.name || "",
        contactPhone: "",
        contactEmail: user?.email || "",
        gstin: "",
        pan: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        storeName: "",
        storeDescription: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: user?.name || "",
        supportsSellerDelivery: true,
        supportsPlatformDelivery: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please sign in or create an account first");
            navigate("/login");
            return;
        }

        if (!formData.legalName.trim()) {
            toast.error("Please provide your legal business or full name");
            return;
        }

        if (!formData.contactPhone.trim() || formData.contactPhone.length < 10) {
            toast.error("Please enter a valid 10-digit contact phone number");
            return;
        }

        if (sellerType === "business" && !formData.gstin.trim()) {
            toast.error("GSTIN number is required for business seller registration");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                sellerType,
                legalName: formData.legalName.trim(),
                displayName: formData.displayName.trim() || formData.legalName.trim(),
                contactPhone: formData.contactPhone.trim(),
                contactEmail: formData.contactEmail.trim().toLowerCase(),
                gstin: formData.gstin.trim().toUpperCase(),
                pan: formData.pan.trim().toUpperCase(),
                businessAddress: {
                    addressLine: formData.addressLine.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim(),
                    country: "India",
                },
                bankDetails: {
                    bankName: formData.bankName.trim(),
                    accountNumber: formData.accountNumber.trim(),
                    ifscCode: formData.ifscCode.trim().toUpperCase(),
                    accountHolderName: formData.accountHolderName.trim() || formData.legalName.trim(),
                },
                storeName: formData.storeName.trim() || formData.displayName.trim() || "My Electronics Store",
                storeDescription: formData.storeDescription.trim(),
                pickupAddress: {
                    addressLine: formData.addressLine.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim(),
                    phone: formData.contactPhone.trim(),
                },
                deliveryOptions: {
                    supportsSellerDelivery: formData.supportsSellerDelivery,
                    supportsPlatformDelivery: formData.supportsPlatformDelivery,
                },
            };

            await SellerService.registerSeller(payload);

            toast.success("Seller registration approved! Welcome to ElectroNova Marketplace.");

            // Update user role in localStorage & context
            if (user) {
                const updatedUser = {
                    ...user,
                    role: "seller",
                    sellerStatus: "approved",
                };
                if (typeof updateUser === "function") {
                    updateUser(updatedUser);
                } else {
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                }
            }

            navigate("/seller/dashboard");
        } catch (err) {
            console.error("Seller registration error:", err);
            const msg = err.response?.data?.message || "Failed to register seller profile.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-register-page">
            <div className="container">
                <div className="seller-register-card">
                    {/* Header */}
                    <div className="seller-reg-header">
                        <span className="seller-pill-badge">
                            <FiShield /> ElectroNova Merchant Network
                        </span>
                        <h1>Register as an Electronics Seller</h1>
                        <p>
                            Reach millions of electronics shoppers across India. List smartphones, laptops, audio, and accessories with zero upfront onboarding fees.
                        </p>
                    </div>

                    {/* Seller Type Selection */}
                    <div className="seller-type-selector">
                        <button
                            type="button"
                            className={`type-tab-btn ${sellerType === "business" ? "active" : ""}`}
                            onClick={() => setSellerType("business")}
                        >
                            <FiBriefcase className="type-icon" />
                            <div>
                                <strong>Business Seller</strong>
                                <span>Registered electronics company, retail store, or GST firm</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`type-tab-btn ${sellerType === "individual" ? "active" : ""}`}
                            onClick={() => setSellerType("individual")}
                        >
                            <FiUser className="type-icon" />
                            <div>
                                <strong>Individual Seller</strong>
                                <span>Individual technician, refurbisher, or independent merchant</span>
                            </div>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="seller-reg-form">
                        {/* Section 1: Business / Identity Info */}
                        <div className="form-section-box">
                            <div className="section-title-row">
                                <FiBriefcase />
                                <h3>1. {sellerType === "business" ? "Company & Legal Details" : "Personal & Identity Details"}</h3>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>
                                        {sellerType === "business" ? "Registered Company Name" : "Full Legal Name"} *
                                    </label>
                                    <input
                                        type="text"
                                        name="legalName"
                                        placeholder={sellerType === "business" ? "e.g. Apex Electronics India Pvt Ltd" : "e.g. Rahul Sharma"}
                                        value={formData.legalName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Display / Merchant Name</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        placeholder="e.g. Apex Tech Store"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Contact Phone (for dispatch & customer inquiries) *</label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        placeholder="e.g. 9876543210"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Business Email *</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        placeholder="e.g. merchant@company.com"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>{sellerType === "business" ? "GSTIN Number *" : "GSTIN (Optional for Individuals)"}</label>
                                    <input
                                        type="text"
                                        name="gstin"
                                        placeholder="e.g. 29AABCU9603R1Z2"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        required={sellerType === "business"}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>PAN Card Number</label>
                                    <input
                                        type="text"
                                        name="pan"
                                        placeholder="e.g. AABCU9603R"
                                        value={formData.pan}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Store & Pickup Address */}
                        <div className="form-section-box">
                            <div className="section-title-row">
                                <FiShoppingBag />
                                <h3>2. Storefront & Warehouse Pickup Address</h3>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Store Name *</label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        placeholder="e.g. Apex Gadgets Hub"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Store Bio / Description</label>
                                    <input
                                        type="text"
                                        name="storeDescription"
                                        placeholder="Brief summary of your electronics specialties and warranties"
                                        value={formData.storeDescription}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Warehouse / Pickup Street Address *</label>
                                <input
                                    type="text"
                                    name="addressLine"
                                    placeholder="Shop / Unit number, Industrial Area or Street"
                                    value={formData.addressLine}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="e.g. Bengaluru"
                                        value={formData.city}
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
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>PIN Code *</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        placeholder="e.g. 560001"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Bank Details & Delivery Capabilities */}
                        <div className="form-section-box">
                            <div className="section-title-row">
                                <FiCreditCard />
                                <h3>3. Settlement Bank Account & Logistics Options</h3>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        placeholder="e.g. 50100234812345"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        placeholder="e.g. HDFC0001234"
                                        value={formData.ifscCode}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Account Holder Name</label>
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        placeholder="Name as printed on bank passbook"
                                        value={formData.accountHolderName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="delivery-checkbox-group">
                                <label className="custom-checkbox-row">
                                    <input
                                        type="checkbox"
                                        name="supportsPlatformDelivery"
                                        checked={formData.supportsPlatformDelivery}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        <strong>Enable ElectroNova Express Fulfilled Delivery</strong>
                                        <small>ElectroNova courier partners pick up parcels from your store and deliver them.</small>
                                    </span>
                                </label>

                                <label className="custom-checkbox-row">
                                    <input
                                        type="checkbox"
                                        name="supportsSellerDelivery"
                                        checked={formData.supportsSellerDelivery}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        <strong>Enable Seller-Handled Direct Dispatch</strong>
                                        <small>Dispatch parcels via your own logistics channels or local delivery agents.</small>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="seller-reg-actions">
                            <button
                                type="submit"
                                className="seller-submit-btn"
                                disabled={loading}
                            >
                                {loading ? "Approving Registration..." : "Complete Registration & Open Store"}
                                <FiArrowRight />
                            </button>
                            <Link to="/" className="cancel-reg-link">Cancel & Return to Storefront</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerRegister;
