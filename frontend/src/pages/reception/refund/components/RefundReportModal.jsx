// components/RefundReportModal.jsx
import React, { useState } from 'react';
import { FiX, FiCalendar, FiPrinter } from 'react-icons/fi';

const RefundReportModal = ({ isOpen, onClose, onGenerateReport, refunds }) => {
   const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
   const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

   if (!isOpen) return null;

   const handleSubmit = (e) => {
      e.preventDefault();
      onGenerateReport({ startDate, endDate });
   };

   const totalAmount = refunds.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0);
   const uniquePatients = new Set(refunds.map(refund => refund.patient?._id)).size;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Generate Refund Report</h2>
                  <button
                     onClick={onClose}
                     className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                     <FiX size={24} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Start Date
                        </label>
                        <div className="relative">
                           <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                           />
                           <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           End Date
                        </label>
                        <div className="relative">
                           <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                           />
                           <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                        </div>
                     </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                     <h3 className="text-sm font-medium text-blue-800 mb-2">Report Preview</h3>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <span className="text-gray-600">Total Refunds:</span>
                           <span className="font-semibold ml-2">{refunds.length}</span>
                        </div>
                        <div>
                           <span className="text-gray-600">Unique Patients:</span>
                           <span className="font-semibold ml-2">{uniquePatients}</span>
                        </div>
                        <div>
                           <span className="text-gray-600">Total Amount:</span>
                           <span className="font-semibold text-green-600 ml-2">
                              Rs. {totalAmount.toLocaleString()}
                           </span>
                        </div>
                        <div>
                           <span className="text-gray-600">Date Range:</span>
                           <span className="font-semibold ml-2">
                              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                     <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center"
                     >
                        <FiPrinter className="mr-2" />
                        Generate & Print Report
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default RefundReportModal;