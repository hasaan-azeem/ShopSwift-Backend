import express from "express";
import {
  adminLogin,
  getAllUsers,
  getAdminStats,
  getAllProducts,
  getAllOrders,
} from "../controllers/adminController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

const router = express.Router();

// ── Auth ──────────────────────────────
router.post("/login", adminLogin);

// ── Stats ─────────────────────────────
router.get("/stats", protect, admin, getAdminStats);

// ── Users ─────────────────────────────
router.get("/users", protect, admin, getAllUsers);

// ── Products ──────────────────────────
router.get("/products", protect, admin, getAllProducts);
router.post("/ping", (req, res) => {
  res.json({ ok: true });
});
router.post("/products", protect, admin, upload.single("image"), async (req, res) => {
  try {
    console.log("=== BODY ===", req.body);
    console.log("=== FILE ===", req.file);

    const {
      name, description, price, oldPrice, category,
      countInStock, isFeatured, isNewArrival, isBestSeller,
      sizes, colors, brand, material, gender,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
    const toArr  = (v) => v ? String(v).split(",").map(s => s.trim()).filter(Boolean) : [];
    const toBool = (v) => v === "true" || v === true;

    const imageArr = req.file
      ? [{ url: `${BACKEND_URL}/uploads/${req.file.filename}`, altText: name }]
      : [];

    // ✅ Category — only set if valid ObjectId
    let categoryId = undefined;
    if (category && category.length === 24) {
      categoryId = category;
    }

    const product = await Product.create({
      name,
      description:  description || "",
      price:        Number(price),
      oldPrice:     oldPrice ? Number(oldPrice) : undefined,
      category:     categoryId,
      image:        imageArr,
      countInStock: Number(countInStock) || 0,
      isFeatured:   toBool(isFeatured),
      isNewArrival: toBool(isNewArrival),
      isBestSeller: toBool(isBestSeller),
      sizes:        toArr(sizes),
      colors:       toArr(colors),
      brand:        brand || "ShopSwift",
      material:     material || "",
      gender:       gender || "Unisex",
    });

    res.status(201).json(product);
  } catch (err) {
    // ✅ Exact error frontend pe bhi dikhao
    console.error("CREATE PRODUCT ERROR:", err.message);
    res.status(500).json({ 
      message: err.message,
      field: err.errors ? Object.keys(err.errors) : null
    });
  }
});

router.put("/products/:id", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name, description, price, oldPrice, category,
      countInStock, isFeatured, isNewArrival, isBestSeller,
      sizes, colors, brand, material, gender,
    } = req.body;

    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
    const toArr  = (v) => v ? (Array.isArray(v) ? v : v.split(",").map(s => s.trim())) : undefined;
    const toBool = (v) => v === "true" || v === true;

    if (name)        product.name        = name;
    if (description) product.description = description;
    if (price)       product.price       = Number(price);
    if (oldPrice !== undefined) product.oldPrice = Number(oldPrice);
    if (category)    product.category    = category;
    if (countInStock !== undefined) product.countInStock = Number(countInStock);
    if (isFeatured   !== undefined) product.isFeatured   = toBool(isFeatured);
    if (isNewArrival !== undefined) product.isNewArrival = toBool(isNewArrival);
    if (isBestSeller !== undefined) product.isBestSeller = toBool(isBestSeller);
    if (sizes)    product.sizes    = toArr(sizes);
    if (colors)   product.colors   = toArr(colors);
    if (brand)    product.brand    = brand;
    if (material) product.material = material;
    if (gender)   product.gender   = gender;

    if (req.file) {
      product.image = [{ url: `${BACKEND_URL}/uploads/${req.file.filename}`, altText: name }];
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/products/:id", protect, admin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Categories ────────────────────────
router.get("/categories", protect, admin, async (req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  res.json(cats);
});

router.post("/categories", protect, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category already exists" });
    const cat = await Category.create({ name, description });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/categories/:id", protect, admin, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    if (req.body.name) cat.name = req.body.name;
    if (req.body.description !== undefined) cat.description = req.body.description;
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/categories/:id", protect, admin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Orders ────────────────────────────
router.get("/orders", protect, admin, getAllOrders);

router.put("/orders/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/orders/:id", protect, admin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;