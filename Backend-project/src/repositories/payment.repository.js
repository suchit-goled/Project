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
        if (!razorpay_signature || typeof razorpay_signature !== "string") {
            return false;
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature.length !== razorpay_signature.length) {
            return false;
        }

        return crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(razorpay_signature)
        );
    }

}

export default new PaymentRepository();
