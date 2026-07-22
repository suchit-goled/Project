import razorpay from "../config/razorpay.js";
import crypto from "crypto";

class PaymentRepository {

    async createOrder(amount) {

        return await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });

    }

    async verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    ) {

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        return generatedSignature === razorpay_signature;
    }

}

export default new PaymentRepository();