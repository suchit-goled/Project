import mongoose from "mongoose";
import Seller from "../models/seller.model.js";
import Store from "../models/store.model.js";
import User from "../models/user.model.js";
import Product from "../models/Product.js";
import SellerOrder from "../models/sellerOrder.model.js";
import orderModel from "../models/order.model.js";
import Payout from "../models/payout.model.js";
import AuditLog from "../models/auditLog.model.js";
import shipmentService from "../services/shipment.service.js";

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        + "-" + Math.random().toString(36).substring(2, 6);
};

export const sellerRepository = {
    // Check existing registration
    async getSellerByUserId(userId) {
        return Seller.findOne({ userId });
    },

    async getStoreBySellerUserId(userId) {
        return Store.findOne({ sellerId: userId });
    },

    // Register a new seller & create store
    async registerSeller({ userId, sellerData, storeData }) {
        let seller = await Seller.findOne({ userId });

        if (seller) {
            // Update existing profile
            Object.assign(seller, sellerData);
            await seller.save();
        } else {
            // Create new seller profile
            seller = await Seller.create({
                userId,
                ...sellerData,
                status: "approved", // Auto-approve demo / sandbox sellers
                isVerified: true,
                approvedAt: new Date(),
            });
        }

        // Find or create store
        let store = await Store.findOne({
            $or: [{ sellerId: userId }, { sellerProfileId: seller._id }]
        });

        if (store) {
            Object.assign(store, storeData);
            await store.save();
        } else {
            const rawName = storeData.name || sellerData.displayName || "ElectroNova Partner Store";
            const slug = generateSlug(rawName);

            store = await Store.create({
                sellerId: userId,
                sellerProfileId: seller._id,
                name: rawName,
                slug,
                description: storeData.description || "Certified electronics seller on ElectroNova.",
                tagline: storeData.tagline || "Official Electronics Merchant",
                logo: storeData.logo || "",
                banner: storeData.banner || "",
                pickupAddress: storeData.pickupAddress || sellerData.businessAddress || {},
                deliveryOptions: storeData.deliveryOptions || {
                    supportsSellerDelivery: true,
                    supportsPlatformDelivery: true,
                },
                isActive: true,
            });
        }

        // Update User role and seller profile reference
        await User.findByIdAndUpdate(userId, {
            role: "seller",
            sellerStatus: "approved",
            sellerProfile: seller._id,
        });

        // Audit Log
        try {
            await AuditLog.create({
                action: "SELLER_REGISTER",
                actor: {
                    userId,
                    role: "seller",
                },
                target: {
                    model: "Seller",
                    id: seller._id,
                },
                details: { storeId: store._id, storeName: store.name },
            });
        } catch {
            // Non-critical audit failure
        }

        return { seller, store };
    },

    // Dashboard metrics
    async getDashboardMetrics(sellerUserId, storeId) {
        const productFilter = { sellerId: sellerUserId };

        const [totalProducts, activeProducts, lowStockProducts] = await Promise.all([
            Product.countDocuments(productFilter),
            Product.countDocuments({ ...productFilter, stock: { $gt: 0 }, approvalStatus: { $ne: "rejected" } }),
            Product.countDocuments({ ...productFilter, stock: { $lte: 5 } }),
        ]);

        const sellerOrders = await SellerOrder.find({ sellerId: sellerUserId }).sort({ createdAt: -1 });

        const totalOrders = sellerOrders.length;
        let pendingOrders = 0;
        let completedOrders = 0;
        let grossSales = 0;
        let commissionDeducted = 0;
        let availableEarnings = 0;

        for (const o of sellerOrders) {
            const st = o.orderStatus;
            if (["Pending", "Confirmed", "Processing", "Packed"].includes(st)) {
                pendingOrders++;
            }
            if (st === "Delivered") {
                completedOrders++;
            }
            if (st !== "Cancelled") {
                grossSales += (o.subtotal || 0);
                commissionDeducted += (o.commissionAmount || 0);
                availableEarnings += (o.sellerEarnings || 0);
            }
        }

        const recentOrders = sellerOrders.slice(0, 5);

        return {
            totalProducts,
            activeProducts,
            lowStockProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            grossSales,
            commissionDeducted,
            availableEarnings,
            recentOrders,
        };
    },

    // Seller Orders List with Tenant Isolation
    async getSellerOrders(sellerUserId, { status, search, page = 1, limit = 15 }) {
        const filter = { sellerId: sellerUserId };

        if (status && status !== "all") {
            filter.orderStatus = status;
        }

        if (search && search.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { sellerOrderNumber: { $regex: escaped, $options: "i" } },
                { parentOrderNumber: { $regex: escaped, $options: "i" } },
            ];
        }

        const validPage = Math.max(1, Number(page) || 1);
        const validLimit = Math.max(1, Math.min(100, Number(limit) || 15));

        const total = await SellerOrder.countDocuments(filter);
        const orders = await SellerOrder.find(filter)
            .sort({ createdAt: -1 })
            .skip((validPage - 1) * validLimit)
            .limit(validLimit)
            .populate("customerId", "name email mobile");

        return {
            orders,
            total,
            page: validPage,
            totalPages: Math.ceil(total / validLimit) || 1,
        };
    },

    // Single Sub-Order Details with Strict Tenant Isolation
    async getSellerOrderById(sellerOrderId, sellerUserId) {
        if (!mongoose.isValidObjectId(sellerOrderId)) return null;

        return SellerOrder.findOne({
            _id: sellerOrderId,
            sellerId: sellerUserId,
        }).populate("customerId", "name email mobile");
    },

    // Update Status with Fulfillment Timeline and Shipment Auto-Sync
    async updateSellerOrderStatus(sellerOrderId, sellerUserId, newStatus, { note, trackingNumber, carrier } = {}) {
        if (!mongoose.isValidObjectId(sellerOrderId)) return null;

        const order = await SellerOrder.findOne({
            _id: sellerOrderId,
            sellerId: sellerUserId,
        });

        if (!order) return null;

        order.orderStatus = newStatus;
        if (!Array.isArray(order.shipmentTimeline)) {
            order.shipmentTimeline = [];
        }

        order.shipmentTimeline.push({
            status: newStatus,
            timestamp: new Date(),
            note: note || `Order status updated to ${newStatus} by seller.`,
        });

        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (carrier) {
            order.courierPartner = carrier;
            order.carrier = carrier;
        }
        if (newStatus === "Delivered") {
            order.deliveredAt = new Date();
        }

        await order.save();

        // Sync with Shipment service
        try {
            await shipmentService.createOrUpdateShipment({
                sellerOrderId: order._id,
                carrier: carrier || order.courierPartner || "ElectroNova Logistics",
                trackingNumber: trackingNumber || order.trackingNumber,
                deliveryMethod: order.deliveryMethod,
                currentStatus: newStatus === "Delivered" ? "Delivered" : newStatus === "Dispatched" ? "In Transit" : newStatus === "Packed" ? "Picked Up" : "Created",
                note,
                updatedBy: sellerUserId,
            });
        } catch {
            // Non-blocking shipment sync
        }

        // Auto-sync parent order
        try {
            if (order.parentOrderId) {
                const parentOrder = await orderModel.findById(order.parentOrderId);
                if (parentOrder) {
                    const siblings = await SellerOrder.find({ parentOrderId: order.parentOrderId });
                    if (siblings.length > 0) {
                        const allDelivered = siblings.every(s => s.orderStatus === "Delivered");
                        const allCancelled = siblings.every(s => s.orderStatus === "Cancelled");
                        const anyDispatched = siblings.some(s => ["Packed", "Dispatched", "In Transit", "Out for Delivery"].includes(s.orderStatus));

                        if (allDelivered) {
                            parentOrder.orderStatus = "Delivered";
                            await parentOrder.save();
                        } else if (allCancelled) {
                            parentOrder.orderStatus = "Cancelled";
                            await parentOrder.save();
                        } else if (anyDispatched && parentOrder.orderStatus !== "Delivered") {
                            parentOrder.orderStatus = "Shipped";
                            await parentOrder.save();
                        }
                    }
                }
            }
        } catch {
            // Parent order sync fallback
        }

        // Audit Log
        try {
            await AuditLog.create({
                action: "SELLER_ORDER_STATUS_UPDATE",
                actor: {
                    userId: sellerUserId,
                    role: "seller",
                },
                target: {
                    model: "SellerOrder",
                    id: order._id,
                },
                details: { status: newStatus, trackingNumber },
            });
        } catch {
            // Ignore audit failure
        }

        return order;
    },

    // Financial ledger
    async getSellerEarnings(sellerUserId) {
        const orders = await SellerOrder.find({
            sellerId: sellerUserId,
            orderStatus: { $ne: "Cancelled" },
        }).sort({ createdAt: -1 });

        let grossSales = 0;
        let commissionDeducted = 0;
        let netEarnings = 0;

        for (const o of orders) {
            grossSales += (o.subtotal || 0);
            commissionDeducted += (o.commissionAmount || 0);
            netEarnings += (o.sellerEarnings || 0);
        }

        const payouts = await Payout.find({ sellerId: sellerUserId }).sort({ createdAt: -1 });
        let paidOut = 0;
        for (const p of payouts) {
            if (p.status === "completed") {
                paidOut += (p.netAmount || 0);
            }
        }

        return {
            grossSales,
            commissionDeducted,
            netEarnings,
            paidOut,
            pendingPayout: Math.max(0, netEarnings - paidOut),
            payouts,
            totalOrders: orders.length,
        };
    },

    // Update Store details
    async updateStore(storeId, sellerUserId, updates) {
        if (!mongoose.isValidObjectId(storeId)) return null;

        const store = await Store.findOne({
            _id: storeId,
            sellerId: sellerUserId,
        });

        if (!store) return null;

        if (updates.name && updates.name.trim() !== store.name) {
            store.name = updates.name.trim();
        }
        if (updates.tagline !== undefined) store.tagline = updates.tagline;
        if (updates.description !== undefined) store.description = updates.description;
        if (updates.logo !== undefined) store.logo = updates.logo;
        if (updates.banner !== undefined) store.banner = updates.banner;
        if (updates.pickupAddress !== undefined) store.pickupAddress = updates.pickupAddress;
        if (updates.deliveryOptions !== undefined) store.deliveryOptions = updates.deliveryOptions;

        await store.save();
        return store;
    },
};

export default sellerRepository;
