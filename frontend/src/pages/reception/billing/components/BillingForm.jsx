import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X, Save, Printer, Clock, Edit3, Loader2
} from "lucide-react";
import { fetchProducts } from "../../../../features/product/productSlice";
import { addBill, updateBill, fetchBills } from "../../../../features/billing/billingSlice";
import ProductSearch from "./ProductSearch";
import CustomerInfo from "../CustomerInfo";
import BillItems from "./BillItems";
import HoldBillsPanel from "./HoldBillsPanel";
import PrintPreviewModal from "./PrintPreviewModal";
import { toast } from "react-toastify";

const BillingForm = ({ onClose, editBill, onSuccess }) => {
  const dispatch = useDispatch();
  const { items: products, loading: productsLoading } = useSelector(state => state.products);
  const { items: bills, loading: billsLoading } = useSelector(state => state.billing);

  const [searchInput, setSearchInput] = useState("");
  const [billItems, setBillItems] = useState(editBill?.products || []);
  const [customer, setCustomer] = useState(editBill ? {
    name: editBill.customerName || "",
    phone: editBill.customerContact || "",
    email: editBill.customerEmail || ""
  } : { name: "", phone: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState(editBill?.paymentMethod || "cash");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [billStatus, setBillStatus] = useState("active");
  const [showHoldBills, setShowHoldBills] = useState(false);
  const searchRef = useRef(null);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchBills());
    dispatch(fetchProducts());
  }, [dispatch]);

  const holdBills = bills.filter(bill => bill.status === "hold");

  // Focus search input on mount
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  // Calculate totals
  const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = billItems.reduce((sum, item) => sum + item.discount, 0);
  const netTotal = subtotal - totalDiscount;

  // Load a held bill
  const loadHoldBill = (bill) => {
    setBillItems(bill.products);
    setCustomer({
      name: bill.customerName || "",
      phone: bill.customerContact || "",
      email: bill.customerEmail || ""
    });
    setPaymentMethod(bill.paymentMethod || "cash");
    setBillStatus("active");
    setShowHoldBills(false);
  };

  // Print bill (thermal printer format)
  const handlePrint = () => {
    const billData = {
      _id: editBill?._id || `temp-${Date.now()}`,
      products: billItems,
      totalAmount: netTotal,
      customerName: customer.name,
      customerContact: customer.phone,
      customerEmail: customer.email,
      paymentMethod: paymentMethod,
      status: "printed",
      createdAt: editBill?.createdAt || new Date().toISOString()
    };

    setPrintData(billData);
    setShowPrintPreview(true);
  };

  // Save bill (either hold or complete)
  const saveBill = async (status = "printed") => {
    if (billItems.length === 0) {
      toast.info("Please add at least one product to the bill");
      return;
    }

    setIsSaving(true);

    const billData = {
      products: billItems,
      totalAmount: netTotal,
      customerName: customer.name,
      customerContact: customer.phone,
      customerEmail: customer.email,
      paymentMethod: paymentMethod,
      status: status
    };

    try {
      if (editBill) {
        dispatch(updateBill({
          id: editBill._id,
          ...billData
        }));
      } else {
        dispatch(addBill(billData));
      }

      if (status === "hold") {
        toast.success('Bill saved as hold successfully!');
        setBillStatus("hold");
      } else {
        toast.success(editBill ? 'Bill updated successfully!' : 'Bill created successfully!');
        
        // Call the onSuccess callback to refresh data in parent
        if (onSuccess) {
          onSuccess();
        }

        onClose();
        
      }
    } catch (error) {
      toast.error('Error saving bill: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {editBill ? "Edit Bill" : "Create New Bill"}
              </h1>
              <p className="text-primary-100">Add products and complete the transaction</p>
            </div>
            <div className="flex items-center space-x-3">
              {billStatus === "hold" && (
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Clock size={16} className="mr-1" /> On Hold
                </span>
              )}
              <button
                onClick={onClose}
                className="text-white hover:text-primary-200 transition-colors"
              >
                <X size={28} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            {/* <div className="flex space-x-2">
              <button
                onClick={() => setShowHoldBills(!showHoldBills)}
                className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg flex items-center hover:bg-primary-200 transition-colors"
              >
                <Clock size={18} className="mr-2" />
                Hold Bills ({holdBills.length})
              </button>
            </div> */}
            <div className="flex space-x-2">
              {billStatus === "hold" && (
                <button
                  onClick={() => setBillStatus("active")}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-200 transition-colors"
                >
                  <Edit3 size={18} className="mr-2" />
                  Edit Bill
                </button>
              )}
              {/* <button
                onClick={() => saveBill("hold")}
                disabled={billItems.length === 0 || isSaving}
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg flex items-center hover:bg-amber-200 transition-colors disabled:opacity-50" >
                {isSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                Hold Bill
              </button> */}
            </div>
          </div>

          {/* Hold Bills Panel */}
          {showHoldBills && (
            <HoldBillsPanel
              holdBills={holdBills}
              onLoadBill={loadHoldBill}
              onClose={() => setShowHoldBills(false)}
            />
          )}

          {/* Search Component */}
          <ProductSearch
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            billItems={billItems}
            setBillItems={setBillItems}
            billStatus={billStatus}
            searchRef={searchRef}
            products={products}
          />

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-1 space-y-6">
              <CustomerInfo
                customer={customer}
                setCustomer={setCustomer}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                billStatus={billStatus}
              />
            </div>

            {/* Bill Items */}
            <div className="lg:col-span-2">
              <BillItems
                billItems={billItems}
                setBillItems={setBillItems}
                billStatus={billStatus}
                subtotal={subtotal}
                totalDiscount={totalDiscount}
                netTotal={netTotal}
                onClose={onClose}
                onPrint={handlePrint}
                onSaveBill={saveBill}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <PrintPreviewModal
          printData={printData}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
    </>
  );
};

export default BillingForm;