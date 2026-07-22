import express from "express";

import {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/address.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addAddress);
router.get("/", getAddresses);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.put("/default/:id", setDefaultAddress);

export default router;