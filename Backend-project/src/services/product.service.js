import productRepository from "../repositories/product.repository.js";

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

    async getRelatedProducts(productId, limit = 4) {
        return await productRepository.getRelatedProducts(productId, limit);
    }

    async createProduct(productData) {
        return await productRepository.createProduct(productData);
    }

    async updateProduct(id, productData) {
        return await productRepository.updateProduct(id, productData);
    }

    async deleteProduct(id) {
        return await productRepository.deleteProduct(id);
    }

    async getAllProducts() {
        return await productRepository.getAllProducts();
    }
}

export default new ProductService();
