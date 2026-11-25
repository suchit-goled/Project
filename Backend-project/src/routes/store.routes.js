import express from "express";
import storeController from "../controllers/store.controller.js";
import cacheResponse from "../middleware/cache.middleware.js";

const router = express.Router();

router.get("/", cacheResponse(300), storeController.getStores);
router.get("/top-rated", cacheResponse(300), storeController.getTopRatedStores);
router.get("/:slug", cacheResponse(300), storeController.getStoreBySlug);

export default router;
