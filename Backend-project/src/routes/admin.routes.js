import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

import adminController from "../controllers/admin.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Every admin route requires login
router.use(protect);

// Every admin route requires admin role
router.use(adminOnly);

router.get("/dashboard", adminController.dashboard);

router.get("/products", adminController.getProducts);

router.post(
    "/products",
    upload.single("image"),
    adminController.createProduct
);

router.put("/products/:id", adminController.updateProduct);

router.delete("/products/:id", adminController.deleteProduct);



router.get("/orders", adminController.getAllOrders);

router.put(
    "/orders/:id/status",
    adminController.updateOrderStatus
);

export default router;