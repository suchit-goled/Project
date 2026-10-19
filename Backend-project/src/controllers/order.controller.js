import orderModel from "../models/order.model.js";
import Cart from "../models/Cart.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../templates/orderConfirmationEmail.js";
import ApiResponse from "../utils/apiResponse.js";

export const createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod = "Cash On Delivery" } = req.body;

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
            return ApiResponse.error(res, "Complete shipping address is required", 400);
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
            subtotal += item.price * item.quantity;
            return {
                productId: item.productId,
                title: item.title,
                image: item.image,
                quantity: item.quantity,
                price: item.price
            };
        });

        const shippingCharge = subtotal > 1000 ? 0 : 99;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shippingCharge + tax;

        const order = await orderModel.create({
            userId,
            products,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingCharge,
            tax,
            total,
            paymentStatus: "Pending",
            orderStatus: "Pending"
        });

        const user = await User.findById(userId);

        if (user && user.email) {
            try {
                await sendEmail({
                    email: user.email,
                    subject: `Order Confirmed - ${order._id}`,
                    html: orderConfirmationTemplate(order, user),
                });
            } catch (emailError) {
                console.error("Failed to send order confirmation email:", emailError.message);
            }
        }

        // Clear cart for Cash On Delivery
        if (paymentMethod === "Cash On Delivery") {
            await Cart.deleteMany({ userId });
        }

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
        const { userId } = req.params;

        // Security check: only own orders or admin
        if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
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

        const order = await orderModel.findById(orderId);

        if (!order) {
            return ApiResponse.error(
                res,
                "Order not found",
                404
            );
        }

        // Security check: only own order or admin
        if (req.user.role !== "admin" && order.userId !== req.user._id.toString()) {
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

        const order = await orderModel.findById(orderId);

        if (!order) {
            return ApiResponse.error(
                res,
                "Order not found",
                404
            );
        }

        // Security check: only own order or admin
        if (req.user.role !== "admin" && order.userId !== req.user._id.toString()) {
            return ApiResponse.error(
                res,
                "Access denied. You cannot cancel this order.",
                403
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