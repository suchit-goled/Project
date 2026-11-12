import api from "../api/axios";

class PaymentService {
    async getKey() {
        const response = await api.get("/payment/key");
        return response.data?.data?.keyId || response.data?.keyId || "";
    }

    async createOrder(orderId) {
        const response = await api.post("/payment/create-order", {
            orderId,
        });

        return response.data;
    }

    async verifyPayment(data) {
        const response = await api.post("/payment/verify", data);

        return response.data;
    }
}

const paymentService = new PaymentService();

export default paymentService;
