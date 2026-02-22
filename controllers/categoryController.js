import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

// Create a category, admin only
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const exists = await Category.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({ name, description });
  res.status(201).json(category);
});

// Get all categories (public)
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// Get single category by id or slug (public)
export const getCategory = asyncHandler(async (req, res) => {
  const q = req.params.id;
  let category;
  if (q.match(/^[0-9a-fA-F]{24}$/)) {
    category = await Category.findById(q);
  } else {
    category = await Category.findOne({ slug: q });
  }
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

// Update category, admin only
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const { name, description } = req.body;
  if (name) category.name = name;
  if (description !== undefined) category.description = description;

  await category.save();
  res.json(category);
});

// Delete category, admin only
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category removed successfully" });
});

