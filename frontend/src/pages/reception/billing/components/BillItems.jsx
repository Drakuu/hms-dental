import {
   ShoppingCart, Minus, Plus, Trash2,
   Save, Printer, CreditCard, AlertTriangle
} from "lucide-react";

const BillItems = ({
   billItems,
   setBillItems,
   billStatus,
   subtotal,
   totalDiscount,
   netTotal,
   onClose,
   onPrint,
   onSaveBill,
   isSaving,
}) => {

   // Update item fields
   const handleUpdate = (idx, field, value) => {
      const updated = [...billItems];
      updated[idx][field] = Number(value);

      // Recalculate total
      updated[idx].total =
         updated[idx].quantity * updated[idx].price -
         updated[idx].discount;

      setBillItems(updated);
   };

   // Adjust quantity with buttons
   const adjustQuantity = (idx, amount) => {
      const updated = [...billItems];
      const newQuantity = updated[idx].quantity + amount;

      if (newQuantity < 1) {
         handleRemove(idx);
         return;
      }

      if (newQuantity > updated[idx].stock) {
         alert(`Only ${updated[idx].stock} items available in stock!`);
         return;
      }

      updated[idx].quantity = newQuantity;
      updated[idx].total =
         updated[idx].quantity * updated[idx].price -
         updated[idx].discount;

      setBillItems(updated);
   };

   // Remove item
   const handleRemove = (idx) => {
      const updated = [...billItems];
      updated.splice(idx, 1);
      setBillItems(updated);
   };

   return (
      <>
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
               <h3 className="text-lg font-semibold flex items-center">
                  <ShoppingCart size={20} className="mr-2" />
                  Bill Items {billItems.length > 0 && <span className="text-primary-600 ml-2">({billItems.length})</span>}
               </h3>
            </div>

            {billItems.length === 0 ? (
               <div className="p-10 text-center">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No products added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Scan barcode or search products to add them to the bill</p>
               </div>
            ) : (
               <div className="divide-y divide-gray-200">
                  {billItems.map((item, idx) => (
                     <div key={idx} className="p-4 flex items-center hover:bg-primary-50 transition-colors">
                        <div className="flex-1">
                           <div className="font-medium">{item.name}</div>
                           <div className="text-sm text-gray-600">
                              {item.brand && <span>{item.brand} • </span>}
                              {item.size && <span>Size: {item.size} • </span>}
                              {item.color && <span>Color: {item.color}</span>}
                           </div>
                           <div className="text-xs text-gray-500 mt-1">
                              Stock: {item.stock}
                              {item.stock <= 5 && (
                                 <span className="text-amber-600 ml-2">
                                    <AlertTriangle size={12} className="inline mr-1" />
                                    Low Stock
                                 </span>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center space-x-4">
                           {/* Price */}
                           <div className="w-20">
                              <div className="text-sm text-gray-600 mb-1">Price</div>
                              <input
                                 type="number"
                                 value={item.price}
                                 onChange={(e) => handleUpdate(idx, "price", e.target.value)}
                                 className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                                 disabled={billStatus === "hold"}
                              />
                           </div>

                           {/* Quantity */}
                           <div className="w-28">
                              <div className="text-sm text-gray-600 mb-1">Quantity</div>
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                 <button
                                    onClick={() => adjustQuantity(idx, -1)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    disabled={billStatus === "hold"}
                                 >
                                    <Minus size={16} />
                                 </button>
                                 <input
                                    type="number"
                                    min={1}
                                    max={item.stock}
                                    value={item.quantity}
                                    onChange={(e) => handleUpdate(idx, "quantity", e.target.value)}
                                    className="w-12 text-center border-x py-1"
                                    disabled={billStatus === "hold"}
                                 />
                                 <button
                                    onClick={() => adjustQuantity(idx, 1)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    disabled={billStatus === "hold"}
                                 >
                                    <Plus size={16} />
                                 </button>
                              </div>
                           </div>

                           {/* Discount */}
                           <div className="w-20">
                              <div className="text-sm text-gray-600 mb-1">Discount</div>
                              <input
                                 type="number"
                                 value={item.discount}
                                 onChange={(e) => handleUpdate(idx, "discount", e.target.value)}
                                 className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                                 disabled={billStatus === "hold"}
                              />
                           </div>

                           {/* Total */}
                           <div className="w-24 text-right">
                              <div className="text-sm text-gray-600 mb-1">Total</div>
                              <div className="font-semibold">PKR {item.total.toFixed(2)}</div>
                           </div>

                           {/* Remove button */}
                           {billStatus !== "hold" && (
                              <button
                                 onClick={() => handleRemove(idx)}
                                 className="text-red-500 hover:text-red-700 transition-colors p-2"
                              >
                                 <Trash2 size={18} />
                              </button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Bill Summary */}
         {billItems.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
               <h3 className="text-lg font-semibold mb-4">Bill Summary</h3>

               <div className="space-y-2">
                  <div className="flex justify-between">
                     <span>Subtotal:</span>
                     <span>PKR {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-red-600">
                     <span>Discount:</span>
                     <span>- PKR {totalDiscount.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-300 pt-2 mt-2 font-bold text-lg flex justify-between">
                     <span>Net Total:</span>
                     <span className="text-primary-700">PKR {netTotal.toFixed(2)}</span>
                  </div>
               </div>

               <div className="mt-6 flex flex-wrap gap-3 justify-end">
                  <button
                     className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                     onClick={onClose}
                  >
                     Cancel
                  </button>

                  {/* <button
                     onClick={() => onSaveBill("hold")}
                     disabled={isSaving}
                     className="px-6 py-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors font-medium flex items-center disabled:opacity-50"
                  >
                     {isSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                     Hold Bill
                  </button> */}

                  <button
                     onClick={onPrint}
                     className="px-6 py-3 bg-primary-600 text-white rounded-xl shadow hover:bg-primary-700 transition-colors font-medium flex items-center"
                  >
                     <Printer size={18} className="mr-2" />
                     Print Preview
                  </button>

                  <button
                     onClick={() => onSaveBill("completed")}
                     disabled={isSaving}
                     className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition-colors font-medium flex items-center disabled:opacity-50"
                  >
                     {isSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <CreditCard size={18} className="mr-2" />}
                     Complete Sale
                  </button>
               </div>
            </div>
         )}
      </>
   );
};

export default BillItems;