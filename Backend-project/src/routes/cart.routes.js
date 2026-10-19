import express from "express";
import {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.put("/update", updateQuantity);
router.delete("/remove", removeFromCart);
router.delete("/clear/:userId", clearCart);

export default router;