import express from "express";

import {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

// Specific routes FIRST
router.get("/details/:orderId", protect, getOrderById);
router.put("/cancel/:orderId", protect, cancelOrder);

// Generic route LAST
router.get("/:userId",protect, getUserOrders);

export default router;