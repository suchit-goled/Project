import api from "../api/axios";

const mapProduct = (p) => ({
    ...p,

    // Frontend fields
    title: p.product_title,
    image: p.product_image_url,
    rating: p.product_rating,
    numReviews: p.total_reviews,
    price: p.original_price,
    discountPrice: p.discounted_price,
    discountPercentage: p.discount_percentage,
    category: p.product_category,
    brand: p.product_category,
});

const ProductService = {

    // Featured Products
    async getFeaturedProducts() {

        const response = await api.get("/products/featured");

        return response.data.data.map(mapProduct);

    },

    // All Products
    async getProducts(params = {}) {

        const response = await api.get("/products", {
            params,
        });

        return {
            ...response.data,

            data: {
                ...response.data.data,

                products: response.data.data.products.map(mapProduct),
            },
        };

    },

    // Product Details
    async getProductById(id) {

        const response = await api.get(`/products/${id}`);

        return mapProduct(response.data.data);

    },

    // Search Products
    async searchProducts(keyword) {

        const response = await api.get("/products/search", {
            params: {
                keyword,
            },
        });

        return response.data.data.map(mapProduct);

    },

};

export default ProductService;