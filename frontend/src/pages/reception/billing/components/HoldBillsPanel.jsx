import { Clock, X } from "lucide-react";

const HoldBillsPanel = ({ holdBills, onLoadBill, onClose }) => {
   return (
      <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
               <Clock size={20} className="mr-2" />
               Hold Bills
            </h3>
            <button onClick={onClose}>
               <X size={20} />
            </button>
         </div>

         {holdBills.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bills on hold</p>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
               {holdBills.map((bill) => (
                  <div key={bill._id} className="bg-white p-3 rounded-lg border border-gray-200">
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="font-medium">
                              Bill #{bill._id.slice(-6)}
                           </div>
                           <div className="text-sm text-gray-600">
                              {bill.customerName || "Walk-in Customer"}
                           </div>
                           <div className="text-sm">
                              Total: PKR {bill.totalAmount.toFixed(2)}
                           </div>
                        </div>
                        <button
                           onClick={() => onLoadBill(bill)}
                           className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
                        >
                           Load
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default HoldBillsPanel;