const express = require("express");
const router = express.Router();
const controller =require("../controllers/index.controller")


router.post("/", controller.Billing.createBill);       // Create Bill
router.get("/", controller.Billing.getBills);          // Get All Bills
router.get("/:id", controller.Billing.getBillById);    // Get Bill by ID
router.put("/:id", controller.Billing.updateBill);     // Update Bill
router.delete("/:id", controller.Billing.deleteBill);  // Delete Bill

module.exports = router;
