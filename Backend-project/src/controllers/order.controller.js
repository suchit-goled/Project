import mongoose from "mongoose";
import orderModel from "../models/order.model.js";
import Cart from "../models/Cart.js";
import User from "../models/user.model.js";
import Product from "../models/Product.js";
import SellerOrder from "../models/sellerOrder.model.js";
import Seller from "../models/seller.model.js";
import Store from "../models/store.model.js";
import Category from "../models/category.model.js";
import commissionService from "../services/commission.service.js";
import { sendEmail } from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../templates/orderConfirmationEmail.js";
import ApiResponse from "../utils/apiResponse.js";

const allowedPaymentMethods = ["Cash On Delivery", "Cash on Delivery", "COD", "Razorpay", "Online"];

export const createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod = "Cash On Delivery" } = req.body;

        if (!shippingAddress || typeof shippingAddress !== "object" || Array.isArray(shippingAddress) || !shippingAddress.address || !shippingAddress.city) {
            return ApiResponse.error(res, "Complete shipping address is required", 400);
        }

        const chosenPaymentMethod = paymentMethod || "Cash On Delivery";
        if (!allowedPaymentMethods.includes(chosenPaymentMethod)) {
            return ApiResponse.error(res, "Invalid payment method specified", 400);
        }

        const cleanShippingAddress = {
            fullName: String(shippingAddress.fullName || "").trim().slice(0, 100),
            phone: String(shippingAddress.phone || "").trim().slice(0, 25),
            address: String(shippingAddress.address || "").trim().slice(0, 250),
            city: String(shippingAddress.city || "").trim().slice(0, 100),
            state: String(shippingAddress.state || "").trim().slice(0, 100),
            pincode: String(shippingAddress.pincode || "").trim().slice(0, 20),
        };

        if (!cleanShippingAddress.address || !cleanShippingAddress.city) {
            return ApiResponse.error(res, "Street address and city cannot be empty", 400);
        }

        const userId = req.user._id.toString();

        const cartItems = await Cart.find({ userId });

        if (cartItems.length === 0) {
            return ApiResponse.error(
                res,
                "Cart is empty",
                400
            );
        }

        // Fetch corresponding product records to check live stock & seller ownership
        const productIds = cartItems.map(it => it.productId).filter(Boolean);
        let dbProducts = [];
        try {
            dbProducts = await Product.find({ _id: { $in: productIds } });
        } catch {
            dbProducts = [];
        }
        const productMap = new Map(dbProducts.map(p => [String(p._id), p]));

        // Validate stock availability
        for (const item of cartItems) {
            const prod = productMap.get(String(item.productId));
            if (prod && typeof prod.stock === "number" && prod.stock < item.quantity) {
                return ApiResponse.error(
                    res,
                    `Insufficient stock for "${prod.product_title || item.title}". Available: ${prod.stock}, Requested: ${item.quantity}`,
                    400
                );
            }
        }

        // Generate parent order number: e.g. EN-2026-XXXXXX
        const currentYear = new Date().getFullYear();
        const randId = Math.floor(100000 + Math.random() * 900000);
        const parentOrderNumber = `EN-${currentYear}-${randId}`;

        let subtotal = 0;
        const products = cartItems.map(item => {
            const prod = productMap.get(String(item.productId));
            const validPrice = Math.max(0, Number(item.price) || (prod ? prod.discounted_price : 0) || 0);
            const validQty = Math.max(1, Number(item.quantity) || 1);
            subtotal += validPrice * validQty;
            return {
                productId: item.productId,
                title: String(item.title || (prod ? prod.product_title : "Electronics Item")).slice(0, 200),
                image: item.image || (prod ? prod.product_image_url : ""),
                quantity: validQty,
                price: validPrice
            };
        });

        const shippingCharge = subtotal > 1000 ? 0 : 99;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shippingCharge + tax;

        // Group cart items by sellerId
        const sellerGroups = new Map();
        for (const item of cartItems) {
            const prod = productMap.get(String(item.productId));
            const validPrice = Math.max(0, Number(item.price) || (prod ? prod.discounted_price : 0) || 0);
            const validQty = Math.max(1, Number(item.quantity) || 1);

            let sId = item.sellerId || (prod && prod.sellerId) || null;
            let stId = item.storeId || (prod && prod.storeId) || null;
            const groupKey = sId ? String(sId) : "default_platform";

            if (!sellerGroups.has(groupKey)) {
                sellerGroups.set(groupKey, {
                    sellerId: sId,
                    storeId: stId,
                    items: [],
                    subtotal: 0,
                });
            }

            const grp = sellerGroups.get(groupKey);
            grp.items.push({
                productId: item.productId,
                title: String(item.title || (prod ? prod.product_title : "Electronics Item")).slice(0, 200),
                image: item.image || (prod ? prod.product_image_url : ""),
                price: validPrice,
                quantity: validQty,
                sku: prod?.sku || "",
                brand: prod?.brand || "",
            });
            grp.subtotal += validPrice * validQty;
        }

        // Create initial parent order record
        const order = await orderModel.create({
            userId,
            parentOrderNumber,
            products,
            shippingAddress: cleanShippingAddress,
            paymentMethod: chosenPaymentMethod,
            subtotal,
            shippingCharge,
            tax,
            total,
            paymentStatus: "Pending",
            orderStatus: "Confirmed",
            isMultiSeller: sellerGroups.size > 1,
            sellerOrders: [],
            commissionTotal: 0,
        });

        // Decompose into child SellerOrders
        const createdSellerOrders = [];
        let totalCommissionAmount = 0;
        let index = 0;

        for (const [, grp] of sellerGroups.entries()) {
            const suffix = String.fromCharCode(65 + index); // A, B, C...
            const sellerOrderNumber = `${parentOrderNumber}-${suffix}`;
            index++;

            // Resolve seller and store profiles
            let sellerProfile = null;
            let storeProfile = null;

            if (grp.sellerId && mongoose.isValidObjectId(grp.sellerId)) {
                try {
                    sellerProfile = await Seller.findOne({ userId: grp.sellerId });
                    storeProfile = await Store.findOne({
                        $or: [{ sellerId: grp.sellerId }, { _id: grp.storeId }]
                    });
                } catch {
                    // Fallback to defaults
                }
            }

            // Commission Resolution: Dynamic Engine (Seller Override -> Category Default -> Platform Default)
            const primaryCategory = grp.items[0]?.category || "";
            let commissionRate = 5.0;
            try {
                commissionRate = await commissionService.resolveCommissionRate({
                    sellerId: grp.sellerId,
                    category: primaryCategory,
                    sellerProfile,
                });
            } catch {
                if (sellerProfile && sellerProfile.commissionRateOverride !== null && sellerProfile.commissionRateOverride !== undefined) {
                    commissionRate = Number(sellerProfile.commissionRateOverride);
                }
            }

            const commAmount = Math.round((grp.subtotal * commissionRate) / 100);
            const netEarnings = Math.max(0, grp.subtotal - commAmount);
            totalCommissionAmount += commAmount;

            const effectiveSellerId = grp.sellerId || req.user._id;
            const effectiveStoreId = storeProfile?._id || grp.storeId;
            const supportsSellerDelivery = storeProfile?.deliveryOptions?.supportsSellerDelivery ?? true;
            const deliveryMethod = supportsSellerDelivery ? "seller_delivery" : "platform_delivery";

            const childOrderData = {
                sellerOrderNumber,
                parentOrderId: order._id,
                parentOrderNumber: order.parentOrderNumber,
                customerId: req.user._id,
                sellerId: effectiveSellerId,
                products: grp.items,
                subtotal: grp.subtotal,
                shippingCharge: 0,
                tax: Math.round(grp.subtotal * 0.18),
                total: grp.subtotal + Math.round(grp.subtotal * 0.18),
                commissionRate,
                commissionAmount: commAmount,
                sellerEarnings: netEarnings,
                orderStatus: "Confirmed",
                paymentStatus: order.paymentStatus,
                deliveryMethod,
                shipmentTimeline: [
                    {
                        status: "Confirmed",
                        timestamp: new Date(),
                        note: `Sub-order decomposed from parent order ${order.parentOrderNumber}.`,
                    }
                ],
            };

            if (effectiveStoreId && mongoose.isValidObjectId(effectiveStoreId)) {
                childOrderData.storeId = effectiveStoreId;
            }

            try {
                const createdChild = await SellerOrder.create(childOrderData);
                if (createdChild) {
                    createdSellerOrders.push(createdChild);
                }
            } catch (soErr) {
                console.warn("SellerOrder decomposition notice:", soErr.message);
            }

            // Decrement product inventory atomically
            for (const itm of grp.items) {
                if (itm.productId && mongoose.isValidObjectId(itm.productId)) {
                    try {
                        await Product.findByIdAndUpdate(itm.productId, {
                            $inc: { stock: -itm.quantity }
                        });
                    } catch (stockErr) {
                        console.warn("Stock decrement notice:", stockErr.message);
                    }
                }
            }
        }

        // Update parent order with linked SellerOrders and commission
        if (createdSellerOrders.length > 0) {
            order.sellerOrders = createdSellerOrders.map(so => so._id);
            order.commissionTotal = totalCommissionAmount;
            await order.save();
        }

        // Clear cart immediately for Cash On Delivery
        if (chosenPaymentMethod === "Cash On Delivery" || chosenPaymentMethod === "Cash on Delivery" || chosenPaymentMethod === "COD") {
            await Cart.deleteMany({ userId });
        }

        // Asynchronously dispatch order confirmation email in the background without blocking client response
        (async () => {
            try {
                const user = await User.findById(userId);
                if (user && user.email) {
                    await sendEmail({
                        email: user.email,
                        subject: `Order Confirmed - ${order._id}`,
                        html: orderConfirmationTemplate(order, user),
                    });
                }
            } catch (emailError) {
                console.error("Failed to send order confirmation email:", emailError.message);
            }
        })();

        return ApiResponse.success(
            res,
            order,
            "Order placed successfully",
            201
        );

    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.params.userId || (req.user && req.user._id ? req.user._id.toString() : null);

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return ApiResponse.error(
                res,
                "Invalid user ID format",
                400
            );
        }

        // Security check: only own orders or admin
        if (req.user.role !== "admin" && String(req.user._id) !== String(userId)) {
            return ApiResponse.error(
                res,
                "Access denied. You cannot view other users' orders.",
                403
            );
        }

        let query = orderModel.find({ userId });
        if (query && typeof query.populate === "function") {
            query = query.populate({
                path: "sellerOrders",
                populate: [
                    { path: "storeId", select: "name slug rating pickupAddress deliveryOptions logo" },
                    { path: "sellerId", select: "name email" }
                ]
            });
        }
        if (query && typeof query.sort === "function") {
            query = query.sort({ createdAt: -1 });
        }
        const orders = await query;

        return ApiResponse.success(
            res,
            { orders, count: orders.length },
            "Orders retrieved successfully"
        );

    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return ApiResponse.error(
                res,
                "Invalid order ID format",
                400
            );
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return ApiResponse.error(
                res,
                "Order not found",
                404
            );
        }

        // Security check: only own order or admin
        if (req.user.role !== "admin" && String(order.userId) !== String(req.user._id)) {
            return ApiResponse.error(
                res,
                "Access denied. You cannot view this order.",
                403
            );
        }

        if (typeof order.populate === "function") {
            try {
                await order.populate({
                    path: "sellerOrders",
                    populate: [
                        { path: "storeId", select: "name slug rating pickupAddress deliveryOptions logo" },
                        { path: "sellerId", select: "name email" }
                    ]
                });
            } catch {
                // If already populated or mock document, continue gracefully
            }
        }

        return ApiResponse.success(
            res,
            { order },
            "Order retrieved successfully"
        );

    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return ApiResponse.error(
                res,
                "Invalid order ID format",
                400
            );
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return ApiResponse.error(
                res,
                "Order not found",
                404
            );
        }

        // Security check: only own order or admin
        if (req.user.role !== "admin" && String(order.userId) !== String(req.user._id)) {
            return ApiResponse.error(
                res,
                "Access denied. You cannot cancel this order.",
                403
            );
        }

        if (order.orderStatus === "Shipped") {
            return ApiResponse.error(
                res,
                "Shipped orders cannot be cancelled directly. Please initiate a return upon delivery.",
                400
            );
        }

        if (order.orderStatus === "Delivered") {
            return ApiResponse.error(
                res,
                "Delivered orders cannot be cancelled.",
                400
            );
        }

        if (order.orderStatus === "Cancelled") {
            return ApiResponse.error(
                res,
                "Order is already cancelled.",
                400
            );
        }

        order.orderStatus = "Cancelled";
        await order.save();

        // Synchronize cancellation to all decomposed child SellerOrders & append timeline
        try {
            await SellerOrder.updateMany(
                { parentOrderId: order._id },
                {
                    $set: { orderStatus: "Cancelled" },
                    $push: {
                        shipmentTimeline: {
                            status: "Cancelled",
                            timestamp: new Date(),
                            note: "Parent order cancelled by customer.",
                        }
                    }
                }
            );

            // Restore product inventory atomically
            for (const prod of order.products || []) {
                if (prod.productId && mongoose.isValidObjectId(prod.productId)) {
                    await Product.findByIdAndUpdate(prod.productId, {
                        $inc: { stock: prod.quantity }
                    });
                }
            }
        } catch (syncErr) {
            console.error("Failed to synchronize sub-order cancellation:", syncErr);
        }

        return ApiResponse.success(
            res,
            { order },
            "Order cancelled successfully"
        );

    } catch (error) {
        next(error);
    }
};
