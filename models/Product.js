import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // yeh add karo
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    image: [{ url: String, altText: String }],
    countInStock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    brand: { type: String, default: "ShopSwift" },
    material: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["Men", "Women", "Kids", "Unisex"],
      default: "Unisex",
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
