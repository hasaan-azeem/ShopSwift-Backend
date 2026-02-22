import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    description:  { type: String, default: "" },          // ✅ required hata diya
    price:        { type: Number, required: true, min: 0 },
    oldPrice:     { type: Number },
    category:     { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // ✅ not required
    image:        [{ url: String, altText: String }],      // ✅ array of objects
    countInStock: { type: Number, default: 0 },
    isFeatured:   { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },       // ✅ new
    isBestSeller: { type: Boolean, default: false },       // ✅ new
    sizes:        [{ type: String }],
    colors:       [{ type: String }],
    brand:        { type: String, default: "ShopSwift" },
    material:     { type: String, default: "" },
    gender:       { type: String, enum: ["Men", "Women", "Kids", "Unisex"], default: "Unisex" },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;