import paymentService from "../services/payment.service.js";
import ApiResponse from "../utils/apiResponse.js";
import orderModel from "../models/order.model.js";

class PaymentController {

    async createOrder(req, res, next) {

        try {

            const { orderId } = req.body;

            const razorpayOrder =
await paymentService.createOrder(orderId);

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

            const verified = await paymentService.verifyPayment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    message: "Payment verification failed."
                });
            }

            const order = await orderModel.findByIdAndUpdate(
    orderId,
    {
        paymentStatus: "Paid",
        orderStatus: "Confirmed"
    },
    { new: true }
);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

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