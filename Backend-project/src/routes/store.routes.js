import express from "express";
import storeController from "../controllers/store.controller.js";

const router = express.Router();

router.get("/", storeController.getStores);
router.get("/top-rated", storeController.getTopRatedStores);
router.get("/:slug", storeController.getStoreBySlug);

export default router;
