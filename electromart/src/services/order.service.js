import api from "../api/axios";

const OrderService = {

    async createOrder(orderData) {
        const response = await api.post("/orders", orderData);
        return response.data;
    },

    async getOrders(userId) {
        const response = await api.get(`/orders/${userId}`);
        return response.data;
    },

    async getOrder(orderId) {
        const response = await api.get(`/orders/details/${orderId}`);
        return response.data;
    },

    async cancelOrder(orderId) {
        const response = await api.put(`/orders/cancel/${orderId}`);
        return response.data;
    }

};

export default OrderService;