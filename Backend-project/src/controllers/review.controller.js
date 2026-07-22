import Review from "../models/review.model.js";
import Product from "../models/Product.js";

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


//add review
export const addReview = async (req, res) => {

    try {

        const { productId, rating, comment } = req.body;

        const existingReview = await Review.findOne({
            userId: req.user._id,
            productId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        const review = await Review.create({
            userId: req.user._id,
            productId,
            rating,
            comment
        });

        await updateProductRating(productId);

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const getReviews = async (req, res) => {
    try {

        const reviews = await Review.find({
            productId: req.params.productId
        })
        .populate("userId", "name profileImage")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



export const updateReview = async (req, res) => {

    try {

        const { rating, comment } = req.body;

        const review = await Review.findOne({
            _id: req.params.reviewId,
            userId: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        review.rating = rating;
        review.comment = comment;

        await review.save();

        await updateProductRating(review.productId);

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




export const deleteReview = async (req, res) => {

    try {

        const review = await Review.findOne({
            _id: req.params.reviewId,
            userId: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const productId = review.productId;

        await review.deleteOne();

        await updateProductRating(productId);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};