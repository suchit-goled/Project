import React, { useState, useEffect, useCallback } from "react";
import {
    FiPackage,
    FiSearch,
    FiTruck,
    FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import SellerService from "../../services/seller.service";
import "./SellerOrders.css";

const STATUS_OPTIONS = [
    "all",
    "Pending",
    "Confirmed",
    "Processing",
    "Packed",
    "Dispatched",
    "Delivered",
    "Cancelled",
];

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    // Modal state for updating fulfillment status
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [updating, setUpdating] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 15,
                status: statusFilter,
            };
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            const data = await SellerService.getOrders(params);
            if (data) {
                setOrders(data.orders || []);
                setTotalPages(data.totalPages || 1);
                setTotalOrders(data.total || 0);
            }
        } catch (err) {
            console.error("Failed to load seller orders:", err);
            toast.error("Failed to load seller orders");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchQuery]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleOpenStatusModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus);
        setTrackingNumber(order.trackingNumber || "");
        setCarrier(order.carrier || "Blue Dart");
        setStatusNote("");
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    const handleUpdateStatusSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;

        try {
            setUpdating(true);
            await SellerService.updateOrderStatus(selectedOrder._id, {
                status: newStatus,
                trackingNumber: trackingNumber.trim(),
                carrier: carrier.trim(),
                note: statusNote.trim() || `Status updated to ${newStatus} by seller.`,
            });

            toast.success(`Order ${selectedOrder.sellerOrderNumber} marked as ${newStatus}`);
            handleCloseModal();
            fetchOrders();
        } catch (err) {
            console.error("Update status error:", err);
            const msg = err.response?.data?.message || "Failed to update order status";
            toast.error(msg);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="seller-orders-view">
            {/* Header */}
            <div className="orders-page-header">
                <div>
                    <h2>Seller Sub-Orders & Fulfillment</h2>
                    <p>Fulfill items purchased by customers for your store. Update dispatch status and tracking.</p>
                </div>
                <div className="orders-count-pill">
                    <FiPackage /> {totalOrders} Sub-Orders
                </div>
            </div>

            {/* Filter Controls */}
            <div className="orders-controls-card">
                <div className="orders-search-input-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search by Sub-Order # or Parent Order #..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="status-tabs-row">
                    {STATUS_OPTIONS.map((st) => (
                        <button
                            key={st}
                            className={`status-tab-btn ${statusFilter === st ? "active" : ""}`}
                            onClick={() => {
                                setStatusFilter(st);
                                setPage(1);
                            }}
                        >
                            {st === "all" ? "All Orders" : st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="orders-loading-state">
                    <p>Loading your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="orders-empty-state">
                    <FiPackage size={44} />
                    <h3>No sub-orders found</h3>
                    <p>No orders matched your search or status filter.</p>
                </div>
            ) : (
                <div className="orders-table-wrapper">
                    <table className="seller-orders-table">
                        <thead>
                            <tr>
                                <th>Sub-Order #</th>
                                <th>Parent ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Gross Sales</th>
                                <th>Commission</th>
                                <th>Net Earnings</th>
                                <th>Delivery Mode</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((ord) => (
                                <tr key={ord._id}>
                                    <td className="order-number-cell">
                                        <strong>{ord.sellerOrderNumber}</strong>
                                        <small>
                                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </small>
                                    </td>
                                    <td className="parent-order-cell">
                                        {ord.parentOrderNumber || "—"}
                                    </td>
                                    <td>
                                        <div className="customer-info-cell">
                                            <span>{ord.customerId?.name || "Verified Customer"}</span>
                                            <small>{ord.customerId?.email || ""}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="items-summary-list">
                                            {ord.products?.map((item, i) => (
                                                <div key={i} className="item-summary-line">
                                                    <span>{item.quantity}&times;</span> {item.title}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="price-cell">₹{(ord.subtotal || 0).toLocaleString()}</td>
                                    <td className="commission-cell">
                                        -₹{(ord.commissionAmount || 0).toLocaleString()}
                                        <small>({ord.commissionRate || 5}%)</small>
                                    </td>
                                    <td className="earnings-cell">
                                        ₹{(ord.sellerEarnings || 0).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`delivery-method-pill ${ord.deliveryMethod === "platform" ? "platform" : "seller"}`}>
                                            <FiTruck /> {ord.deliveryMethod === "platform" ? "Platform Fulfilled" : "Seller Handled"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`seller-status-badge status-${ord.orderStatus?.toLowerCase()}`}>
                                            {ord.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="update-status-trigger-btn"
                                            onClick={() => handleOpenStatusModal(ord)}
                                        >
                                            Update Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="orders-pagination-row">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="page-btn"
                    >
                        Previous
                    </button>
                    <span className="page-indicator">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        className="page-btn"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Status Update Modal */}
            {selectedOrder && (
                <div className="seller-modal-backdrop" onClick={handleCloseModal}>
                    <div className="seller-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Update Fulfillment Status</h3>
                                <p>Sub-Order: <strong>{selectedOrder.sellerOrderNumber}</strong></p>
                            </div>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatusSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Fulfillment Status *</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                >
                                    <option value="Confirmed">Confirmed (Accepted)</option>
                                    <option value="Processing">Processing (Gathering Stock)</option>
                                    <option value="Packed">Packed (Ready for Dispatch)</option>
                                    <option value="Dispatched">Dispatched (Handed to Courier)</option>
                                    <option value="Delivered">Delivered (Completed)</option>
                                    <option value="Cancelled">Cancelled (Out of Stock / Rejected)</option>
                                </select>
                            </div>

                            {(newStatus === "Packed" || newStatus === "Dispatched") && (
                                <>
                                    <div className="form-group">
                                        <label>Logistics Carrier Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Blue Dart, Delhivery, DTDC, Local Rider"
                                            value={carrier}
                                            onChange={(e) => setCarrier(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Tracking / AWB Number</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. BD-984210984"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Status Update Note (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Shipped with tamper-proof packaging"
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions-row">
                                <button
                                    type="submit"
                                    className="modal-submit-btn"
                                    disabled={updating}
                                >
                                    {updating ? "Saving Update..." : "Confirm Status Update"}
                                </button>
                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
