import express from "express";
import passwordController from "../controllers/password.controller.js";

const router = express.Router();

router.post(
    "/forgot-password",
    passwordController.forgotPassword
);

export default router;