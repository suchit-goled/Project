import express from "express";
import passwordController from "../controllers/password.controller.js";
import { changePassword } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/forgot-password",
    passwordController.forgotPassword
);

router.post(
    "/reset-password",
    passwordController.resetPassword
);

router.post(
    "/reset-password/:token",
    passwordController.resetPassword
);

router.post(
    "/change-password",
    protect,
    changePassword
);

export default router;
