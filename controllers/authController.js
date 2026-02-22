import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { validateRegister, validateLogin } from "../validations/authValidation.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const v = validateRegister(req.body);
  if (!v.ok) { res.status(400); throw new Error(v.message); }

  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error("User already exists"); }

  const user = await User.create({ name, email, password });
  const token = generateToken({ id: user._id });

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
    }
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const v = validateLogin(req.body);
  if (!v.ok) { res.status(400); throw new Error(v.message); }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    const token = generateToken({ id: user._id });
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      }
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// GET /api/auth/profile
// FIX: Use req.user set by authMiddleware. No second DB lookup needed.
export const getProfile = asyncHandler(async (req, res) => {
  const u = req.user;
  if (!u) { res.status(404); throw new Error("User not found"); }

  res.json({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || null,
    createdAt: u.createdAt,
  });
});
