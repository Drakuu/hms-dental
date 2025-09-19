import { Search, Barcode, Plus, AlertTriangle } from "lucide-react";

const ProductSearch = ({
   searchInput,
   setSearchInput,
   isSearchFocused,
   setIsSearchFocused,
   selectedProduct,
   setSelectedProduct,
   selectedVariant,
   setSelectedVariant,
   billItems,
   setBillItems,
   billStatus,
   searchRef,
   products
}) => {
   // Find products by barcode or name
   const findProducts = (input) => {
      if (!input || !products) return [];

      const searchTerm = input.toLowerCase();
      const results = [];

      // Search through all products and variants
      for (let product of products) {
         // Check if product name matches
         const nameMatch = product.name.toLowerCase().includes(searchTerm);

         // Check if any variant barcode matches
         const barcodeMatch = product.variants?.some(v =>
            v.barcode && v.barcode.toString() === input.toString()
         );

         if (nameMatch || barcodeMatch) {
            results.push(product);
         }
      }

      return results;
   };

   // Filter products for search suggestions
   const filteredProducts = findProducts(searchInput);

   // Check for low stock
   const checkLowStock = (variant) => {
      if (variant.stock <= 5) {
         alert(`Low stock alert: Only ${variant.stock} items left for this variant`);
         return true;
      }
      return false;
   };

   // Add selected product and variant to bill
   const addToBill = () => {
      if (!selectedProduct || !selectedVariant) return;

      // Check stock before adding
      if (checkLowStock(selectedVariant)) return;

      const existingIndex = billItems.findIndex(
         (i) => i.variantId === selectedVariant._id
      );

      if (existingIndex >= 0) {
         // Already in bill → increase qty
         const updated = [...billItems];
         if (updated[existingIndex].quantity < selectedVariant.stock) {
            updated[existingIndex].quantity += 1;
            updated[existingIndex].total =
               updated[existingIndex].quantity * updated[existingIndex].price -
               updated[existingIndex].discount;
            setBillItems(updated);
         } else {
            alert(`Only ${selectedVariant.stock} items available in stock!`);
         }
      } else {
         const newItem = {
            productId: selectedProduct._id,
            name: selectedProduct.name,
            brand: selectedProduct.brand,
            variantId: selectedVariant._id,
            size: selectedVariant.size,
            color: selectedVariant.color,
            price: selectedVariant.sellingPrice,
            quantity: 1,
            discount: 0,
            total: selectedVariant.sellingPrice,
            stock: selectedVariant.stock,
            barcode: selectedVariant.barcode
         };
         setBillItems([...billItems, newItem]);
      }

      // Reset selections
      setSelectedProduct(null);
      setSelectedVariant(null);
      setSearchInput("");
      if (searchRef.current) searchRef.current.focus();
   };

   // Handle search input - auto-select if barcode matches exactly
   const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchInput(value);

      // If barcode matches exactly, auto-select product and variant
      if (value.length >= 3 && products) {
         for (let product of products) {
            const variant = product.variants?.find(v =>
               v.barcode && v.barcode.toString().toLowerCase() === value.toLowerCase()
            );

            if (variant) {
               setSelectedProduct(product);
               setSelectedVariant(variant);
               setTimeout(() => addToBill(), 100); // Small delay to ensure state updates
               setSearchInput(""); // Clear the search input after adding
               break;
            }
         }
      }
   };

   // Handle search submission
   const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (selectedProduct && selectedVariant) {
         addToBill();
      } else if (filteredProducts.length === 1) {
         // Auto-select if only one product matches
         setSelectedProduct(filteredProducts[0]);
      }
   };

   return (
      <div className="mb-8">
         <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center border-2 border-blue-400 rounded-xl overflow-hidden shadow-sm">
               <div className="pl-4 pr-2 text-gray-500">
                  <Search size={20} />
               </div>
               <input
                  ref={searchRef}
                  type="text"
                  placeholder="Scan barcode or search product by name..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="flex-1 py-4 px-2 outline-none text-lg"
                  disabled={billStatus === "hold"}
               />
               <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 transition-colors"
                  disabled={billStatus === "hold"}
               >
                  <Barcode size={20} className="mr-2 inline" />
                  Search
               </button>
            </div>
         </form>

         {/* Search Suggestions */}
         {isSearchFocused && searchInput && filteredProducts.length > 0 && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full max-w-2xl max-h-64 overflow-y-auto">
               {filteredProducts.map((product) => (
                  <div
                     key={product._id}
                     className="p-3 border-b hover:bg-blue-50 cursor-pointer"
                     onMouseDown={() => setSelectedProduct(product)}
                  >
                     <div className="font-semibold">{product.name}</div>
                     <div className="text-sm text-gray-600">
                        {product.brand && <span>Brand: {product.brand} • </span>}
                        Variants: {product.variants?.length || 0}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Product Selection Panel */}
         {selectedProduct && (
            <div className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-200">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                     {selectedProduct.brand && (
                        <p className="text-gray-600">Brand: {selectedProduct.brand}</p>
                     )}
                     <p className="text-sm text-gray-600 mt-1">
                        Select a variant to add to bill
                     </p>
                  </div>
                  <button
                     onClick={() => {
                        setSelectedProduct(null);
                        setSelectedVariant(null);
                     }}
                     className="text-gray-500 hover:text-gray-700"
                  >
                     <X size={20} />
                  </button>
               </div>

               {/* Variant Selection */}
               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedProduct.variants?.map((variant) => (
                     <div
                        key={variant._id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedVariant?._id === variant._id
                           ? "border-blue-500 bg-blue-100"
                           : "border-gray-300 hover:border-blue-300"
                           }`}
                        onClick={() => setSelectedVariant(variant)}
                     >
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="font-medium">
                                 {variant.size} | {variant.color}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Barcode: {variant.barcode}
                              </div>
                              <div className="text-sm">
                                 Stock: <span className={variant.stock > 0 ? "text-green-600" : "text-red-600"}>
                                    {variant.stock}
                                 </span>
                                 {variant.stock <= 5 && variant.stock > 0 && (
                                    <span className="text-amber-600 ml-2">
                                       <AlertTriangle size={14} className="inline mr-1" />
                                       Low Stock
                                    </span>
                                 )}
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="font-semibold">PKR {variant.sellingPrice}</div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Add to Bill Button */}
               {selectedVariant && (
                  <div className="mt-4 flex justify-end">
                     <button
                        onClick={addToBill}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center font-medium"
                        disabled={selectedVariant.stock === 0 || billStatus === "hold"}
                     >
                        <Plus size={18} className="mr-2" />
                        Add to Bill {selectedVariant.stock === 0 && "(Out of Stock)"}
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default ProductSearch;