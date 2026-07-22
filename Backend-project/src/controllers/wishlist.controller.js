import Wishlist from "../models/wishlist.model.js";

// Add Product to Wishlist
export const addToWishlist = async (req, res) => {
    try {

        const { productId } = req.body;

        const existingItem = await Wishlist.findOne({
            userId: req.user._id,
            productId
        });

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: "Product already exists in wishlist"
            });
        }

        const wishlistItem = await Wishlist.create({
            userId: req.user._id,
            productId
        });

        res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            wishlistItem
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// get wishlist 
// Get Wishlist
export const getWishlist = async (req, res) => {
    try {

        const wishlist = await Wishlist.find({
            userId: req.user._id
        })
        .populate(
            "productId",
            "product_title discounted_price original_price product_image_url product_rating total_reviews"
        )
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};





// Remove Product from Wishlist
export const removeFromWishlist = async (req, res) => {
    try {

        const wishlistItem = await Wishlist.findOneAndDelete({
            userId: req.user._id,
            productId: req.params.productId
        });

        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};