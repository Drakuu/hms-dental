// controllers/procedure.controller.js
const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex");

// Create a new procedure
const createProcedure = async (req, res) => {
   try {
      const {
         patient_MRNo, // Optional: only for existing patients
         procedureName,
         department,
         category,
         description,
         timing,
         price,
         doctor,
         notes,
         externalPatientDetails
      } = req.body;

      // Validate required fields (EXCLUDE patient_MRNo from required fields)
      const missingFields = [];
      if (!procedureName) missingFields.push("procedureName");
      if (!department) missingFields.push("department");
      if (!category) missingFields.push("category");
      if (!price) missingFields.push("price");

      if (missingFields.length > 0) {
         return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(", ")}`,
         });
      }

      let patient = null;
      let isExternal = false;
      let finalPatientMRNo = patient_MRNo; // This will be either provided or generated

      // Check if patient exists (only if MR number was provided)
      if (patient_MRNo) {
         patient = await hospitalModel.Patient.findOne({
            patient_MRNo,
            deleted: false
         });
      }

      // If patient doesn't exist or no MR number provided, treat as external patient
      if (!patient) {
         isExternal = true;

         if (!externalPatientDetails?.name || !externalPatientDetails?.contactNo) {
            return res.status(400).json({
               success: false,
               message: "External patient details (name and contact number) are required for new patients",
            });
         }

         // Generate MR number for external patient
         finalPatientMRNo = await utils.generateUniqueMrNo(new Date().toISOString().split('T')[0]);

         // Check if generated MR number already exists (unlikely but possible)
         const existingWithGeneratedMR = await hospitalModel.Patient.findOne({
            patient_MRNo: finalPatientMRNo,
            deleted: false
         });

         if (existingWithGeneratedMR) {
            // Regenerate if collision occurs (very rare)
            finalPatientMRNo = await utils.generateUniqueMrNo(new Date().toISOString().split('T')[0]);
         }

         // Create minimal patient record
         patient = await hospitalModel.Patient.create({
            patient_MRNo: finalPatientMRNo,
            patient_Name: externalPatientDetails.name,
            patient_ContactNo: externalPatientDetails.contactNo,
            patient_Age: externalPatientDetails.age || 0,
            patient_Gender: externalPatientDetails.gender,
            isExternal: true
         });
      }

      // Generate department token
      const tokenData = await utils.generateDepartmentToken(department, timing.scheduledDate);

      // Create visit record for the patient
      const visitData = {
         visitDate: new Date(timing.scheduledDate),
         doctor: doctor?.doctorId || null,
         purpose: `Procedure: ${procedureName}`,
         disease: description || '',
         doctorFee: 0, // No consultation fee for procedures
         discount: 0,
         totalFee: 0,
         amountPaid: 0,
         amountDue: 0,
         amountStatus: 'paid',
         paymentMethod: 'cash',
         verbalConsentObtained: true,
         token: tokenData.token,
         referredBy: notes || ''
      };

      // Add visit to patient record
      patient.visits.push(visitData);
      patient.totalVisits += 1;
      patient.lastVisit = new Date(timing.scheduledDate);
      await patient.save();

      // Create the procedure
      const procedure = await hospitalModel.Procedure.create({
         patient: patient._id,
         patient_MRNo: patient.patient_MRNo, // Use the patient's MR number
         isExternal,
         externalPatientDetails: isExternal ? externalPatientDetails : undefined,
         procedureName,
         department,
         category,
         description,
         timing,
         price,
         doctor,
         notes,
         token: tokenData.token,
         tokenNumber: tokenData.tokenNumber,
         departmentPrefix: tokenData.departmentPrefix
      });

      const populatedProcedure = await hospitalModel.Procedure.findById(procedure._id)
         .populate('patient', 'patient_MRNo patient_Name patient_ContactNo patient_Age patient_Gender')
         .populate('department', 'name')
         .populate('doctor.doctorId', 'doctor_Department doctor_Specialization user')
         .populate({
            path: 'doctor.doctorId',
            populate: {
               path: 'user',
               select: 'user_Name user_Email user_Contact'
            }
         });

      return res.status(201).json({
         success: true,
         message: "Procedure created successfully",
         information: {
            procedure: populatedProcedure,
            patient: {
               _id: patient._id,
               patient_MRNo: patient.patient_MRNo,
               patient_Name: patient.patient_Name,
               totalVisits: patient.totalVisits
            }
         },
      });

   } catch (error) {
      console.error("Error creating procedure:", error);
      return res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};

// Get procedures by patient MR Number
const getProceduresByMRNo = async (req, res) => {
   try {
      const { patient_MRNo } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const query = {
         patient_MRNo,
         deleted: false
      };

      if (status) query.status = status;

      const skip = (page - 1) * limit;

      const procedures = await hospitalModel.Procedure.find(query)
         .populate('patient', 'patient_MRNo patient_Name patient_ContactNo patient_Age patient_Gender')
         .populate('department', 'name')
         .sort({ 'timing.scheduledDate': -1 })
         .skip(skip)
         .limit(parseInt(limit));

      const totalProcedures = await hospitalModel.Procedure.countDocuments(query);

      return res.status(200).json({
         success: true,
         message: "Procedures retrieved successfully",
         information: {
            procedures,
            pagination: {
               currentPage: parseInt(page),
               totalPages: Math.ceil(totalProcedures / limit),
               totalProcedures,
               hasNext: page < Math.ceil(totalProcedures / limit),
               hasPrev: page > 1,
               limit: parseInt(limit)
            }
         },
      });
   } catch (error) {
      console.error("Error fetching procedures:", error);
      return res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};

// Get all procedures with filtering
const getAllProcedures = async (req, res) => {
   try {
      const { patient_MRNo, department, status, category, page = 1, limit = 10, } = req.query;

      const query = { deleted: false };
      if (patient_MRNo) query.patient_MRNo = patient_MRNo;
      if (department) query.department = department;
      if (status) query.status = status;
      if (category) query.category = category;

      const skip = (page - 1) * limit;

      const procedures = await hospitalModel.Procedure.find(query)
         .populate('patient', 'patient_MRNo patient_Name patient_ContactNo patient_Age patient_Gender')
         .populate('department', 'name')
         .sort({ 'timing.scheduledDate': -1 })
         .skip(skip)
         .limit(parseInt(limit));

      const totalProcedures = await hospitalModel.Procedure.countDocuments(query);

      return res.status(200).json({
         success: true,
         message: "Procedures retrieved successfully",
         information: {
            procedures,
            pagination: {
               currentPage: parseInt(page),
               totalPages: Math.ceil(totalProcedures / limit),
               totalProcedures,
               hasNext: page < Math.ceil(totalProcedures / limit),
               hasPrev: page > 1,
               limit: parseInt(limit)
            }
         },
      });
   } catch (error) {
      console.error("Error fetching procedures:", error);
      return res.status(500).json({ success: false, message: error.message });
   }
};

// Single update function for all procedure updates
const updateProcedure = async (req, res) => {
   try {
      const { procedureId } = req.params;
      const updateData = req.body;

      const procedure = await hospitalModel.Procedure.findOne({
         _id: procedureId,
         deleted: false
      });

      if (!procedure) {
         return res.status(404).json({
            success: false,
            message: "Procedure not found",
         });
      }

      // Handle status updates
      if (updateData.status && !['scheduled', 'in-progress', 'completed', 'cancelled'].includes(updateData.status)) {
         return res.status(400).json({
            success: false,
            message: "Invalid status value",
         });
      }

      // Handle payment updates
      if (updateData.amountPaid !== undefined) {
         procedure.amountPaid = updateData.amountPaid;
         procedure.paymentMethod = updateData.paymentMethod || procedure.paymentMethod;
         procedure.paymentDate = new Date();

         // Update billing status
         if (procedure.amountPaid >= procedure.price) {
            procedure.billingStatus = 'paid';
         } else if (procedure.amountPaid > 0) {
            procedure.billingStatus = 'partial';
         } else {
            procedure.billingStatus = 'pending';
         }
      }

      // Update other fields
      const allowedFields = ['procedureName', 'department', 'category', 'description',
         'timing', 'price', 'doctor', 'notes', 'status'];

      allowedFields.forEach(field => {
         if (updateData[field] !== undefined) {
            procedure[field] = updateData[field];
         }
      });

      await procedure.save();

      const populatedProcedure = await hospitalModel.Procedure.findById(procedure._id)
         .populate('patient', 'patient_MRNo patient_Name patient_ContactNo patient_Age patient_Gender')
         .populate('department', 'name');

      return res.status(200).json({
         success: true,
         message: "Procedure updated successfully",
         information: { procedure: populatedProcedure },
      });

   } catch (error) {
      console.error("Error updating procedure:", error);
      return res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};

// Delete procedure (soft delete)
const deleteProcedure = async (req, res) => {
   try {
      const { procedureId } = req.params;

      const procedure = await hospitalModel.Procedure.findById(procedureId);
      if (!procedure) {
         return res.status(404).json({
            success: false,
            message: "Procedure not found.",
         });
      }

      procedure.deleted = true;
      await procedure.save();

      return res.status(200).json({
         success: true,
         message: "Procedure deleted successfully.",
      });
   } catch (error) {
      console.error("Error deleting procedure:", error);
      return res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};

const procedure = {
   createProcedure,
   getProceduresByMRNo,
   getAllProcedures,
   updateProcedure,
   deleteProcedure
};

module.exports = procedure;