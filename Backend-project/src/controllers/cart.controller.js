import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiResponse from "../utils/apiResponse.js";

// Helper to check user authorization
const checkCartAuthorization = (req, targetUserId) => {
    if (!req.user) return false;
    if (req.user.role === "admin") return true;
    return req.user._id.toString() === targetUserId.toString();
};

// =============================
// Add Product To Cart
// =============================
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const targetUserId = req.body.userId || req.user._id.toString();

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot modify another user's cart.", 403);
        }

        if (!productId) {
            return ApiResponse.error(res, "Product ID is required", 400);
        }

        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return ApiResponse.error(res, "Quantity must be a positive integer", 400);
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
            cartItem.quantity += numQuantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                userId: targetUserId,
                productId,
                title: product.product_title,
                image: product.product_image_url,
                price: product.discounted_price,
                quantity: numQuantity
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
        const targetUserId = req.params.userId || (req.user && req.user._id.toString());

        if (!targetUserId) {
            return ApiResponse.error(res, "User ID is required", 400);
        }

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot view another user's cart.", 403);
        }

        const cart = await Cart.find({
            userId: targetUserId
        }).populate("productId");

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
        const { productId, quantity } = req.body;
        const targetUserId = req.body.userId || req.user._id.toString();

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot modify another user's cart.", 403);
        }

        if (!productId || quantity === undefined) {
            return ApiResponse.error(res, "Product ID and quantity are required", 400);
        }

        const numQuantity = Number(quantity);
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
        const { productId } = req.body;
        const targetUserId = req.body.userId || req.user._id.toString();

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot modify another user's cart.", 403);
        }

        if (!productId) {
            return ApiResponse.error(res, "Product ID is required", 400);
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
        const targetUserId = req.params.userId || (req.user && req.user._id.toString());

        if (!checkCartAuthorization(req, targetUserId)) {
            return ApiResponse.error(res, "Access denied. Cannot clear another user's cart.", 403);
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