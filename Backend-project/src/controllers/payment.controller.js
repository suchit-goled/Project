import paymentService from "../services/payment.service.js";
import ApiResponse from "../utils/apiResponse.js";
import orderModel from "../models/order.model.js";
import Cart from "../models/Cart.js";

class PaymentController {

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

            if (order.userId !== req.user._id.toString() && req.user.role !== "admin") {
                return ApiResponse.error(res, "Access denied", 403);
            }

            const razorpayOrder = await paymentService.createOrder(orderId);

            return ApiResponse.success(
                res,
                razorpayOrder,
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

            if (existingOrder.userId !== req.user._id.toString() && req.user.role !== "admin") {
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