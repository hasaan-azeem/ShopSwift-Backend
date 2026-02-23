import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  try {
    // Connect first, wait until fully connected
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    // Delete old admins
    await Admin.deleteMany({});
    console.log("Old admins deleted");

    // Create new admin (plain password; model hashes it)
    await Admin.create({
      name: "Super Admin",
      email: "admin@example.com",
      password: "admin123",
    });

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    // Close connection after operations
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit();
  }
};

createAdmin();