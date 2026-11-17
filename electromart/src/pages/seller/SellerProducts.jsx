import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiExternalLink,
    FiAlertTriangle,
    FiCheckCircle,
    FiBox,
    FiRefreshCw,
    FiFilter,
} from "react-icons/fi";
import SellerService from "../../services/seller.service";
import "./SellerProducts.css";

const SellerProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null, deleting: false });
    const [editModal, setEditModal] = useState({ isOpen: false, product: null, saving: false, form: {} });
    const [feedback, setFeedback] = useState(null);

    const categories = [
        "all",
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

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await SellerService.getProducts({
                page,
                limit: 12,
                search: searchTerm.trim() || undefined,
                category: selectedCategory !== "all" ? selectedCategory : undefined,
                status: selectedStatus !== "all" ? selectedStatus : undefined,
            });

            if (data) {
                setProducts(data.products || []);
                setTotalCount(data.total || 0);
                setTotalPages(data.pages || 1);
            }
        } catch (err) {
            console.error("Failed to load seller products:", err);
            setFeedback({ type: "error", message: "Failed to load products. Please try again." });
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, selectedCategory, selectedStatus]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const handleDeleteClick = (product) => {
        setDeleteModal({ isOpen: true, product, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteModal.product) return;
        setDeleteModal((prev) => ({ ...prev, deleting: true }));
        try {
            await SellerService.deleteProduct(deleteModal.product._id);
            setFeedback({ type: "success", message: `"${deleteModal.product.product_title}" removed from catalog.` });
            setDeleteModal({ isOpen: false, product: null, deleting: false });
            fetchProducts();
        } catch (err) {
            console.error("Delete product error:", err);
            setFeedback({ type: "error", message: "Failed to delete product listing." });
            setDeleteModal((prev) => ({ ...prev, deleting: false }));
        }
    };

    const handleEditClick = (product) => {
        setEditModal({
            isOpen: true,
            product,
            saving: false,
            form: {
                title: product.product_title,
                price: product.discounted_price,
                original_price: product.original_price,
                stock: product.stock,
                category: product.product_category,
                brand: product.brand || "",
                sku: product.sku || "",
            },
        });
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setEditModal((prev) => ({ ...prev, saving: true }));
        try {
            await SellerService.updateProduct(editModal.product._id, {
                product_title: editModal.form.title,
                discounted_price: Number(editModal.form.price),
                original_price: Number(editModal.form.original_price),
                stock: Number(editModal.form.stock),
                product_category: editModal.form.category,
                brand: editModal.form.brand,
                sku: editModal.form.sku,
            });
            setFeedback({ type: "success", message: "Product details updated successfully." });
            setEditModal({ isOpen: false, product: null, saving: false, form: {} });
            fetchProducts();
        } catch (err) {
            console.error("Update product error:", err);
            setFeedback({ type: "error", message: "Failed to update product details." });
            setEditModal((prev) => ({ ...prev, saving: false }));
        }
    };

    // Derived summary counters
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    return (
        <div className="seller-products-page">
            {/* Header & Quick Stats */}
            <div className="seller-products-header">
                <div>
                    <h2>My Product Catalog</h2>
                    <p>Manage your product inventory, pricing, listings, and stock levels.</p>
                </div>
                <div className="header-actions">
                    <button
                        className="refresh-btn"
                        onClick={fetchProducts}
                        title="Refresh catalog"
                        disabled={loading}
                    >
                        <FiRefreshCw className={loading ? "spin" : ""} />
                    </button>
                    <Link to="/seller/products/new" className="add-product-cta">
                        <FiPlus /> Add New Product
                    </Link>
                </div>
            </div>

            {/* Top Metric Pills */}
            <div className="products-summary-strip">
                <div className="summary-pill">
                    <div className="pill-icon total"><FiBox /></div>
                    <div>
                        <span className="pill-label">Total Listings</span>
                        <strong className="pill-val">{totalCount}</strong>
                    </div>
                </div>
                <div className="summary-pill">
                    <div className="pill-icon warning"><FiAlertTriangle /></div>
                    <div>
                        <span className="pill-label">Low Stock (≤5)</span>
                        <strong className="pill-val">{lowStockCount}</strong>
                    </div>
                </div>
                <div className="summary-pill">
                    <div className="pill-icon danger"><FiBox /></div>
                    <div>
                        <span className="pill-label">Out of Stock</span>
                        <strong className="pill-val">{outOfStockCount}</strong>
                    </div>
                </div>
            </div>

            {feedback && (
                <div className={`feedback-alert ${feedback.type}`}>
                    {feedback.type === "success" ? <FiCheckCircle /> : <FiAlertTriangle />}
                    <span>{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} className="dismiss-btn">×</button>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="products-control-bar">
                <form className="search-box" onSubmit={handleSearchSubmit}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by title, brand, SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => {
                                setSearchTerm("");
                                setPage(1);
                            }}
                        >
                            ×
                        </button>
                    )}
                </form>

                <div className="filters-group">
                    <div className="filter-item">
                        <FiFilter className="filter-icon" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Categories</option>
                            {categories.filter((c) => c !== "all").map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending Approval</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="products-table-card">
                {loading ? (
                    <div className="table-loading">
                        <div className="spinner"></div>
                        <p>Loading your products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="table-empty">
                        <FiBox className="empty-icon" />
                        <h3>No products found</h3>
                        <p>
                            {searchTerm || selectedCategory !== "all"
                                ? "No items match your filter criteria."
                                : "You haven't listed any products in your store yet."}
                        </p>
                        <Link to="/seller/products/new" className="add-product-cta">
                            <FiPlus /> Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="seller-data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category & Brand</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item) => {
                                    const img = item.product_image_url || (Array.isArray(item.images) && item.images[0]) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80";
                                    const isLow = item.stock > 0 && item.stock <= 5;
                                    const isOut = item.stock === 0;

                                    return (
                                        <tr key={item._id}>
                                            <td className="product-col">
                                                <img src={img} alt={item.product_title} className="prod-thumb" />
                                                <div className="prod-info">
                                                    <span className="prod-title" title={item.product_title}>
                                                        {item.product_title}
                                                    </span>
                                                    <span className="prod-sku">SKU: {item.sku || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="category-brand">
                                                    <span className="cat-badge">{item.product_category || "General"}</span>
                                                    <span className="brand-name">{item.brand || "—"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="price-block">
                                                    <strong className="selling-price">
                                                        ₹{(item.discounted_price || 0).toLocaleString("en-IN")}
                                                    </strong>
                                                    {item.original_price > item.discounted_price && (
                                                        <span className="orig-price">
                                                            ₹{(item.original_price).toLocaleString("en-IN")}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="stock-cell">
                                                    <span className={`stock-badge ${isOut ? "out" : isLow ? "low" : "normal"}`}>
                                                        {isOut ? "Out of Stock" : `${item.stock} in stock`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${item.approvalStatus || "approved"}`}>
                                                    {item.approvalStatus === "approved" ? "Active" : item.approvalStatus || "Active"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Link
                                                        to={`/products/${item._id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="action-btn view"
                                                        title="View on Marketplace"
                                                    >
                                                        <FiExternalLink />
                                                    </Link>
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => handleEditClick(item)}
                                                        title="Quick Edit"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteClick(item)}
                                                        title="Delete Listing"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="table-pagination">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="page-nav-btn"
                        >
                            Previous
                        </button>
                        <span className="page-indicator">
                            Page {page} of {totalPages} ({totalCount} items)
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="page-nav-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Edit Modal */}
            {editModal.isOpen && (
                <div className="seller-modal-overlay">
                    <div className="seller-modal-dialog">
                        <div className="modal-header">
                            <h3>Edit Product Listing</h3>
                            <button
                                onClick={() => setEditModal({ isOpen: false, product: null, saving: false, form: {} })}
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleEditSave} className="modal-form">
                            <div className="form-group">
                                <label>Product Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editModal.form.title || ""}
                                    onChange={(e) => setEditModal({
                                        ...editModal,
                                        form: { ...editModal.form, title: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Selling Price (₹)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={editModal.form.price || ""}
                                        onChange={(e) => setEditModal({
                                            ...editModal,
                                            form: { ...editModal.form, price: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Original MRP (₹)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editModal.form.original_price || ""}
                                        onChange={(e) => setEditModal({
                                            ...editModal,
                                            form: { ...editModal.form, original_price: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={editModal.form.stock ?? ""}
                                        onChange={(e) => setEditModal({
                                            ...editModal,
                                            form: { ...editModal.form, stock: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={editModal.form.category || ""}
                                        onChange={(e) => setEditModal({
                                            ...editModal,
                                            form: { ...editModal.form, category: e.target.value }
                                        })}
                                    >
                                        {categories.filter((c) => c !== "all").map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        value={editModal.form.brand || ""}
                                        onChange={(e) => setEditModal({
                                            ...editModal,
                                            form: { ...editModal.form, brand: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setEditModal({ isOpen: false, product: null, saving: false, form: {} })}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={editModal.saving}
                                >
                                    {editModal.saving ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {deleteModal.isOpen && (
                <div className="seller-modal-overlay">
                    <div className="seller-modal-dialog delete-confirm">
                        <div className="delete-icon-wrapper">
                            <FiTrash2 />
                        </div>
                        <h3>Delete Product Listing?</h3>
                        <p>
                            Are you sure you want to remove <strong>"{deleteModal.product?.product_title}"</strong> from ElectroNova? This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setDeleteModal({ isOpen: false, product: null, deleting: false })}
                            >
                                Keep Listing
                            </button>
                            <button
                                className="btn-danger"
                                onClick={confirmDelete}
                                disabled={deleteModal.deleting}
                            >
                                {deleteModal.deleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerProducts;
