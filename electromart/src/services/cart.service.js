import api from "../api/axios";

const CartService = {

    async addToCart(userId, productId, quantity = 1) {

        const response = await api.post("/cart/add", {
            userId,
            productId,
            quantity
        });

        return response.data;
    },

    async getCart(userId) {

        const response = await api.get(`/cart/${userId}`);

        return response.data;
    },

    async updateQuantity(userId, productId, quantity) {

        const response = await api.put("/cart/update", {
            userId,
            productId,
            quantity
        });

        return response.data;
    },

    async removeItem(userId, productId) {

        const response = await api.delete("/cart/remove", {
            data: {
                userId,
                productId
            }
        });

        return response.data;
    },

    async clearCart(userId) {

        const response = await api.delete(`/cart/clear/${userId}`);

        return response.data;
    }

};

export default CartService;