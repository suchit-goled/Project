import api from "../api/axios";

class PaymentService {

    async createOrder(orderId) {

        const response = await api.post("/payment/create-order", {
            orderId
        });

        return response.data;
    }

    async verifyPayment(data) {

        const response = await api.post("/payment/verify", data);

        return response.data;
    }

}

export default new PaymentService();