import api from "../api/axios";

const ReviewService = {
    async getProductReviews(productId) {
        try {
            const response = await api.get(`/reviews/product/${productId}`);
            return response.data?.data?.reviews || response.data?.reviews || [];
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return [];
        }
    },

    async addReview(reviewData) {
        const response = await api.post("/reviews", reviewData);
        return response.data;
    },

    async updateReview(reviewId, reviewData) {
        const response = await api.put(`/reviews/${reviewId}`, reviewData);
        return response.data;
    },

    async deleteReview(reviewId) {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    },
};

export default ReviewService;
