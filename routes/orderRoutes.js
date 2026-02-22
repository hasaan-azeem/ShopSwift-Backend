// server/routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  createPaymentIntent,
  stripeWebhook,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create order (user)
router.post("/", protect, createOrder);

// Stripe payment
router.post("/create-payment-intent", protect, createPaymentIntent);

// Stripe webhook
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Get orders
router.get("/my", protect, getMyOrders);           // user orders
router.get("/", protect, admin, getOrders);       // admin all orders
router.get("/:id", getOrderById);

// Update order status (admin)
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
