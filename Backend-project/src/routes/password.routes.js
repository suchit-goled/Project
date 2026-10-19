import express from "express";
import passwordController from "../controllers/password.controller.js";

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

export default router;