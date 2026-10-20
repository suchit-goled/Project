import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

import adminController from "../controllers/admin.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Every admin route requires login & admin privileges
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Products
router.get("/products", adminController.getProducts);
router.post("/products", upload.single("image"), adminController.createProduct);
router.post("/add-product", upload.single("image"), adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);
router.delete("/delete-product/:id", adminController.deleteProduct);

// Orders
router.get("/orders", adminController.getAllOrders);
router.put("/orders/:id/status", adminController.updateOrderStatus);

// Users
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/update-role/:id", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);
router.delete("/delete-user/:id", adminController.deleteUser);

// Carts
router.get("/carts", adminController.getAllCarts);

export default router;
