// import mongoose from "mongoose";
// import slugify from "slugify";

// const categorySchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true, trim: true },
//   slug: { type: String, unique: true },
//   description: { type: String, default: "" },
//   createdAt: { type: Date, default: Date.now },
// });

// categorySchema.pre("save", function (next) {
//   if (this.isModified("name")) {
//     this.slug = slugify(this.name, { lower: true, strict: true });
//   }
//   next();
// });

// const Category = mongoose.model("Category", categorySchema);
// export default Category;

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, trim: true },
    parentId:    { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    description: { type: String },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;