import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { sellerOnly } from "../middleware/seller.middleware.js";
import sellerController from "../controllers/seller.controller.js";
import commissionController from "../controllers/commission.controller.js";

const router = express.Router();

// Onboarding & Registration (authenticated users)
router.post("/register", protect, sellerController.register);
router.get("/profile", protect, sellerController.getProfile);

// Store Management
router.put("/store", protect, sellerOnly, sellerController.updateStore);

// Dashboard Analytics
router.get("/dashboard", protect, sellerOnly, sellerController.getDashboard);

// Sub-Orders & Fulfillment
router.get("/orders", protect, sellerOnly, sellerController.getOrders);
router.get("/orders/:id", protect, sellerOnly, sellerController.getOrderById);
router.put("/orders/:id/status", protect, sellerOnly, sellerController.updateOrderStatus);

// Financial Ledger & Payouts
router.get("/earnings", protect, sellerOnly, sellerController.getEarnings);
router.get("/payouts", protect, sellerOnly, commissionController.getSellerPayouts);

// Product Catalog & Inventory Management (Tenant Isolation Guarded)
router.get("/products", protect, sellerOnly, sellerController.getProducts);
router.post("/products", protect, sellerOnly, sellerController.createProduct);
router.put("/products/:id", protect, sellerOnly, sellerController.updateProduct);
router.delete("/products/:id", protect, sellerOnly, sellerController.deleteProduct);

export default router;
