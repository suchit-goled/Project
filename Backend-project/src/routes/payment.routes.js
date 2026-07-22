import express from "express";

import paymentController from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";



const router = express.Router();

router.post(
    "/create-order",
    protect,
    paymentController.createOrder
);
router.post(
    "/verify",
    protect,
    paymentController.verifyPayment
);


export default router;