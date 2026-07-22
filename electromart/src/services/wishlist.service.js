import api from "../api/axios";

const WishlistService = {

    async getWishlist() {

        const response = await api.get("/wishlist");

        return response.data;

    },

    async addToWishlist(productId) {

        const response = await api.post("/wishlist", {
            productId
        });

        return response.data;

    },

    async removeFromWishlist(productId) {

        const response = await api.delete(`/wishlist/${productId}`);

        return response.data;

    }

};

export default WishlistService;