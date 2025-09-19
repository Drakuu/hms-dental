import Bill from "../models/billing.model.js";
import Product from "../models/product.model.js";

// ✅ Create Bill
export const createBill = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const bill = new Bill(req.body);
    await bill.save();

    // If bill status is "completed" or "paid", decrease stock quantities
    if (bill.status === "completed" || bill.status === "paid") {
      await decreaseProductStock(bill.products);
    }

    res.status(201).json({ success: true, message: "Bill created successfully", data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating bill", error: error.message });
  }
};

// ✅ Update Bill
export const updateBill = async (req, res) => {
  try {
    const oldBill = await Bill.findById(req.params.id);
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    // Handle stock adjustments based on status changes
    await handleStockAdjustments(oldBill, bill);

    res.status(200).json({ success: true, message: "Bill updated successfully", data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating bill", error: error.message });
  }
};

// ✅ Get All Bills
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("products.productId").populate("createdBy");
    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bills", error: error.message });
  }
};

// ✅ Get Bill by ID
export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("products.productId")
      .populate("createdBy");

    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bill", error: error.message });
  }
};

// ✅ Delete Bill
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    // If bill was completed/paid, restore stock quantities
    if (bill.status === "completed" || bill.status === "paid") {
      await increaseProductStock(bill.products);
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting bill", error: error.message });
  }
};

// Helper function to decrease product stock
const decreaseProductStock = async (products) => {
  for (const item of products) {
    if (item.variantId) {
      // Update variant stock
      await Product.findOneAndUpdate(
        {
          _id: item.productId,
          "variants._id": item.variantId
        },
        {
          $inc: { "variants.$.stock": -item.quantity }
        }
      );
    } else {
      // Update main product stock (if no variants)
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
  }
};

// Helper function to increase product stock (for returns or cancellations)
const increaseProductStock = async (products) => {
  for (const item of products) {
    if (item.variantId) {
      // Update variant stock
      await Product.findOneAndUpdate(
        {
          _id: item.productId,
          "variants._id": item.variantId
        },
        {
          $inc: { "variants.$.stock": item.quantity }
        }
      );
    } else {
      // Update main product stock (if no variants)
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }
  }
};

// Helper function to handle stock adjustments when bill status changes
const handleStockAdjustments = async (oldBill, newBill) => {
  const oldStatus = oldBill.status;
  const newStatus = newBill.status;

  // If status changed to completed/paid, decrease stock
  if ((oldStatus !== "completed" && oldStatus !== "paid") &&
    (newStatus === "completed" || newStatus === "paid")) {
    await decreaseProductStock(newBill.products);
  }

  // If status changed from completed/paid to something else, restore stock
  else if ((oldStatus === "completed" || oldStatus === "paid") &&
    (newStatus !== "completed" && newStatus !== "paid")) {
    await increaseProductStock(oldBill.products);
  }

  // If products changed and bill was completed/paid, adjust stock accordingly
  else if ((oldStatus === "completed" || oldStatus === "paid") &&
    (newStatus === "completed" || newStatus === "paid")) {
    // First restore old quantities
    await increaseProductStock(oldBill.products);
    // Then decrease new quantities
    await decreaseProductStock(newBill.products);
  }
};