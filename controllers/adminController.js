import asyncHandler from "../utils/catchAsync.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Admin Login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({
    id: admin._id,
    name: admin.name,
    email: admin.email,
    token,
  });
});

// ✅ Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// ✅ Admin dashboard stats
export const getAdminStats = asyncHandler(async (req, res) => {
  const { range = "30d" } = req.query;

  let startDate = new Date();
  if (range === "7d")   startDate.setDate(startDate.getDate() - 7);
  else if (range === "90d")  startDate.setDate(startDate.getDate() - 90);
  else if (range === "all")  startDate = new Date(0);
  else startDate.setDate(startDate.getDate() - 30);

  const [totalOrders, totalProducts, totalUsers, revenueData, salesData, recentOrders] =
    await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sales: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", sales: 1, orders: 1, _id: 0 } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
    ]);

  res.json({
    totalOrders,
    totalProducts,
    totalCustomers: totalUsers,
    totalRevenue: revenueData[0]?.total || 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    productGrowth: 0,
    customerGrowth: 0,
    salesData,
    recentOrders: recentOrders.map((o) => ({
      orderId: o._id,
      userName: o.user?.name || "Guest",
      total: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt,
    })),
  });
});

// ✅ Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("category", "name")
    .sort({ createdAt: -1 });
  res.json(products);
});

// ✅ Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(
    orders.map((o) => ({
      _id: o._id,
      userName: o.user?.name,
      email: o.user?.email,
      total: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt,
      items: o.orderItems,
      shippingAddress: o.shippingAddress,
    }))
  );
});