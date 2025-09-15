// models/procedure.model.js
const mongoose = require("mongoose");

const procedureSchema = new mongoose.Schema(
   {
      patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
      patient_MRNo: { type: String, required: true },
      isExternal: { type: Boolean, default: false },
      externalPatientDetails: {
         name: String,
         contactNo: String,
         age: Number,
         gender: {
            type: String,
            enum: ['male', 'female', 'other']
         },
         address: String
      },
      token: {   type: String,   required: true},
      tokenNumber: {   type: Number,   required: true},
      departmentPrefix: {   type: String,   required: true},
      procedureName: { type: String, required: true },
      department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
      category: { type: String, required: true },
      description: { type: String },

      timing: {
         scheduledDate: { type: Date, required: true },
         duration: { type: Number } // in minutes
      },
      price: { type: Number, required: true },
      // Doctor information (stored directly, no consultation fee)
      doctor: {
         doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
         doctorName: String,
         doctorDepartment: String
      },
      status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
      notes: { type: String },
      // Billing information
      billingStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
      amountPaid: { type: Number, default: 0 },
      paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'online', 'other'] },
      paymentDate: { type: Date },
      deleted: { type: Boolean, default: false }
   },
   {
      timestamps: true,
   }
);

// Indexes for faster search
procedureSchema.index({ patient_MRNo: 1 });
procedureSchema.index({ department: 1 });
procedureSchema.index({ status: 1 });

const Procedure = mongoose.model("Procedure", procedureSchema);
module.exports = Procedure;