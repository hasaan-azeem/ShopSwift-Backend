// server/routes/uploadRoutes.js
import express from "express";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;
  const fileUrl = `${req.protocol}://${req.get("host")}${filePath}`;

  res.json({
    message: "File uploaded successfully",
    file: {
      filename: req.file.filename,
      path: filePath,
      url: fileUrl,
    },
  });
});

export default router;
