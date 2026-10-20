import productService from "../services/product.service.js";
import ApiResponse from "../utils/apiResponse.js";
import adminService from "../services/admin.service.js";
import adminOrderService from "../services/adminOrder.service.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import User from "../models/user.model.js";
import Cart from "../models/Cart.js";

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
            let imageUrl = req.body.product_image_url || req.body.image || "";

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
                "Product created successfully.",
                201
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
            const { orderStatus, status } = req.body;
            const newStatus = orderStatus || status;

            if (!newStatus) {
                return ApiResponse.error(res, "Order status is required.", 400);
            }

            const order = await adminOrderService.updateOrderStatus(
                id,
                newStatus
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

    async getAllUsers(req, res, next) {
        try {
            const users = await User.find()
                .select("-password -resetPasswordToken -resetPasswordExpire")
                .sort({ createdAt: -1 });

            return ApiResponse.success(
                res,
                users,
                "Users fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async updateUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!role || !["user", "admin"].includes(role)) {
                return ApiResponse.error(res, "Valid role ('user' or 'admin') is required.", 400);
            }

            const user = await User.findByIdAndUpdate(
                id,
                { role },
                { new: true }
            ).select("-password");

            if (!user) {
                return ApiResponse.error(res, "User not found.", 404);
            }

            return ApiResponse.success(
                res,
                user,
                "User role updated successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            // Prevent an admin from deleting their own account
            if (req.user._id.toString() === id.toString()) {
                return ApiResponse.error(res, "Cannot delete your own admin account.", 400);
            }

            const user = await User.findByIdAndDelete(id);

            if (!user) {
                return ApiResponse.error(res, "User not found.", 404);
            }

            // Cleanup associated carts
            await Cart.deleteMany({ userId: id });

            return ApiResponse.success(
                res,
                null,
                "User deleted successfully."
            );
        } catch (error) {
            next(error);
        }
    }

    async getAllCarts(req, res, next) {
        try {
            const carts = await Cart.find().populate("productId");

            return ApiResponse.success(
                res,
                carts,
                "Carts fetched successfully."
            );
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
