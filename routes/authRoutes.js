import express from "express";
import passport from "passport";
import { register, login, getProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

// Email/Password
router.post("/register", register);
router.post("/login",    login);
router.get("/profile",  protect, getProfile);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=google" }),
  (req, res) => {
    const token = generateToken({ id: req.user._id });
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
  }
);

export default router;