import express from "express";
import productController from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", productController.getProducts);

router.get("/featured", productController.getFeaturedProducts);

router.get("/categories", productController.getCategories);

router.get("/:id/related", productController.getRelatedProducts);
router.get("/related/:id", productController.getRelatedProducts);

router.get("/:id", productController.getProductById);

export default router;
