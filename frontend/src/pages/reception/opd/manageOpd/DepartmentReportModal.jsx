// components/DepartmentReportModal.js
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { AiOutlineClose, AiOutlinePrinter } from "react-icons/ai";
import {
   selectAllPatients
} from "../../../../features/patient/patientSlice"
const DepartmentReportModal = ({ onClose }) => {
   const allPatients = useSelector(selectAllPatients);
   const [selectedDepartment, setSelectedDepartment] = useState("");

   // Extract unique departments from patients
   const departments = useMemo(() => {
      const deptSet = new Set();
      allPatients.forEach(patient => {
         const visits = patient.visits || [];
         visits.forEach(visit => {
            if (visit.doctor?.doctor_Department) {
               deptSet.add(visit.doctor.doctor_Department);
            }
         });
      });
      return Array.from(deptSet).sort();
   }, [allPatients]);

   // Filter patients by selected department
   const reportData = useMemo(() => {
      if (!selectedDepartment) return [];

      return allPatients.filter(patient => {
         const visits = patient.visits || [];
         return visits.some(visit =>
            visit.doctor?.doctor_Department === selectedDepartment
         );
      }).map(patient => {
         // Get the latest visit to the selected department
         const departmentVisits = (patient.visits || [])
            .filter(visit => visit.doctor?.doctor_Department === selectedDepartment)
            .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

         const latestVisit = departmentVisits[0] || {};

         return {
            ...patient,
            doctor: latestVisit.doctor,
            consultationFee: latestVisit.consultationFee || 0,
            amountPaid: latestVisit.amountPaid || 0
         };
      });
   }, [allPatients, selectedDepartment]);

   const handlePrint = () => {
      const printContent = document.getElementById('department-report-content');
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
   };

   const calculateTotal = (field) => {
      return reportData.reduce((sum, patient) => sum + (patient[field] || 0), 0);
   };

   return (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
         <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-2/3 max-h-90vh overflow-y-auto">
            {/* Header */}
            <div className="bg-primary-600 p-4 text-white rounded-t-lg flex justify-between items-center">
               <h2 className="text-xl font-bold">Department Patient Report</h2>
               <button onClick={onClose} className="text-white hover:text-gray-200">
                  <AiOutlineClose className="h-6 w-6" />
               </button>
            </div>

            {/* Content */}
            <div className="p-4">
               <div className="mb-4">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                     Select Department
                  </label>
                  <div className="flex gap-2">
                     <select
                        id="department"
                        className="block w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                     >
                        <option value="">Select a department</option>
                        {departments.map((dept) => (
                           <option key={dept} value={dept}>{dept}</option>
                        ))}
                     </select>
                  </div>
               </div>

               {reportData.length > 0 && (
                  <>
                     <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                           {selectedDepartment} Department Report ({reportData.length} patients)
                        </h3>
                        <button
                           onClick={handlePrint}
                           className="flex items-center bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700"
                        >
                           <AiOutlinePrinter className="mr-2" /> Print Report
                        </button>
                     </div>

                     {/* Printable content */}
                     <div id="department-report-content">
                        <div className="hidden print:block text-center mb-4">
                           <h1 className="text-2xl font-bold">{selectedDepartment} Department Report</h1>
                           <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200 border">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                    S.No
                                 </th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                    MR Number
                                 </th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                    Patient Name
                                 </th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                    Doctor
                                 </th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                    Consultation Fee
                                 </th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                    Amount Paid
                                 </th>
                              </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.map((patient, index) => (
                                 <tr key={patient._id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">
                                       {index + 1}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                                       {patient.patient_MRNo}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border">
                                       {patient.patient_Name}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">
                                       {patient.doctor?.user?.user_Name || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">
                                       {patient.consultationFee || 0}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">
                                       {patient.amountPaid || 0}
                                    </td>
                                 </tr>
                              ))}
                              {/* Total row */}
                              <tr className="bg-gray-50 font-bold">
                                 <td colSpan="4" className="px-4 py-2 text-right border">
                                    Total:
                                 </td>
                                 <td className="px-4 py-2 border">
                                    {calculateTotal('consultationFee')}
                                 </td>
                                 <td className="px-4 py-2 border">
                                    {calculateTotal('amountPaid')}
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </>
               )}

               {selectedDepartment && reportData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                     No patients found for {selectedDepartment} department
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 rounded-b-lg flex justify-end">
               <button
                  onClick={onClose}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
               >
                  Close
               </button>
            </div>
         </div>
      </div>
   );
};

export default DepartmentReportModal;