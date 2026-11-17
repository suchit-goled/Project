import api from "../api/axios";

export const mapProduct = (p) => {
    if (!p) return {};
    const primaryImg = p.product_image_url || p.image || "";
    const allImages = Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : (primaryImg ? [primaryImg] : []);

    return {
        ...p,
        // Frontend normalized fields
        id: p._id,
        _id: p._id,
        title: p.product_title || p.title || "",
        image: primaryImg,
        images: allImages,
        rating: p.product_rating ?? p.rating ?? 0,
        numReviews: p.total_reviews ?? p.numReviews ?? 0,
        price: p.original_price ?? p.price ?? 0,
        discountPrice: p.discounted_price ?? p.discountPrice ?? p.price ?? 0,
        discountPercentage: p.discount_percentage ?? p.discountPercentage ?? 0,
        category: p.product_category || p.category || "",
        brand: p.brand || p.product_category || "",
        countInStock: p.stock ?? p.countInStock ?? 25,
        stock: p.stock ?? p.countInStock ?? 25,
        sku: p.sku || "",
        specifications: Array.isArray(p.specifications) ? p.specifications : [],
        store: typeof p.storeId === "object" && p.storeId !== null ? p.storeId : null,
        storeId: p.storeId,
        sellerId: p.sellerId,
        deliveryOptions: p.deliveryOptions || {
            supportsSellerDelivery: true,
            supportsPlatformDelivery: true,
            estimatedDeliveryDays: 3,
        },
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

    // Multi-Seller Alternative Offers
    async getOtherSellerOffers(id) {
        try {
            const response = await api.get(`/products/${id}/offers`);
            const items = response.data?.data || [];
            return Array.isArray(items) ? items.map(mapProduct) : [];
        } catch {
            return [];
        }
    },

    // Search Autocomplete Suggestions
    async getSuggestions(q) {
        if (!q || !q.trim()) return { products: [], categories: [], brands: [] };
        try {
            const response = await api.get(`/products/suggestions?q=${encodeURIComponent(q.trim())}`);
            return response.data?.data || { products: [], categories: [], brands: [] };
        } catch {
            return { products: [], categories: [], brands: [] };
        }
    },

    // Deals (High discount products)
    async getDeals(limit = 12) {
        try {
            const response = await api.get(`/products/deals?limit=${limit}`);
            const items = response.data?.data || [];
            return Array.isArray(items) ? items.map(mapProduct) : [];
        } catch {
            return [];
        }
    },

    // Brands
    async getBrands() {
        try {
            const response = await api.get("/products/brands");
            return response.data?.data || [];
        } catch {
            return [];
        }
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

    // Comprehensive Marketplace Homepage Data
    async getHomeMarketplaceData() {
        try {
            const response = await api.get("/home");
            const data = response.data?.data || {};
            return {
                ...data,
                featuredProducts: (data.featuredProducts || []).map(mapProduct),
                deals: (data.deals || []).map(mapProduct),
                bestSellers: (data.bestSellers || []).map(mapProduct),
            };
        } catch (err) {
            console.error("Failed to load home marketplace data:", err);
            return null;
        }
    },

    // Stores / Verified Sellers
    async getStores(params = {}) {
        try {
            const response = await api.get("/stores", { params });
            return response.data?.data || [];
        } catch {
            return [];
        }
    },

    async getTopRatedStores(limit = 8) {
        try {
            const response = await api.get(`/stores/top-rated?limit=${limit}`);
            return response.data?.data || [];
        } catch {
            return [];
        }
    },

    async getStoreBySlug(slug) {
        try {
            const response = await api.get(`/stores/${slug}`);
            const data = response.data?.data;
            if (data && data.products) {
                data.products = data.products.map(mapProduct);
            }
            return data;
        } catch {
            return null;
        }
    },

    // PIN Code Delivery Checker
    async checkDeliveryPincode(pincode) {
        const response = await api.post("/delivery/check", { pincode });
        return response.data?.data;
    },
};

export default ProductService;
