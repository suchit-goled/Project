import paymentService from "../services/payment.service.js";
import ApiResponse from "../utils/apiResponse.js";
import orderModel from "../models/order.model.js";
import Cart from "../models/Cart.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../templates/orderConfirmationEmail.js";
import env from "../config/env.js";

class PaymentController {

    async getKey(req, res, next) {
        try {
            return ApiResponse.success(
                res,
                { keyId: env.razorpay_key_id },
                "Razorpay public key fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async createOrder(req, res, next) {
        try {
            const { orderId } = req.body;

            if (!orderId) {
                return ApiResponse.error(res, "Order ID is required", 400);
            }

            const order = await orderModel.findById(orderId);
            if (!order) {
                return ApiResponse.error(res, "Order not found", 404);
            }

            if (String(order.userId) !== req.user._id.toString() && req.user.role !== "admin") {
                return ApiResponse.error(res, "Access denied", 403);
            }

            const razorpayOrder = await paymentService.createOrder(orderId);

            return ApiResponse.success(
                res,
                {
                    ...razorpayOrder,
                    keyId: env.razorpay_key_id
                },
                "Payment order created successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async verifyPayment(req, res, next) {
        try {
            const {
                orderId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return ApiResponse.error(res, "All payment verification fields are required", 400);
            }

            const existingOrder = await orderModel.findById(orderId);
            if (!existingOrder) {
                return ApiResponse.error(res, "Order not found.", 404);
            }

            if (String(existingOrder.userId) !== req.user._id.toString() && req.user.role !== "admin") {
                return ApiResponse.error(res, "Access denied.", 403);
            }

            const verified = await paymentService.verifyPayment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            if (!verified) {
                return ApiResponse.error(res, "Payment verification failed.", 400);
            }

            const order = await orderModel.findByIdAndUpdate(
                orderId,
                {
                    paymentStatus: "Paid",
                    orderStatus: "Confirmed"
                },
                { new: true }
            );

            await Cart.deleteMany({ userId: order.userId });

            // Asynchronously dispatch payment confirmation email in the background without blocking client response
            (async () => {
                try {
                    const user = await User.findById(order.userId);
                    if (user && user.email) {
                        await sendEmail({
                            email: user.email,
                            subject: `Payment Confirmed - Order #${order._id}`,
                            html: orderConfirmationTemplate(order, user),
                        });
                    }
                } catch (emailError) {
                    console.error("Failed to send payment confirmation email:", emailError.message);
                }
            })();

            return ApiResponse.success(
                res,
                order,
                "Payment verified successfully."
            );
        } catch (error) {
            next(error);
        }
    }

}

export default new PaymentController();
