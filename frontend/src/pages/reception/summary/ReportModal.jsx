// components/ReportModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const ReportModal = ({
   isOpen,
   onClose,
   filters,
   onFilterChange,
   onGenerateReport,
   filteredData,
   doctors = [] // Add doctors prop with default empty array
}) => {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Generate Financial Report</h2>
                  <button
                     onClick={onClose}
                     className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Date Range Selection */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                     <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => onFilterChange('startDate', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                     <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => onFilterChange('endDate', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     />
                  </div>
               </div>

               {/* Doctor Selection */}
               <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                  <select
                     value={filters.selectedDoctor}
                     onChange={(e) => onFilterChange('selectedDoctor', e.target.value)}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                     <option value="">All Doctors</option>
                     {doctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                           {doctor?.user?.user_Name || "NA"} ({doctor.doctor_Specialization})
                        </option>
                     ))}
                  </select>
               </div>

               {/* Preview Section */}
               {filteredData.length > 0 && (
                  <div className="mb-6">
                     <h3 className="text-lg font-semibold text-gray-800 mb-3">Report Preview</h3>
                     <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                           Found {filteredData.length} doctor(s) with financial data between{' '}
                           {new Date(filters.startDate).toLocaleDateString()} and{' '}
                           {new Date(filters.endDate).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
               )}

               {/* Action Buttons */}
               <div className="flex justify-end gap-3">
                  <button
                     onClick={onClose}
                     className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={onGenerateReport}
                     disabled={filteredData.length === 0}
                     className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     Generate & Print Report
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ReportModal;