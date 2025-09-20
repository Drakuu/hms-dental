// components/RefundPrintTemplate.jsx
import React from 'react';

const RefundPrintTemplate = ({ data, filters, onClose }) => {
   const handlePrint = () => {
      window.print();
   };

   const totalAmount = data.reduce((sum, refund) => sum + (refund.refundAmount || 0), 0);
   const uniquePatients = new Set(data.map(refund => refund.patient?._id)).size;

   const formatCurrency = (amount) => {
      return `Rs. ${amount?.toLocaleString() || '0'}`;
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
         return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
         });
      } catch {
         return 'Invalid Date';
      }
   };

   return (
      <div className="bg-white p-6 rounded-lg print:p-0 print:rounded-none">
         <div className="text-center mb-6 print:mb-4">
            <h1 className="text-2xl font-bold text-gray-800 print:text-xl">OPD Refund Report</h1>
            <p className="text-gray-600 print:text-sm">
               {new Date(filters.startDate).toLocaleDateString()} to {new Date(filters.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 print:text-xs">Generated on {new Date().toLocaleDateString()}</p>
         </div>

         {/* Summary Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg print:p-2">
            <div className="text-center">
               <div className="text-sm text-gray-600">Total Refunds</div>
               <div className="text-lg font-bold text-blue-800">{data.length}</div>
            </div>
            <div className="text-center">
               <div className="text-sm text-gray-600">Unique Patients</div>
               <div className="text-lg font-bold text-purple-800">{uniquePatients}</div>
            </div>
            <div className="text-center">
               <div className="text-sm text-gray-600">Total Amount</div>
               <div className="text-lg font-bold text-green-800">{formatCurrency(totalAmount)}</div>
            </div>
         </div>

         {/* Refunds Table */}
         <table className="w-full border-collapse border border-gray-300 mb-8 print:mb-4">
            <thead>
               <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left print:p-1 print:text-xs">Refund ID</th>
                  <th className="border border-gray-300 p-2 text-left print:p-1 print:text-xs">Patient</th>
                  <th className="border border-gray-300 p-2 text-left print:p-1 print:text-xs">MR Number</th>
                  <th className="border border-gray-300 p-2 text-right print:p-1 print:text-xs">Amount</th>
                  <th className="border border-gray-300 p-2 text-left print:p-1 print:text-xs">Method</th>
                  <th className="border border-gray-300 p-2 text-left print:p-1 print:text-xs">Date</th>
               </tr>
            </thead>
            <tbody>
               {data.map((refund, index) => (
                  <tr key={refund._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                     <td className="border border-gray-300 p-2 print:p-1 print:text-xs">
                        #{refund._id?.slice(-8)?.toUpperCase() || 'N/A'}
                     </td>
                     <td className="border border-gray-300 p-2 print:p-1 print:text-xs">
                        {refund.patient?.patient_Name || 'Unknown Patient'}
                     </td>
                     <td className="border border-gray-300 p-2 print:p-1 print:text-xs">
                        {refund.patient?.patient_MRNo || 'N/A'}
                     </td>
                     <td className="border border-gray-300 p-2 text-right print:p-1 print:text-xs text-green-600">
                        {formatCurrency(refund.refundAmount)}
                     </td>
                     <td className="border border-gray-300 p-2 print:p-1 print:text-xs capitalize">
                        {refund.refundMethod || 'N/A'}
                     </td>
                     <td className="border border-gray-300 p-2 print:p-1 print:text-xs">
                        {formatDate(refund.refundDate)}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         {/* Footer Summary */}
         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 print:p-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                  <span className="font-medium">Report Period:</span>
                  <span className="ml-2">
                     {new Date(filters.startDate).toLocaleDateString()} - {new Date(filters.endDate).toLocaleDateString()}
                  </span>
               </div>
               <div className="text-right">
                  <span className="font-medium">Grand Total:</span>
                  <span className="ml-2 text-green-600 font-bold">{formatCurrency(totalAmount)}</span>
               </div>
            </div>
         </div>

         {/* Print Actions */}
         <div className="mt-6 flex justify-center gap-4 no-print">
            <button
               onClick={onClose}
               className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium transition-colors"
            >
               Close
            </button>
            <button
               onClick={handlePrint}
               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
               Print Report
            </button>
         </div>

         <style jsx>{`
        @media print {
          @page {
            margin: 0;
            padding: 0;
          }
          body {
            margin: 0;
            padding: 10px;
            font-size: 12px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
      </div>
   );
};

export default RefundPrintTemplate;