import express from "express";

import {
    addReview,
    getReviews,
    updateReview,
    deleteReview,
} from "../controllers/review.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.get("/:productId", getReviews);

// Protected
router.post("/", protect, addReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;