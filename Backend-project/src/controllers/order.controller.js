import orderModel from "../models/order.model.js";
import Cart from "../models/Cart.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../templates/orderConfirmationEmail.js";
import ApiResponse from "../utils/apiResponse.js";

export const createOrder = async (req, res, next) => {
    try {

        const { shippingAddress, paymentMethod } = req.body;

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
            paymentStatus: paymentMethod === "Cash On Delivery"
                ? "Pending"
                : "Pending",
            orderStatus: "Pending"
        });

        const user = await User.findById(userId);

        try {

            await sendEmail({
                email: user.email,
                subject: `Order Confirmed - ${order._id}`,
                html: orderConfirmationTemplate(order, user),
            });

            console.log("✅ Order confirmation email sent");

        } catch (emailError) {

            console.error("❌ Failed to send order confirmation email:", emailError);

        }

        // Clear cart only for Cash On Delivery
        // For Razorpay, clear the cart after successful payment verification
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
export const getUserOrders = async (req, res) => {
    try {

        const { userId } = req.params;

        console.log("Requested User ID:", userId);

        const orders = await orderModel
            .find({ userId })
            .sort({ createdAt: -1 });

        console.log("Orders Found:", orders);

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getOrderById = async (req, res) => {

    try {

        const { orderId } = req.params;

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const cancelOrder = async (req, res) => {

    try {

        const { orderId } = req.params;

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered orders cannot be cancelled."
            });
        }

        order.orderStatus = "Cancelled";

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};