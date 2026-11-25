import productRepository from "../repositories/product.repository.js";
import cacheService from "../cache/cacheService.js";

class ProductService {
    async getProducts(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;

        return await productRepository.getProducts(query, page, limit);
    }

    async getFeaturedProducts() {
        return await productRepository.getFeaturedProducts();
    }

    async getProductById(id) {
        return await productRepository.getProductById(id);
    }

    async getCategories() {
        return await productRepository.getCategories();
    }

    async getOtherSellerOffers(id) {
        return await productRepository.getOtherSellerOffers(id);
    }

    async getSuggestions(keyword) {
        return await productRepository.getSuggestions(keyword);
    }

    async getDeals(limit = 12) {
        return await productRepository.getDeals(limit);
    }

    async getBrands() {
        return await productRepository.getBrands();
    }

    async getRelatedProducts(productId, limit = 4) {
        return await productRepository.getRelatedProducts(productId, limit);
    }

    async createProduct(productData) {
        const product = await productRepository.createProduct(productData);
        // Invalidate product & deals hot-read caches
        cacheService.delPattern("http:/api/products*");
        cacheService.delPattern("http:/api/home*");
        return product;
    }

    async updateProduct(id, productData) {
        const product = await productRepository.updateProduct(id, productData);
        // Invalidate product & deals hot-read caches
        cacheService.delPattern("http:/api/products*");
        cacheService.delPattern("http:/api/home*");
        return product;
    }

    async deleteProduct(id) {
        const result = await productRepository.deleteProduct(id);
        // Invalidate product & deals hot-read caches
        cacheService.delPattern("http:/api/products*");
        cacheService.delPattern("http:/api/home*");
        return result;
    }

    async getAllProducts() {
        return await productRepository.getAllProducts();
    }
}

export default new ProductService();
