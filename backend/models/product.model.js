import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  size: { type: String },                                // Optional (e.g. "S", "M", "L", "XL" OR "40", "42")
  color: { type: String },                               // Optional (e.g. "Red", "Blue")
  barcode: { type: String, required: true, unique: true }, // Unique per variant for scanning
  stock: { type: Number, default: 0 },                   // Stock for this variant
  buyingPrice: { type: Number, required: true },         // Cost price
  sellingPrice: { type: Number, required: true },        // Sale price
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },     // e.g. "School Shirt", "Tie", "Notebook"
  category: { type: String, required: true },             // e.g. "Uniform", "Accessories", "Stationery"
  brand: { type: String },                                // e.g. "Oxford", "Dollor", "Pelikan"
  description: { type: String },                          // Optional (for details)
  variants: [variantSchema],                              // All variants (size/color/stock)
  discount: { type: Number, default: 0 },                 // Default discount on this product
  isActive: { type: Boolean, default: true },             // For soft delete / inactive products
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
