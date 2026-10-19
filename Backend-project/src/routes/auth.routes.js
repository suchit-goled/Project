import express from "express";
import {
    registerUser,
    signup,
    loginUser,
    getProfile
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/signup", signup);
router.post("/login", loginUser);

// Protected Profile Route
router.get("/profile", protect, getProfile);

export default router;