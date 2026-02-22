import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import mongoose from "mongoose";

export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const totals = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
        totalCustomers: { $addToSet: "$user" }
      }
    },
    {
      $project: {
        totalSales: 1,
        totalOrders: 1,
        totalCustomers: { $size: "$totalCustomers" }
      }
    }
  ]);

  const series = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: { day: "$_id", revenue: 1, orders: 1, _id: 0 }
    }
  ]);

  res.json({
    totals: totals[0] || { totalSales: 0, totalOrders: 0, totalCustomers: 0 },
    series
  });
});
