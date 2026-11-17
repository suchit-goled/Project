import express from "express";
import productController from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", productController.getProducts);

router.get("/featured", productController.getFeaturedProducts);

router.get("/deals", productController.getDeals);

router.get("/suggestions", productController.getSuggestions);

router.get("/brands", productController.getBrands);

router.get("/categories", productController.getCategories);

router.get("/:id/related", productController.getRelatedProducts);
router.get("/related/:id", productController.getRelatedProducts);

router.get("/:id/offers", productController.getOtherSellerOffers);

router.get("/:id", productController.getProductById);

export default router;
