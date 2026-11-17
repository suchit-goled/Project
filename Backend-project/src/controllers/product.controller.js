import mongoose from "mongoose";
import productService from "../services/product.service.js";
import ApiResponse from "../utils/apiResponse.js";

class ProductController {
    async getProducts(req, res, next) {
        try {
            const data = await productService.getProducts(req.query);

            return ApiResponse.success(
                res,
                data,
                "Products fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async getFeaturedProducts(req, res, next) {
        try {
            const data = await productService.getFeaturedProducts();

            return ApiResponse.success(
                res,
                data,
                "Featured products fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async getCategories(req, res, next) {
        try {
            const categories = await productService.getCategories();

            return ApiResponse.success(
                res,
                categories,
                "Categories fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async getRelatedProducts(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || !mongoose.isValidObjectId(id)) {
                return ApiResponse.success(
                    res,
                    [],
                    "Related products fetched successfully."
                );
            }

            const related = await productService.getRelatedProducts(id, 4);

            return ApiResponse.success(
                res,
                related,
                "Related products fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async getProductById(req, res, next) {
        try {
            const { id } = req.params;

            if (!id || !mongoose.isValidObjectId(id)) {
                return ApiResponse.error(res, "Product not found", 404);
            }

            const data = await productService.getProductById(id);

            if (!data) {
                return ApiResponse.error(res, "Product not found", 404);
            }

            return ApiResponse.success(
                res,
                data,
                "Product fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async getSuggestions(req, res, next) {
        try {
            const { q } = req.query;
            const data = await productService.getSuggestions(q);
            return ApiResponse.success(res, data, "Suggestions fetched successfully.");
        } catch (error) {
            next(error);
        }
    }

    async getDeals(req, res, next) {
        try {
            const limit = Number(req.query.limit) || 12;
            const data = await productService.getDeals(limit);
            return ApiResponse.success(res, data, "Deals fetched successfully.");
        } catch (error) {
            next(error);
        }
    }

    async getBrands(req, res, next) {
        try {
            const data = await productService.getBrands();
            return ApiResponse.success(res, data, "Brands fetched successfully.");
        } catch (error) {
            next(error);
        }
    }

    async getOtherSellerOffers(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || !mongoose.isValidObjectId(id)) {
                return ApiResponse.success(res, [], "No other seller offers.");
            }
            const data = await productService.getOtherSellerOffers(id);
            return ApiResponse.success(res, data, "Seller offers fetched successfully.");
        } catch (error) {
            next(error);
        }
    }
}

export default new ProductController();
