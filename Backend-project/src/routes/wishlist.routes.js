import express from "express";

import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} from "../controllers/wishlist.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all wishlist routes
router.use(protect);

// Routes
router.post("/", addToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;