import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Not authorized, token invalid");
  }

  if (decoded.role === "admin") {
    const adminDoc = await Admin.findById(decoded.id).select("-password");
    if (!adminDoc) { res.status(401); throw new Error("Admin not found"); }
    req.user = { _id: adminDoc._id, name: adminDoc.name, email: adminDoc.email, role: "admin" };
  } else {
    const user = await User.findById(decoded.id).select("-password");
    if (!user) { res.status(401); throw new Error("User not found"); }
    req.user = user;
  }

  next();
});

export const admin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403);
  throw new Error("Admin only resource");
};