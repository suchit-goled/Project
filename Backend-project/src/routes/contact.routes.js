import express from "express";
import { handleContactMessage } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", handleContactMessage);

export default router;
