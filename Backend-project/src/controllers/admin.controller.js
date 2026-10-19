import productService from "../services/product.service.js";
import ApiResponse from "../utils/apiResponse.js";

import adminService from "../services/admin.service.js";

import adminOrderService from "../services/adminOrder.service.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";
class AdminController {
    async getProducts(req, res, next) {
    try {

        const products = await productService.getAllProducts();

        return ApiResponse.success(
            res,
            products,
            "Products fetched successfully."
        );

    } catch (error) {
        next(error);
    }
}

   async createProduct(req, res, next) {
    try {

        let imageUrl = "";

        if (req.file) {
            const uploadedImage = await uploadToCloudinary(
                req.file.buffer
            );

            imageUrl = uploadedImage.secure_url;
        }

        const productData = {
            ...req.body,
            product_image_url: imageUrl,
        };

        const product = await productService.createProduct(productData);

        return ApiResponse.success(
            res,
            product,
            "Product created successfully."
        );

    } catch (error) {
        next(error);
    }
}

   async updateProduct(req, res, next) {
    try {

        const product = await productService.updateProduct(
            req.params.id,
            req.body
        );

        return ApiResponse.success(
            res,
            product,
            "Product updated successfully."
        );

    } catch (error) {
        next(error);
    }
}

    async deleteProduct(req, res, next) {
    try {

        await productService.deleteProduct(req.params.id);

        return ApiResponse.success(
            res,
            null,
            "Product deleted successfully."
        );

    } catch (error) {
        next(error);
    }
}

async dashboard(req, res, next) {

    try {

        const dashboard = await adminService.getDashboardStats();

        return ApiResponse.success(
            res,
            dashboard,
            "Dashboard fetched successfully."
        );

    } catch (error) {
        next(error);
    }

}

async getAllOrders(req, res, next) {

    try {

        const { status } = req.query;

        const orders = await adminOrderService.getAllOrders(status);

        return ApiResponse.success(
            res,
            orders,
            "Orders fetched successfully."
        );

    } catch (error) {
        next(error);
    }

}

async updateOrderStatus(req, res, next) {

    try {

        const { id } = req.params;

        const { orderStatus } = req.body;

        const order = await adminOrderService.updateOrderStatus(
            id,
            orderStatus
        );

        return ApiResponse.success(
            res,
            order,
            "Order status updated successfully."
        );

    } catch (error) {
        next(error);
    }

}

}

export default new AdminController();