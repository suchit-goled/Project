import express from "express";
import productController from "../controllers/product.controller.js";
import cacheResponse from "../middleware/cache.middleware.js";

const router = express.Router();

router.get("/", productController.getProducts);

// Hot Read Caches with TTL (Deals: 5 min, Featured: 10 min, Brands/Categories: 15 min)
router.get("/featured", cacheResponse(600), productController.getFeaturedProducts);

router.get("/deals", cacheResponse(300), productController.getDeals);

router.get("/suggestions", cacheResponse(180), productController.getSuggestions);

router.get("/brands", cacheResponse(900), productController.getBrands);

router.get("/categories", cacheResponse(900), productController.getCategories);

router.get("/:id/related", cacheResponse(300), productController.getRelatedProducts);
router.get("/related/:id", cacheResponse(300), productController.getRelatedProducts);

router.get("/:id/offers", productController.getOtherSellerOffers);

router.get("/:id", productController.getProductById);

export default router;
