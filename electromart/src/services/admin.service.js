import api from "../api/axios";

const AdminService = {
    // Analytics
    async getDashboard() {
        const response = await api.get("/admin/dashboard");
        return response.data?.data || response.data;
    },

    // Products
    async getProducts() {
        const response = await api.get("/admin/products");
        const payload = response.data?.data || response.data;
        return Array.isArray(payload) ? payload : (payload.products || []);
    },

    async createProduct(productData) {
        // Can be JSON or FormData (for file uploads)
        const isFormData = productData instanceof FormData;
        const response = await api.post("/admin/products", productData, {
            headers: isFormData ? { "Content-Type": "multipart/form-data" } : {}
        });
        return response.data;
    },

    async updateProduct(id, productData) {
        const response = await api.put(`/admin/products/${id}`, productData);
        return response.data;
    },

    async deleteProduct(id) {
        const response = await api.delete(`/admin/products/${id}`);
        return response.data;
    },

    // Orders
    async getOrders(status = "") {
        const params = status ? { status } : {};
        const response = await api.get("/admin/orders", { params });
        const payload = response.data?.data || response.data;
        return Array.isArray(payload) ? payload : (payload.orders || []);
    },

    async updateOrderStatus(id, orderStatus) {
        const response = await api.put(`/admin/orders/${id}/status`, { orderStatus });
        return response.data;
    },

    // Users
    async getUsers() {
        const response = await api.get("/admin/users");
        const payload = response.data?.data || response.data;
        return Array.isArray(payload) ? payload : (payload.users || []);
    },

    async updateUserRole(id, role) {
        const response = await api.put(`/admin/users/${id}/role`, { role });
        return response.data;
    },

    async deleteUser(id) {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },
};

export default AdminService;
