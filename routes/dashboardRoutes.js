import express from "express";
import { dashboard } from "../controllers/dashboardController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, admin, dashboard);

export default router;