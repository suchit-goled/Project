import Wishlist from "../models/wishlist.model.js";
import ApiResponse from "../utils/apiResponse.js";

// Add Product to Wishlist
export const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return ApiResponse.error(res, "Product ID is required", 400);
        }

        const existingItem = await Wishlist.findOne({
            userId: req.user._id,
            productId
        });

        if (existingItem) {
            return ApiResponse.error(res, "Product already exists in wishlist", 400);
        }

        const wishlistItem = await Wishlist.create({
            userId: req.user._id,
            productId
        });

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            wishlistItem,
            data: { wishlistItem }
        });
    } catch (error) {
        next(error);
    }
};

// Get Wishlist
export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.find({
            userId: req.user._id
        })
        .populate(
            "productId",
            "product_title discounted_price original_price product_image_url product_rating total_reviews"
        )
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist,
            data: { wishlist, count: wishlist.length }
        });
    } catch (error) {
        next(error);
    }
};

// Remove Product from Wishlist
export const removeFromWishlist = async (req, res, next) => {
    try {
        const wishlistItem = await Wishlist.findOneAndDelete({
            userId: req.user._id,
            productId: req.params.productId
        });

        if (!wishlistItem) {
            return ApiResponse.error(res, "Product not found in wishlist", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        next(error);
    }
};
