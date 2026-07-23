import productService from "../services/product.service.js";
import ApiResponse from "../utils/apiResponse.js";

class ProductController {
   async getProducts(req, res, next) {
    try {
        const data = await productService.getProducts(req.query);

        console.log("Controller Products:", data.products.length);

        return ApiResponse.success(
            res,
            data,
            "Products fetched successfully."
        );
    } catch (error) {
        console.error(error);
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

    async getProductById(req, res, next) {
        try {
            const data = await productService.getProductById(req.params.id);

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