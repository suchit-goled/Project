import paymentRepository from "../repositories/payment.repository.js";
import orderModel from "../models/order.model.js";

class PaymentService {

    async createOrder(orderId) {

    const order = await orderModel.findById(orderId);

    if (!order) {
        throw new Error("Order not found");
    }

    return await paymentRepository.createOrder(order.total);
}

    async verifyPayment(data) {

        return await paymentRepository.verifyPayment(
            data.razorpay_order_id,
            data.razorpay_payment_id,
            data.razorpay_signature
        );
    }
}

export default new PaymentService();