import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FiHome,
    FiExternalLink,
    FiSave,
    FiCheckCircle,
    FiAlertCircle,
    FiMapPin,
    FiTruck,
    FiPhone,
} from "react-icons/fi";
import SellerService from "../../services/seller.service";
import "./SellerStoreProfile.css";

const SellerStoreProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [storeSlug, setStoreSlug] = useState("");

    const [form, setForm] = useState({
        name: "",
        tagline: "",
        description: "",
        logo: "",
        banner: "",
        contactPhone: "",
        contactEmail: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        supportsSellerDelivery: true,
        supportsPlatformDelivery: true,
        estimatedDeliveryDays: 3,
        freeDeliveryAbove: 999,
    });

    useEffect(() => {
        const fetchStoreProfile = async () => {
            setLoading(true);
            try {
                const profile = await SellerService.getProfile();
                if (profile?.store) {
                    const st = profile.store;
                    setStoreSlug(st.slug || "");
                    setForm({
                        name: st.name || "",
                        tagline: st.tagline || "",
                        description: st.description || "",
                        logo: st.logo || "",
                        banner: st.banner || "",
                        contactPhone: st.contactPhone || profile.seller?.contactPhone || "",
                        contactEmail: st.contactEmail || profile.seller?.contactEmail || "",
                        street: st.pickupAddress?.street || "",
                        city: st.pickupAddress?.city || "",
                        state: st.pickupAddress?.state || "",
                        pincode: st.pickupAddress?.pincode || "",
                        supportsSellerDelivery: st.deliveryOptions?.supportsSellerDelivery ?? true,
                        supportsPlatformDelivery: st.deliveryOptions?.supportsPlatformDelivery ?? true,
                        estimatedDeliveryDays: st.deliveryOptions?.estimatedDeliveryDays ?? 3,
                        freeDeliveryAbove: st.deliveryOptions?.freeDeliveryAbove ?? 999,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch store profile:", err);
                setFeedback({ type: "error", message: "Failed to load store settings." });
            } finally {
                setLoading(false);
            }
        };

        fetchStoreProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);

        try {
            const payload = {
                name: form.name.trim(),
                tagline: form.tagline.trim(),
                description: form.description.trim(),
                logo: form.logo.trim() || undefined,
                banner: form.banner.trim() || undefined,
                contactPhone: form.contactPhone.trim(),
                contactEmail: form.contactEmail.trim(),
                pickupAddress: {
                    street: form.street.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    pincode: form.pincode.trim(),
                },
                deliveryOptions: {
                    supportsSellerDelivery: form.supportsSellerDelivery,
                    supportsPlatformDelivery: form.supportsPlatformDelivery,
                    estimatedDeliveryDays: Number(form.estimatedDeliveryDays) || 3,
                    freeDeliveryAbove: Number(form.freeDeliveryAbove) || 0,
                },
            };

            await SellerService.updateStore(payload);
            setFeedback({ type: "success", message: "Store profile and delivery settings updated successfully!" });
        } catch (err) {
            console.error("Failed to update store:", err);
            setFeedback({ type: "error", message: "Failed to update store profile. Please verify your inputs." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="store-profile-loading">
                <div className="spinner"></div>
                <p>Loading store profile...</p>
            </div>
        );
    }

    return (
        <div className="seller-store-profile-page">
            <div className="store-profile-header">
                <div>
                    <h2>Store Profile & Settings</h2>
                    <p>Customize your public marketplace storefront, branding, pickup address, and fulfillment options.</p>
                </div>
                {storeSlug && (
                    <Link
                        to={`/stores/${storeSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-live-store-cta"
                    >
                        <FiExternalLink /> View Live Storefront
                    </Link>
                )}
            </div>

            {feedback && (
                <div className={`feedback-alert ${feedback.type}`}>
                    {feedback.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                    <span>{feedback.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="store-settings-form">
                {/* Section 1: Storefront Branding */}
                <div className="settings-card">
                    <div className="card-header-icon">
                        <FiHome />
                        <h3>Store Branding & Identity</h3>
                    </div>

                    <div className="form-group">
                        <label>Store Display Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Apex Electronics Hub"
                        />
                    </div>

                    <div className="form-group">
                        <label>Tagline / Short Pitch</label>
                        <input
                            type="text"
                            name="tagline"
                            value={form.tagline}
                            onChange={handleChange}
                            placeholder="e.g. Authorized Sony, Dell & Apple Premium Retailer"
                        />
                    </div>

                    <div className="form-group">
                        <label>About Your Store</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Tell customers about your warranty policy, technical expertise, and product range..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Store Logo URL</label>
                            <input
                                type="url"
                                name="logo"
                                value={form.logo}
                                onChange={handleChange}
                                placeholder="https://images.unsplash.com/... or logo URL"
                            />
                        </div>
                        <div className="form-group">
                            <label>Store Banner URL</label>
                            <input
                                type="url"
                                name="banner"
                                value={form.banner}
                                onChange={handleChange}
                                placeholder="https://images.unsplash.com/... or banner URL"
                            />
                        </div>
                    </div>

                    {/* Visual Banner Preview */}
                    <div className="banner-preview-box" style={{ backgroundImage: form.banner ? `url(${form.banner})` : undefined }}>
                        <div className="logo-preview-box">
                            {form.logo ? (
                                <img src={form.logo} alt="Store logo" />
                            ) : (
                                <FiHome />
                            )}
                        </div>
                        <div className="banner-preview-text">
                            <h4>{form.name || "Your Store Name"}</h4>
                            <p>{form.tagline || "Your store tagline will appear here"}</p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact Information */}
                <div className="settings-card">
                    <div className="card-header-icon">
                        <FiPhone />
                        <h3>Customer Support & Contact</h3>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Support Phone Number</label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={form.contactPhone}
                                onChange={handleChange}
                                placeholder="e.g. +91 98765 43210"
                            />
                        </div>

                        <div className="form-group">
                            <label>Support Email Address</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={form.contactEmail}
                                onChange={handleChange}
                                placeholder="e.g. support@mystore.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Pickup & Dispatch Address */}
                <div className="settings-card">
                    <div className="card-header-icon">
                        <FiMapPin />
                        <h3>Warehouse / Pickup Address</h3>
                    </div>
                    <p className="card-helper-text">
                        Logistics couriers and pickup vans will dispatch customer orders from this address.
                    </p>

                    <div className="form-group">
                        <label>Street Address / Unit</label>
                        <input
                            type="text"
                            name="street"
                            value={form.street}
                            onChange={handleChange}
                            placeholder="e.g. Shop 14, Brigade Towers, MG Road"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="e.g. Bengaluru"
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                placeholder="e.g. Karnataka"
                            />
                        </div>
                        <div className="form-group">
                            <label>PIN Code (6 Digits)</label>
                            <input
                                type="text"
                                name="pincode"
                                maxLength="6"
                                value={form.pincode}
                                onChange={handleChange}
                                placeholder="560001"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Fulfillment & Shipping Rules */}
                <div className="settings-card">
                    <div className="card-header-icon">
                        <FiTruck />
                        <h3>Fulfillment & Delivery Preferences</h3>
                    </div>

                    <div className="delivery-checkbox-group">
                        <label className="pref-checkbox">
                            <input
                                type="checkbox"
                                name="supportsSellerDelivery"
                                checked={form.supportsSellerDelivery}
                                onChange={handleChange}
                            />
                            <div>
                                <strong>Seller-Handled Delivery</strong>
                                <span>You package and ship directly via your preferred courier partners (Blue Dart, DTDC, Delhivery).</span>
                            </div>
                        </label>

                        <label className="pref-checkbox">
                            <input
                                type="checkbox"
                                name="supportsPlatformDelivery"
                                checked={form.supportsPlatformDelivery}
                                onChange={handleChange}
                            />
                            <div>
                                <strong>ElectroNova Logistics Delivery</strong>
                                <span>Platform-arranged carrier pickups and end-to-end tracking managed by ElectroNova.</span>
                            </div>
                        </label>
                    </div>

                    <div className="form-row" style={{ marginTop: "16px" }}>
                        <div className="form-group">
                            <label>Estimated Delivery Time (Days)</label>
                            <input
                                type="number"
                                name="estimatedDeliveryDays"
                                min="1"
                                max="14"
                                value={form.estimatedDeliveryDays}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Free Delivery Threshold (₹)</label>
                            <input
                                type="number"
                                name="freeDeliveryAbove"
                                min="0"
                                value={form.freeDeliveryAbove}
                                onChange={handleChange}
                                placeholder="e.g. 999"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="save-action-bar">
                    <button
                        type="submit"
                        className="btn-save-settings"
                        disabled={saving}
                    >
                        <FiSave /> {saving ? "Saving Store Profile..." : "Save Store Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SellerStoreProfile;
