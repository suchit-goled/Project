import api from "../api/axios";

const SellerService = {
    // Seller Registration / Onboarding
    async registerSeller(data) {
        const response = await api.post("/seller/register", data);
        return response.data;
    },

    // Get current seller profile and store
    async getProfile() {
        const response = await api.get("/seller/profile");
        return response.data?.data;
    },

    // Update store profile
    async updateStore(data) {
        const response = await api.put("/seller/store", data);
        return response.data?.data;
    },

    // Dashboard metrics
    async getDashboard() {
        const response = await api.get("/seller/dashboard");
        return response.data?.data;
    },

    // Sub-orders
    async getOrders(params = {}) {
        const response = await api.get("/seller/orders", { params });
        return response.data?.data;
    },

    // Single sub-order
    async getOrderById(id) {
        const response = await api.get(`/seller/orders/${id}`);
        return response.data?.data;
    },

    // Update sub-order fulfillment status
    async updateOrderStatus(id, data) {
        const response = await api.put(`/seller/orders/${id}/status`, data);
        return response.data?.data;
    },

    // Financial ledger & earnings
    async getEarnings() {
        const response = await api.get("/seller/earnings");
        return response.data?.data;
    },

    // Product Catalog & Inventory
    async getProducts(params = {}) {
        const response = await api.get("/seller/products", { params });
        return response.data?.data;
    },

    async createProduct(data) {
        const response = await api.post("/seller/products", data);
        return response.data;
    },

    async updateProduct(id, data) {
        const response = await api.put(`/seller/products/${id}`, data);
        return response.data;
    },

    async deleteProduct(id) {
        const response = await api.delete(`/seller/products/${id}`);
        return response.data;
    },
};

export default SellerService;
