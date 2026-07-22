import express from "express";

import {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add", addToCart);

router.get("/:userId", getCart);

router.put("/update", updateQuantity);

router.delete("/remove", removeFromCart);

router.delete("/clear/:userId", clearCart);

export default router;