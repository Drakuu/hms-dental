import { User, CreditCard } from "lucide-react";

const CustomerInfo = ({ customer, setCustomer, paymentMethod, setPaymentMethod, billStatus }) => {
   return (
      <>
         {/* Customer Info */}
         <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
               <User size={20} className="mr-2" />
               Customer Information
            </h3>
            <div className="space-y-3">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                     type="text"
                     placeholder="Customer name"
                     value={customer.name}
                     onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     disabled={billStatus === "hold"}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                     type="number"
                     placeholder="Phone number"
                     value={customer.phone}
                     onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     disabled={billStatus === "hold"}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <input
                     type="email"
                     placeholder="Email address"
                     value={customer.email}
                     onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     disabled={billStatus === "hold"}
                  />
               </div>
            </div>
         </div>

         {/* Payment Method */}
         <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
               <CreditCard size={20} className="mr-2" />
               Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-2">
               {["cash", "card", "bank transfer", "jazzcash", "easypaisa"].map((method) => (
                  <button
                     key={method}
                     className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${paymentMethod === method
                           ? "bg-primary-600 text-white"
                           : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                     onClick={() => setPaymentMethod(method)}
                     disabled={billStatus === "hold"}
                  >
                     {method.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
               ))}
            </div>
         </div>
      </>
   );
};

export default CustomerInfo;