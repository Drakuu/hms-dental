import { X, Printer } from "lucide-react";
import ThermalPrintTemplate from "../../pos/components/ThermalPrintTemplate";

const PrintPreviewModal = ({ printData, onClose }) => {
   // Add a check for null/undefined printData
   if (!printData) {
      return (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
               <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-800">Print Preview</h2>
                     <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                     >
                        <X size={24} />
                     </button>
                  </div>
                  <div className="text-center p-10">
                     <p className="text-gray-500">Loading print data...</p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Print Preview</h2>
                  <button
                     onClick={onClose}
                     className="text-gray-500 hover:text-gray-700"
                  >
                     <X size={24} />
                  </button>
               </div>
               <ThermalPrintTemplate bill={printData} />
            </div>
         </div>
      </div>
   );
};

export default PrintPreviewModal;