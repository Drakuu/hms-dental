// components/FinancialPrintTemplate.jsx
import React from 'react';

const FinancialPrintTemplate = ({ data, filters, stats, onClose, refunds = [] }) => {
   const handlePrint = () => {
      window.print();
   };

   // Filter refunds for the selected date range and count unique patients
   const filteredRefunds = refunds.filter(refund => {
      const refundDate = new Date(refund.refundDate);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      return refundDate >= start && refundDate <= end;
   });

   // Get unique patients with refunds
   const uniqueRefundPatients = new Set(filteredRefunds.map(refund => refund.patientId || refund.patient));
   const refundPatientCount = uniqueRefundPatients.size;

   // Calculate final hospital revenue after refunds
   const finalHospitalRevenue = stats.hospitalRevenue - stats.totalRefunds;

   return (
      <div className="bg-white p-6 rounded-lg">
         <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Hospital Daily Financial Summary Report</h1>
            <p className="text-gray-600">
               {new Date(filters.startDate).toLocaleDateString()} to {new Date(filters.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
         </div>

         {/* Doctor Summary Table */}
         <h2 className="text-xl font-bold text-gray-800 mb-4">Doctor Financial Summary</h2>
         <table className="w-full border-collapse border border-gray-300 mb-8">
            <thead>
               <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Doctor</th>
                  <th className="border border-gray-300 p-2 text-left">Specialization</th>
                  <th className="border border-gray-300 p-2 text-center">Patients</th>
                  <th className="border border-gray-300 p-2 text-right">Total Amount</th>
                  <th className="border border-gray-300 p-2 text-right">Refunds</th>
                  <th className="border border-gray-300 p-2 text-right">Net Amount</th>
                  <th className="border border-gray-300 p-2 text-right">Hospital Share</th>
                  <th className="border border-gray-300 p-2 text-right">Doctor Share</th>
               </tr>
            </thead>
            <tbody>
               {data.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                     <td className="border border-gray-300 p-2">{item["Doctor Name"]}</td>
                     <td className="border border-gray-300 p-2">{item["Specialization"]}</td>
                     <td className="border border-gray-300 p-2 text-center">{item["Patient Count"]}</td>
                     <td className="border border-gray-300 p-2 text-right">{item["Total Amount (PKR)"]}</td>
                     <td className="border border-gray-300 p-2 text-right text-red-600">{item["Refunds (PKR)"]}</td>
                     <td className="border border-gray-300 p-2 text-right font-semibold">{item["Net Amount (PKR)"]}</td>
                     <td className="border border-gray-300 p-2 text-right text-green-600">{item["Hospital Share (PKR)"]}</td>
                     <td className="border border-gray-300 p-2 text-right text-purple-600">{item["Doctor Share (PKR)"]}</td>
                  </tr>
               ))}
            </tbody>
         </table>

         {/* Refunds Summary Section */}
         <h2 className="text-xl font-bold text-gray-800 mb-4">Refunds Summary</h2>
         <table className="w-full border-collapse border border-gray-300 mb-8">
            <thead>
               <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Total Refund Transactions</th>
                  <th className="border border-gray-300 p-2">Patients with Refunds</th>
                  <th className="border border-gray-300 p-2">Total Refund Amount</th>
               </tr>
            </thead>
            <tbody>
               <tr className="bg-white text-center">
                  <td className="border border-gray-300 p-2">{filteredRefunds.length}</td>
                  <td className="border border-gray-300 p-2">{refundPatientCount}</td>
                  <td className="border border-gray-300 p-2 text-red-600">{stats.totalRefunds.toFixed(2)} PKR</td>
               </tr>
            </tbody>
         </table>

         {/* Revenue Breakdown Table */}
         <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Breakdown</h2>
         <table className="w-full border-collapse border border-gray-300 mb-8">
            <thead>
               <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Total Gross Revenue</th>
                  <th className="border border-gray-300 p-2 ">Total Refunds</th>
                  <th className="border border-gray-300 p-2 ">Net Revenue (After Refunds)</th>
               </tr>
            </thead>
            <tbody>
               <tr className="bg-white text-center">
                  <td className="border border-gray-300 p-2  font-semibold">{stats.totalRevenue.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2  text-red-600">-{stats.totalRefunds.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2  font-semibold text-blue-800">
                     {(stats.totalRevenue - stats.totalRefunds).toFixed(2)}
                  </td>
               </tr>

               {/* Revenue Distribution */}
               <tr className="bg-gray-100">
                  <td className="border border-gray-300 p-2 font-bold" colSpan="2">Revenue Distribution</td>
                  <td className="border border-gray-300 p-2 font-bold text-center" colSpan="1">Notes</td>
               </tr>
               <tr className="bg-white">
                  <td className="border border-gray-300 p-2 pl-6">Doctor Share ({Math.round((stats.doctorRevenue / stats.totalRevenue) * 100)}%)</td>
                  <td className="border border-gray-300 p-2 text-right text-purple-600">+{stats.doctorRevenue.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center font-semibold text-2xl" rowSpan="3">
                     Have a great day! 😊
                  </td>
               </tr>
               <tr className="bg-gray-50">
                  <td className="border border-gray-300 p-2 pl-6">Hospital Share ({Math.round((stats.hospitalRevenue / stats.totalRevenue) * 100)}%)</td>
                  <td className="border border-gray-300 p-2 text-right text-green-600">+{stats.hospitalRevenue.toFixed(2)}</td>
               </tr>
               {/* Final Amounts */}
               <tr className="bg-gray-100">
                  <td className="border border-gray-300 p-2 font-bold">Final Hospital Revenue (After Refund Deductions)</td>
                  <td className="border border-gray-300 p-2 text-right font-bold text-green-800">
                     {finalHospitalRevenue.toFixed(2)}
                  </td>
               </tr>

            </tbody>
         </table>

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
          .no-print {
            display: none !important;
          }
          body {
            font-size: 12px;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          h2 {
            page-break-after: avoid;
          }
        }
      `}</style>
      </div>
   );
};

export default FinancialPrintTemplate;