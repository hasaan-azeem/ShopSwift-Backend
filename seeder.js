import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const createAdmin = async () => {
  try {
    // Pehle purana admin delete karo (agar double hash wala ho)
    await Admin.deleteMany({});
    console.log("Old admins deleted");

    // ✅ Password plain text do — model ka pre save hook hash kar dega
    await Admin.create({
      name: "Super Admin",
      email: "admin@example.com",
      password: "admin123",  // ✅ plain text — model hash karega
    });

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    process.exit();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

createAdmin();