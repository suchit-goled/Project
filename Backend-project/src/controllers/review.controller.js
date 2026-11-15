import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Product from "../models/Product.js";
import ApiResponse from "../utils/apiResponse.js";

const sanitizeComment = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .trim()
        .slice(0, 1000);
};

const updateProductRating = async (productId) => {
    const reviews = await Review.find({ productId });
    const totalReviews = reviews.length;
    const averageRating =
        totalReviews === 0
            ? 0
            : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    await Product.findByIdAndUpdate(productId, {
        product_rating: Number(averageRating.toFixed(1)),
        total_reviews: totalReviews,
    });
};

// Add review
export const addReview = async (req, res, next) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId) {
            return ApiResponse.error(res, "Product ID is required", 400);
        }

        if (!mongoose.isValidObjectId(productId)) {
            return ApiResponse.error(res, "Invalid product ID", 400);
        }

        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return ApiResponse.error(res, "Rating must be a number between 1 and 5", 400);
        }

        const cleanRating = Math.round(numRating);
        if (cleanRating < 1 || cleanRating > 5) {
            return ApiResponse.error(res, "Rating must be a valid integer between 1 and 5", 400);
        }

        if (comment && typeof comment === "string" && comment.length > 1000) {
            return ApiResponse.error(res, "Review comment cannot exceed 1000 characters", 400);
        }

        const product = await Product.findById(productId);
        if (!product) {
            return ApiResponse.error(res, "Product not found", 404);
        }

        const existingReview = await Review.findOne({
            userId: req.user._id,
            productId
        });

        if (existingReview) {
            return ApiResponse.error(res, "You have already reviewed this product", 400);
        }

        const review = await Review.create({
            userId: req.user._id,
            productId,
            rating: cleanRating,
            comment: sanitizeComment(comment)
        });

        await updateProductRating(productId);

        return ApiResponse.success(
            res,
            { review },
            "Review added successfully",
            201
        );

    } catch (error) {
        next(error);
    }
};

export const getReviews = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.productId)) {
            return ApiResponse.error(res, "Invalid product ID format", 400);
        }

        const reviews = await Review.find({
            productId: req.params.productId
        })
        .populate("userId", "name profileImage")
        .sort({ createdAt: -1 });

        return ApiResponse.success(
            res,
            { reviews, count: reviews.length },
            "Reviews fetched successfully"
        );

    } catch (error) {
        next(error);
    }
};

export const updateReview = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.reviewId)) {
            return ApiResponse.error(res, "Invalid review ID format", 400);
        }

        const { rating, comment } = req.body;

        const review = await Review.findOne({
            _id: req.params.reviewId,
            userId: req.user._id
        });

        if (!review) {
            return ApiResponse.error(res, "Review not found or unauthorized", 404);
        }

        if (rating !== undefined) {
            const numRating = Number(rating);
            if (isNaN(numRating) || numRating < 1 || numRating > 5) {
                return ApiResponse.error(res, "Rating must be a number between 1 and 5", 400);
            }
            review.rating = Math.round(numRating);
        }

        if (comment !== undefined) {
            if (typeof comment === "string" && comment.length > 1000) {
                return ApiResponse.error(res, "Review comment cannot exceed 1000 characters", 400);
            }
            review.comment = sanitizeComment(comment);
        }

        await review.save();
        await updateProductRating(review.productId);

        return ApiResponse.success(
            res,
            { review },
            "Review updated successfully"
        );

    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.reviewId)) {
            return ApiResponse.error(res, "Invalid review ID format", 400);
        }

        const reviewQuery = req.user.role === "admin"
            ? { _id: req.params.reviewId }
            : { _id: req.params.reviewId, userId: req.user._id };

        const review = await Review.findOne(reviewQuery);

        if (!review) {
            return ApiResponse.error(res, "Review not found or unauthorized", 404);
        }

        const productId = review.productId;
        await review.deleteOne();
        await updateProductRating(productId);

        return ApiResponse.success(
            res,
            null,
            "Review deleted successfully"
        );

    } catch (error) {
        next(error);
    }
};
