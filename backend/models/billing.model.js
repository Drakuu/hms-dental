import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      variantId: { type: mongoose.Schema.Types.ObjectId },      // Specific variant (size/color)
      name: { type: String, required: true },                   // "School Shirt"
      size:{type:String },                                   // "M"
      color: { type: String },                                  // "Blue"
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },                  // Selling price at billing
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },                  // (price - discount) * qty
      barcode: { type: String },                                // scanned barcode
    }
  ],
  totalAmount: { type: Number, required: true },     
   customerName: { type: String, trim: true },                   // optional
  customerContact: { type: String, trim: true },            // Final bill
  status: { type: String, },
  paymentMethod: { type: String, },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // cashier/admin
}, { timestamps: true });

export default mongoose.model("Bill", billSchema);
