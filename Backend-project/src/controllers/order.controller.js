import mongoose from "mongoose";
import orderModel from "../models/order.model.js";
import Cart from "../models/Cart.js";
import User from "../models/user.model.js";
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

        let subtotal = 0;

        const products = cartItems.map(item => {
            const validPrice = Math.max(0, Number(item.price) || 0);
            const validQty = Math.max(1, Number(item.quantity) || 1);
            subtotal += validPrice * validQty;
            return {
                productId: item.productId,
                title: String(item.title || "Electronics Item").slice(0, 200),
                image: item.image,
                quantity: validQty,
                price: validPrice
            };
        });

        const shippingCharge = subtotal > 1000 ? 0 : 99;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shippingCharge + tax;

        const order = await orderModel.create({
            userId,
            products,
            shippingAddress: cleanShippingAddress,
            paymentMethod: chosenPaymentMethod,
            subtotal,
            shippingCharge,
            tax,
            total,
            paymentStatus: "Pending",
            orderStatus: "Pending"
        });

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

        const orders = await orderModel
            .find({ userId })
            .sort({ createdAt: -1 });

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

        return ApiResponse.success(
            res,
            { order },
            "Order cancelled successfully"
        );

    } catch (error) {
        next(error);
    }
};
