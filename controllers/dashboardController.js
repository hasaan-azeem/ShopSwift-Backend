import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/catchAsync.js";
import dayjs from "dayjs";

// @route   GET /api/analytics/sales?range=7d|30d|month
// @access  Private/Admin
export const dashboardAnalytics = asyncHandler(async (req, res) => {
  const { range } = req.query;
  let startDate;

  if (range === "30d") {
    startDate = dayjs().subtract(30, "day").toDate();
  } else if (range === "month") {
    startDate = dayjs().startOf("month").toDate();
  } else {
    startDate = dayjs().subtract(7, "day").toDate();
  }

  const orders = await Order.find({
    createdAt: { $gte: startDate },
    isPaid: true,
  });

  const grouped = {};
  orders.forEach((o) => {
    const day = dayjs(o.createdAt).format("MMM DD");
    if (!grouped[day]) grouped[day] = { revenue: 0, orders: 0 };
    grouped[day].revenue += o.totalPrice;
    grouped[day].orders += 1;
  });

  const data = Object.entries(grouped).map(([day, values]) => ({
    day,
    ...values,
  }));

  res.json(data);
});

// FIX: was not exported / named consistently with dashboardRoutes.js
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const dashboard = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();

  const revenueData = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
  ]);

  res.json({
    totalOrders,
    totalProducts,
    totalUsers,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
  });
});
