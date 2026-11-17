import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiResponse from "../utils/apiResponse.js";

// Helper to check user authorization
const checkCartAuthorization = (req, targetUserId) => {
    if (!req.user || !targetUserId) return false;
    if (req.user.role === "admin") return true;
    return String(req.user._id) === String(targetUserId);
};

// =============================
// Add Product To Cart
// =============================
export const addToCart = async (req, res, next) => {
    try {
        const productId = req.body && req.body.productId;
        const quantity = req.body && req.body.quantity !== undefined ? req.body.quantity : 1;
        const targetUserId = (req.body && req.body.userId) || (req.user && req.user._id ? req.user._id.toString() : null);

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot modify another user's cart.", 403);
        }

        if (targetUserId && !mongoose.isValidObjectId(targetUserId)) {
            return ApiResponse.error(res, "Invalid user ID format", 400);
        }

        if (!productId) {
            return ApiResponse.error(res, "Product ID is required", 400);
        }

        if (!mongoose.isValidObjectId(productId)) {
            return ApiResponse.error(res, "Invalid product ID format", 400);
        }

        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity <= 0) {
            return ApiResponse.error(res, "Quantity must be a positive integer", 400);
        }

        if (numQuantity > 50) {
            return ApiResponse.error(res, "Maximum quantity allowed per item is 50", 400);
        }

        const product = await Product.findById(productId);
        if (!product) {
            return ApiResponse.error(res, "Product not found", 404);
        }

        let cartItem = await Cart.findOne({
            userId: targetUserId,
            productId
        });

        if (cartItem) {
            const newTotalQty = cartItem.quantity + numQuantity;
            if (newTotalQty > 50) {
                return ApiResponse.error(res, "Cannot exceed maximum of 50 units per product in cart", 400);
            }
            cartItem.quantity = newTotalQty;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                userId: targetUserId,
                productId,
                title: product.product_title,
                image: product.product_image_url,
                price: product.discounted_price,
                quantity: numQuantity,
                sellerId: product.sellerId || undefined,
                storeId: product.storeId || undefined,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            item: cartItem
        });

    } catch (error) {
        next(error);
    }
};

// =============================
// Get Cart
// =============================
export const getCart = async (req, res, next) => {
    try {
        const targetUserId = req.params.userId || (req.user && req.user._id ? req.user._id.toString() : null);

        if (!targetUserId) {
            return ApiResponse.error(res, "User ID is required", 400);
        }

        if (!mongoose.isValidObjectId(targetUserId)) {
            return ApiResponse.error(res, "Invalid user ID format", 400);
        }

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot view another user's cart.", 403);
        }

        let cartQuery = Cart.find({
            userId: targetUserId
        });

        if (cartQuery && typeof cartQuery.populate === "function") {
            cartQuery = cartQuery.populate("productId");
            if (cartQuery && typeof cartQuery.populate === "function") {
                cartQuery = cartQuery.populate("storeId");
            }
        }

        const cart = await cartQuery;

        return res.status(200).json({
            success: true,
            cart
        });

    } catch (error) {
        next(error);
    }
};

// =============================
// Update Quantity
// =============================
export const updateQuantity = async (req, res, next) => {
    try {
        const productId = (req.body && req.body.productId) || (req.params && req.params.productId);
        const quantity = req.body && req.body.quantity !== undefined ? req.body.quantity : (req.query && req.query.quantity);
        const targetUserId = (req.body && req.body.userId) || (req.params && req.params.userId) || (req.user && req.user._id ? req.user._id.toString() : null);

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot modify another user's cart.", 403);
        }

        if (targetUserId && !mongoose.isValidObjectId(targetUserId)) {
            return ApiResponse.error(res, "Invalid user ID format", 400);
        }

        if (!productId || quantity === undefined) {
            return ApiResponse.error(res, "Product ID and quantity are required", 400);
        }

        if (!mongoose.isValidObjectId(productId)) {
            return ApiResponse.error(res, "Invalid product ID format", 400);
        }

        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || !Number.isInteger(numQuantity)) {
            return ApiResponse.error(res, "Quantity must be a valid integer", 400);
        }

        if (numQuantity <= 0) {
            await Cart.findOneAndDelete({
                userId: targetUserId,
                productId
            });
            return res.status(200).json({
                success: true,
                message: "Item removed from cart"
            });
        }

        if (numQuantity > 50) {
            return ApiResponse.error(res, "Maximum quantity allowed per item is 50", 400);
        }

        const cartItem = await Cart.findOne({
            userId: targetUserId,
            productId
        });

        if (!cartItem) {
            return ApiResponse.error(res, "Cart item not found", 404);
        }

        cartItem.quantity = numQuantity;
        await cartItem.save();

        return res.status(200).json({
            success: true,
            message: "Quantity updated",
            item: cartItem
        });

    } catch (error) {
        next(error);
    }
};

// =============================
// Remove Item
// =============================
export const removeFromCart = async (req, res, next) => {
    try {
        const productId = (req.body && req.body.productId) || (req.params && req.params.productId) || (req.query && req.query.productId);
        const targetUserId = (req.body && req.body.userId) || (req.params && req.params.userId) || (req.user && req.user._id ? req.user._id.toString() : null);

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot modify another user's cart.", 403);
        }

        if (targetUserId && !mongoose.isValidObjectId(targetUserId)) {
            return ApiResponse.error(res, "Invalid user ID format", 400);
        }

        if (!productId) {
            return ApiResponse.error(res, "Product ID is required", 400);
        }

        if (!mongoose.isValidObjectId(productId)) {
            return ApiResponse.error(res, "Invalid product ID format", 400);
        }

        await Cart.findOneAndDelete({
            userId: targetUserId,
            productId
        });

        return res.status(200).json({
            success: true,
            message: "Item removed successfully"
        });

    } catch (error) {
        next(error);
    }
};

// =============================
// Clear Cart
// =============================
export const clearCart = async (req, res, next) => {
    try {
        const targetUserId = (req.params && req.params.userId) || (req.body && req.body.userId) || (req.user && req.user._id ? req.user._id.toString() : null);

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot clear another user's cart.", 403);
        }

        if (targetUserId && !mongoose.isValidObjectId(targetUserId)) {
            return ApiResponse.error(res, "Invalid user ID format", 400);
        }

        await Cart.deleteMany({
            userId: targetUserId
        });

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });

    } catch (error) {
        next(error);
    }
};
