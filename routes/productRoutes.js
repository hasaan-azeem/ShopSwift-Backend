// server/routes/productRoutes.js
import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/dashboard/", protect, admin, upload.single("image"), createProduct);
router.put("/dashboard/:id", protect, admin, upload.single("image"), updateProduct);
router.delete("/dashboard/:id", protect, admin, deleteProduct);

export default router;
