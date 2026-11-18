import express from "express";
import shipmentController from "../controllers/shipment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public shipment tracking (no login required for tracking number query)
router.get("/track/:trackingNumber", shipmentController.trackShipment);

// Order shipments (protected)
router.get("/order/:orderId", protect, shipmentController.getOrderShipments);

// Update shipment status / dispatch info (Seller or Admin)
router.post("/update", protect, shipmentController.updateShipment);

export default router;
