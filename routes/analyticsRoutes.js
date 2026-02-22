// server/routes/analyticsRoutes.js
import express from "express";
import { getSalesAnalytics } from "../controllers/analyticsController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get sales analytics (admin only)
router.get("/dashboard/sales", protect, admin, getSalesAnalytics);

export default router;
