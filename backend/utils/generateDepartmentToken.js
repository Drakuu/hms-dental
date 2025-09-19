// utils/generateDepartmentToken.js
const hospitalModel = require("../models/index.model");

// Generate department-specific token for OPD visits
const generateOPDToken = async (doctorId, visitDate) => {
   try {
      // Get doctor details to find department
      const doctor = await hospitalModel.Doctor.findById(doctorId)
         .populate('doctor_Department', 'name');

      if (!doctor) {
         throw new Error('Doctor not found');
      }

      // Get department name or use 'General' as fallback
      const departmentName = doctor.doctor_Department || 'General';
      // console.log("the deparmtents is ", doctor.doctor_Department)
      // Get first two letters, uppercase, remove spaces/special chars
      const cleanDeptName = departmentName.replace(/[^a-zA-Z]/g, ''); // Remove non-letters
      const prefix = cleanDeptName.substring(0, 2).toUpperCase();

      // If department name has less than 2 letters, use 'GE' as fallback
      const finalPrefix = prefix.length >= 2 ? prefix : 'GE';

      const dateObj = visitDate ? new Date(visitDate) : new Date();
      const dateString = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

      // Find the highest token number for this department on this date
      const patients = await hospitalModel.Patient.find({
         'visits.visitDate': {
            $gte: new Date(dateString),
            $lt: new Date(new Date(dateString).getTime() + 24 * 60 * 60 * 1000)
         },
         'visits.doctor': doctorId,
         deleted: false
      });

      // Extract all tokens for this doctor today
      let maxTokenNumber = 0;
      patients.forEach(patient => {
         patient.visits.forEach(visit => {
            if (visit.doctor?.toString() === doctorId.toString() &&
               visit.visitDate >= new Date(dateString) &&
               visit.visitDate < new Date(new Date(dateString).getTime() + 24 * 60 * 60 * 1000)) {

               // Extract number from token (e.g., "EY-1" → 1)
               const tokenMatch = visit.token?.match(/-(\d+)$/);
               if (tokenMatch) {
                  const tokenNum = parseInt(tokenMatch[1]);
                  if (tokenNum > maxTokenNumber) {
                     maxTokenNumber = tokenNum;
                  }
               }
            }
         });
      });

      const nextTokenNumber = maxTokenNumber + 1;
      const token = `${finalPrefix}-${nextTokenNumber}`;

      return {
         token,
         tokenNumber: nextTokenNumber,
         departmentPrefix: finalPrefix,
         departmentName: departmentName
      };

   } catch (error) {
      console.error('Error generating OPD token:', error);
      throw error;
   }
};

// Generate department-specific token for procedures
const generateProcedureToken = async (departmentId, procedureDate) => {
   try {
      // Get department details
      const department = await hospitalModel.Department.findById(departmentId);
      if (!department) {
         throw new Error('Department not found');
      }

      // Get first two letters, uppercase, remove spaces/special chars
      const cleanDeptName = department.name.replace(/[^a-zA-Z]/g, ''); // Remove non-letters
      const prefix = cleanDeptName.substring(0, 2).toUpperCase();

      // If department name has less than 2 letters, use 'GE' as fallback
      const finalPrefix = prefix.length >= 2 ? prefix : 'GE';

      const dateObj = procedureDate ? new Date(procedureDate) : new Date();
      const dateString = dateObj.toISOString().split('T')[0];

      // Find the highest token number for this department on this date
      const procedures = await hospitalModel.Procedure.find({
         'timing.scheduledDate': {
            $gte: new Date(dateString),
            $lt: new Date(new Date(dateString).getTime() + 24 * 60 * 60 * 1000)
         },
         department: departmentId,
         deleted: false
      }).sort({ 'tokenNumber': -1 }).limit(1);

      let nextTokenNumber = 1;
      if (procedures.length > 0 && procedures[0].tokenNumber) {
         nextTokenNumber = procedures[0].tokenNumber + 1;
      }

      const token = `${finalPrefix}-${nextTokenNumber}`;

      return {
         token,
         tokenNumber: nextTokenNumber,
         departmentPrefix: finalPrefix,
         departmentName: department.name
      };

   } catch (error) {
      console.error('Error generating procedure token:', error);
      throw error;
   }
};

module.exports = {
   generateOPDToken,
   generateProcedureToken
};