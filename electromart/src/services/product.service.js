import api from "../api/axios";

const mapProduct = (p) => {
    if (!p) return {};
    return {
        ...p,
        // Frontend normalized fields
        title: p.product_title || p.title || "",
        image: p.product_image_url || p.image || "",
        rating: p.product_rating ?? p.rating ?? 0,
        numReviews: p.total_reviews ?? p.numReviews ?? 0,
        price: p.original_price ?? p.price ?? 0,
        discountPrice: p.discounted_price ?? p.discountPrice ?? p.price ?? 0,
        discountPercentage: p.discount_percentage ?? p.discountPercentage ?? 0,
        category: p.product_category || p.category || "",
        brand: p.brand || p.product_category || "",
        countInStock: p.countInStock ?? 25,
    };
};

const ProductService = {

    // Featured Products
    async getFeaturedProducts() {
        const response = await api.get("/products/featured");
        const payload = response?.data?.data ?? response?.data ?? [];
        const items = Array.isArray(payload) ? payload : (payload.products || []);
        return items.map(mapProduct);
    },

    // All Products with full query params
    async getProducts(params = {}) {
        const response = await api.get("/products", {
            params,
        });

        const payload = response?.data?.data ?? response?.data ?? {};
        const rawProducts = Array.isArray(payload.products)
            ? payload.products
            : Array.isArray(payload)
                ? payload
                : [];

        const mappedProducts = rawProducts.map(mapProduct);

        return {
            ...response?.data,
            products: mappedProducts,
            data: {
                ...payload,
                products: mappedProducts,
                total: payload.total || mappedProducts.length,
                page: payload.page || 1,
                totalPages: payload.totalPages || 1,
            },
        };
    },

    // Product Details
    async getProductById(id) {
        const response = await api.get(`/products/${id}`);
        const payload = response.data?.data?.product || response.data?.data || response.data?.product || response.data;
        return mapProduct(payload);
    },

    // Related Products
    async getRelatedProducts(id) {
        try {
            const response = await api.get(`/products/${id}/related`);
            const payload = response.data?.data || [];
            return Array.isArray(payload) ? payload.map(mapProduct) : [];
        } catch {
            return [];
        }
    },

    // Search Products
    async searchProducts(keyword) {
        const response = await api.get(`/products?search=${encodeURIComponent(keyword)}`);
        const payload = response.data?.data ?? response.data ?? {};
        const rawProducts = Array.isArray(payload.products) ? payload.products : [];
        return rawProducts.map(mapProduct);
    },

    // Categories
    async getCategories() {
        try {
            const response = await api.get("/products/categories");
            return response.data?.data || [];
        } catch {
            return [];
        }
    },

};

export default ProductService;
