// utils/generateDepartmentToken.js
const hospitalModel = require("../models/index.model");

// Department token prefixes
const departmentPrefixes = {
   'dental': 'D',
   'dentist': 'D',
   'skin': 'S',
   'dermatology': 'S',
   'eye': 'E',
   'ophthalmology': 'E',
   // Add more department mappings as needed
};

// Default prefix for unknown departments
const getDepartmentPrefix = (departmentName) => {
   const lowerName = departmentName.toLowerCase();
   for (const [key, prefix] of Object.entries(departmentPrefixes)) {
      if (lowerName.includes(key)) {
         return prefix;
      }
   }
   return 'G'; // General prefix
};

// Generate department-specific token
const generateDepartmentToken = async (departmentId, procedureDate) => {
   try {
      // Get department details
      const department = await hospitalModel.Department.findById(departmentId);
      if (!department) {
         throw new Error('Department not found');
      }

      const dateObj = procedureDate ? new Date(procedureDate) : new Date();
      const dateString = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

      const prefix = getDepartmentPrefix(department.name);

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

      const token = `${prefix}-${nextTokenNumber}`;

      return {
         token,
         tokenNumber: nextTokenNumber,
         departmentPrefix: prefix
      };

   } catch (error) {
      console.error('Error generating department token:', error);
      throw error;
   }
};

module.exports = generateDepartmentToken; 