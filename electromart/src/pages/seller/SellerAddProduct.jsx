import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiPlus,
    FiTrash2,
    FiImage,
    FiAlertCircle,
    FiTruck,
    FiDollarSign,
    FiLayers,
    FiTag,
} from "react-icons/fi";
import SellerService from "../../services/seller.service";
import "./SellerAddProduct.css";

const CATEGORIES = [
    "Smartphones",
    "Laptops",
    "Desktops",
    "Tablets",
    "Smartwatches",
    "Headphones",
    "Speakers",
    "Cameras",
    "Gaming Accessories",
    "Computer Accessories",
    "Home Electronics",
    "Mobile Accessories",
];

const SellerAddProduct = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        product_title: "",
        product_category: "Smartphones",
        brand: "",
        sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discounted_price: "",
        original_price: "",
        stock: 10,
        product_image_url: "",
        additionalImages: [""],
        specifications: [
            { key: "Warranty", value: "1 Year Manufacturer Warranty" },
            { key: "Color", value: "" },
        ],
        supportsSellerDelivery: true,
        supportsPlatformDelivery: true,
        estimatedDeliveryDays: 3,
    });

    // Calculate discount percentage
    const sellingPrice = Number(form.discounted_price) || 0;
    const origPrice = Number(form.original_price) || sellingPrice;
    const discountPct = origPrice > sellingPrice && sellingPrice > 0
        ? Math.round(((origPrice - sellingPrice) / origPrice) * 100)
        : 0;

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Spec key-value handlers
    const handleSpecChange = (index, field, val) => {
        setForm((prev) => {
            const nextSpecs = [...prev.specifications];
            nextSpecs[index][field] = val;
            return { ...prev, specifications: nextSpecs };
        });
    };

    const addSpec = () => {
        setForm((prev) => ({
            ...prev,
            specifications: [...prev.specifications, { key: "", value: "" }],
        }));
    };

    const removeSpec = (index) => {
        setForm((prev) => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index),
        }));
    };

    // Extra image handlers
    const handleExtraImageChange = (index, val) => {
        setForm((prev) => {
            const nextImages = [...prev.additionalImages];
            nextImages[index] = val;
            return { ...prev, additionalImages: nextImages };
        });
    };

    const addImageInput = () => {
        setForm((prev) => ({
            ...prev,
            additionalImages: [...prev.additionalImages, ""],
        }));
    };

    const removeImageInput = (index) => {
        setForm((prev) => ({
            ...prev,
            additionalImages: prev.additionalImages.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.product_title.trim()) {
            setError("Product title is required.");
            return;
        }

        if (sellingPrice <= 0) {
            setError("Please enter a valid positive selling price.");
            return;
        }

        // Clean images
        const allImages = [
            form.product_image_url.trim(),
            ...form.additionalImages.map((img) => img.trim()).filter(Boolean),
        ].filter(Boolean);

        const primaryImage = allImages[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80";

        // Filter valid specs
        const validSpecs = form.specifications.filter(
            (s) => s.key && s.key.trim() && s.value && s.value.trim()
        );

        const payload = {
            product_title: form.product_title.trim(),
            product_category: form.product_category,
            brand: form.brand.trim() || undefined,
            sku: form.sku.trim(),
            discounted_price: sellingPrice,
            original_price: origPrice,
            stock: Number(form.stock) || 0,
            product_image_url: primaryImage,
            images: allImages.length > 0 ? allImages : [primaryImage],
            specifications: validSpecs,
            deliveryOptions: {
                supportsSellerDelivery: form.supportsSellerDelivery,
                supportsPlatformDelivery: form.supportsPlatformDelivery,
                estimatedDeliveryDays: Number(form.estimatedDeliveryDays) || 3,
            },
        };

        setSubmitting(true);
        try {
            const res = await SellerService.createProduct(payload);
            if (res.success) {
                navigate("/seller/products");
            } else {
                setError(res.message || "Failed to create product listing.");
            }
        } catch (err) {
            console.error("Create product failed:", err);
            setError(err.response?.data?.message || "Failed to create product listing. Please check inputs.");
        } finally {
            setSubmitting(false);
        }
    };

    const previewImg = form.product_image_url.trim() || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";

    return (
        <div className="seller-add-product-page">
            <div className="add-product-header">
                <Link to="/seller/products" className="back-link">
                    <FiArrowLeft /> Back to My Products
                </Link>
                <h2>List a New Product</h2>
                <p>Add your electronic device or accessory to the ElectroNova multi-vendor marketplace.</p>
            </div>

            {error && (
                <div className="form-alert-error">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            <div className="add-product-grid">
                {/* Main Form Form */}
                <form onSubmit={handleSubmit} className="product-form-container">
                    {/* Section 1: Basic Information */}
                    <div className="form-card">
                        <div className="card-heading">
                            <FiLayers />
                            <h3>Basic Information</h3>
                        </div>

                        <div className="form-group">
                            <label>Product Title *</label>
                            <input
                                type="text"
                                name="product_title"
                                required
                                placeholder="e.g. Apple MacBook Air M3 (13.6-inch, 16GB Unified Memory, 512GB SSD) - Space Gray"
                                value={form.product_title}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="product_category"
                                    value={form.product_category}
                                    onChange={handleFormChange}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    placeholder="e.g. Apple, Sony, Samsung, Dell"
                                    value={form.brand}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>SKU / Model Number</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={form.sku}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Pricing & Inventory */}
                    <div className="form-card">
                        <div className="card-heading">
                            <FiDollarSign />
                            <h3>Pricing & Stock Inventory</h3>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    name="discounted_price"
                                    min="1"
                                    required
                                    placeholder="e.g. 114900"
                                    value={form.discounted_price}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Original MRP (₹)</label>
                                <input
                                    type="number"
                                    name="original_price"
                                    min="1"
                                    placeholder="e.g. 134900"
                                    value={form.original_price}
                                    onChange={handleFormChange}
                                />
                                {discountPct > 0 && (
                                    <span className="discount-calc-pill">
                                        {discountPct}% OFF
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Available Stock Units *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    min="0"
                                    required
                                    value={form.stock}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Product Media */}
                    <div className="form-card">
                        <div className="card-heading">
                            <FiImage />
                            <h3>Product Imagery</h3>
                        </div>

                        <div className="form-group">
                            <label>Primary Image URL *</label>
                            <input
                                type="url"
                                name="product_image_url"
                                placeholder="https://images.unsplash.com/... or image link"
                                value={form.product_image_url}
                                onChange={handleFormChange}
                            />
                            <small className="field-hint">Paste a high-resolution direct web image URL.</small>
                        </div>

                        <div className="additional-images-block">
                            <label>Additional Gallery Images</label>
                            {form.additionalImages.map((imgUrl, idx) => (
                                <div key={idx} className="extra-image-row">
                                    <input
                                        type="url"
                                        placeholder={`Image ${idx + 2} URL`}
                                        value={imgUrl}
                                        onChange={(e) => handleExtraImageChange(idx, e.target.value)}
                                    />
                                    {form.additionalImages.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-spec-btn"
                                            onClick={() => removeImageInput(idx)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="add-row-btn"
                                onClick={addImageInput}
                            >
                                <FiPlus /> Add Another Photo URL
                            </button>
                        </div>
                    </div>

                    {/* Section 4: Specifications */}
                    <div className="form-card">
                        <div className="card-heading">
                            <FiTag />
                            <h3>Technical Specifications</h3>
                        </div>

                        <div className="specs-list">
                            {form.specifications.map((spec, idx) => (
                                <div key={idx} className="spec-input-row">
                                    <input
                                        type="text"
                                        placeholder="Feature / Key (e.g. RAM, Storage)"
                                        value={spec.key}
                                        onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (e.g. 16GB DDR5)"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="remove-spec-btn"
                                        onClick={() => removeSpec(idx)}
                                        title="Remove specification"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                className="add-row-btn"
                                onClick={addSpec}
                            >
                                <FiPlus /> Add Specification
                            </button>
                        </div>
                    </div>

                    {/* Section 5: Delivery & Fulfillment */}
                    <div className="form-card">
                        <div className="card-heading">
                            <FiTruck />
                            <h3>Fulfillment & Delivery</h3>
                        </div>

                        <div className="checkbox-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="supportsSellerDelivery"
                                    checked={form.supportsSellerDelivery}
                                    onChange={handleFormChange}
                                />
                                <span>Seller-Handled Delivery (Direct courier/local fleet)</span>
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="supportsPlatformDelivery"
                                    checked={form.supportsPlatformDelivery}
                                    onChange={handleFormChange}
                                />
                                <span>ElectroNova Logistics (Platform-Arranged Delivery)</span>
                            </label>
                        </div>

                        <div className="form-group" style={{ marginTop: "14px" }}>
                            <label>Estimated Delivery Time (Business Days)</label>
                            <input
                                type="number"
                                name="estimatedDeliveryDays"
                                min="1"
                                max="14"
                                value={form.estimatedDeliveryDays}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="submit-action-bar">
                        <Link to="/seller/products" className="btn-cancel">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn-submit-product"
                            disabled={submitting}
                        >
                            {submitting ? "Publishing Listing..." : "Publish to ElectroNova"}
                        </button>
                    </div>
                </form>

                {/* Live Marketplace Preview Card */}
                <div className="preview-container">
                    <div className="preview-sticky-card">
                        <div className="preview-tag">Live Marketplace Preview</div>
                        <div className="preview-card-body">
                            <div className="preview-image-box">
                                <img
                                    src={previewImg}
                                    alt="Product Preview"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";
                                    }}
                                />
                                {discountPct > 0 && (
                                    <span className="preview-discount-badge">{discountPct}% OFF</span>
                                )}
                            </div>
                            <div className="preview-content">
                                <span className="preview-category">{form.product_category}</span>
                                <h4 className="preview-title">
                                    {form.product_title || "Product Title will appear here"}
                                </h4>
                                {form.brand && (
                                    <span className="preview-brand">by {form.brand}</span>
                                )}
                                <div className="preview-pricing">
                                    <strong className="preview-selling-price">
                                        ₹{(sellingPrice || 0).toLocaleString("en-IN")}
                                    </strong>
                                    {origPrice > sellingPrice && (
                                        <span className="preview-orig-price">
                                            ₹{(origPrice).toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </div>
                                <div className="preview-delivery">
                                    <FiTruck />
                                    <span>
                                        Delivery in {form.estimatedDeliveryDays || 3} days
                                    </span>
                                </div>
                                <div className="preview-stock-info">
                                    <span className={`stock-indicator ${form.stock > 0 ? "in" : "out"}`}>
                                        {form.stock > 0 ? `In Stock (${form.stock} available)` : "Out of Stock"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerAddProduct;
