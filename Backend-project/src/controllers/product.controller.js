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
            const data = await productService.getProductById(req.params.id);

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
}

export default new ProductController();
