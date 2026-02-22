import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectDB from "./config/db.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import passport, { configurePassport } from "./config/passport.js";
import path from "path";

// Step 1: Load env first
dotenv.config();

// Step 2: Connect DB
connectDB();

// Step 3: Configure passport AFTER env is loaded
configurePassport();

const app = express();

// JSON body parser (skip webhook route)
app.use((req, res, next) => {
  if (req.originalUrl === "/api/orders/webhook" || req.originalUrl === "/api/orders/webhook/")
    return next();
  express.json()(req, res, next);
});

app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Session (required for passport OAuth flow)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

// Routes
app.use("/api/admin",      adminRoutes);
app.use("/api/auth",       authRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/upload",     uploadRoutes);
app.use("/api/stripe",     stripeRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use(errorHandler);

// FIX: Removed the redundant "export default stripe" that was here.
// Stripe is instantiated in orderController.js and stripeController.js directly.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));