import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://shopswift-backend-kykw.onrender.com";

const toArr = (v) =>
  v
    ? Array.isArray(v)
      ? v
      : String(v)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
    : [];

const toBool = (v) => v === "true" || v === true;

const calcDiscount = (price, oldPrice, discountFromForm) => {
  if (
    discountFromForm !== undefined &&
    discountFromForm !== "" &&
    Number(discountFromForm) > 0
  ) {
    return Number(discountFromForm);
  }
  const p = Number(price);
  const op = Number(oldPrice);
  if (op > p && p > 0) {
    return Math.round(((op - p) / op) * 100);
  }
  return 0;
};

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    oldPrice,
    discount,
    category,
    countInStock,
    isFeatured,
    isNewArrival,
    isBestSeller,
    sizes,
    colors,
    brand,
    material,
    gender,
  } = req.body;

  if (!name || !price) {
    res.status(400);
    throw new Error("Name and price are required");
  }

  let categoryId = undefined;
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    categoryId = category;
  }

  const imageArr = req.file
    ? [{ url: `${BACKEND_URL}/uploads/${req.file.filename}`, altText: name }]
    : [];

  const product = await Product.create({
    name,
    description: description || "",
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    discount: calcDiscount(price, oldPrice, discount),
    category: categoryId,
    image: imageArr,
    countInStock: Number(countInStock) || 0,
    isFeatured: toBool(isFeatured),
    isNewArrival: toBool(isNewArrival),
    isBestSeller: toBool(isBestSeller),
    sizes: toArr(sizes),
    colors: toArr(colors),
    brand: brand || "ShopSwift",
    material: material || "",
    gender: gender || "Unisex",
  });

  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (req, res) => {
  const { gender, sort, search, isNewArrival, isBestSeller } = req.query;
  const filter = {};

  if (gender && gender !== "all") filter.gender = gender;
  if (search) filter.name = { $regex: search, $options: "i" };
  if (isNewArrival === "true") filter.isNewArrival = true;
  if (isBestSeller === "true") filter.isBestSeller = true;

  let query = Product.find(filter).populate("category", "name slug");
  if (sort === "price-low") query = query.sort({ price: 1 });
  else if (sort === "price-high") query = query.sort({ price: -1 });
  else query = query.sort({ createdAt: -1 });

  const products = await query;
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name slug",
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const {
    name,
    description,
    price,
    oldPrice,
    discount,
    category,
    countInStock,
    isFeatured,
    isNewArrival,
    isBestSeller,
    sizes,
    colors,
    brand,
    material,
    gender,
  } = req.body;

  if (name) product.name = name;
  if (description !== undefined) product.description = description;
  if (price) product.price = Number(price);
  if (oldPrice !== undefined)
    product.oldPrice = oldPrice ? Number(oldPrice) : undefined;
  if (category && mongoose.Types.ObjectId.isValid(category))
    product.category = category;
  if (countInStock !== undefined) product.countInStock = Number(countInStock);
  if (isFeatured !== undefined) product.isFeatured = toBool(isFeatured);
  if (isNewArrival !== undefined) product.isNewArrival = toBool(isNewArrival);
  if (isBestSeller !== undefined) product.isBestSeller = toBool(isBestSeller);
  if (sizes) product.sizes = toArr(sizes);
  if (colors) product.colors = toArr(colors);
  if (brand) product.brand = brand;
  if (material) product.material = material;
  if (gender) product.gender = gender;

  // Calculate discount cleanly using current or updated price/oldPrice
  const finalPrice = price ? Number(price) : product.price;
  const finalOldPrice = oldPrice ? Number(oldPrice) : product.oldPrice || 0;
  product.discount = calcDiscount(finalPrice, finalOldPrice, discount);

  if (req.file) {
    product.image = [
      {
        url: `${BACKEND_URL}/uploads/${req.file.filename}`,
        altText: name || product.name,
      },
    ];
  }

  const updated = await product.save();
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});
