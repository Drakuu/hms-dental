import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DollarSign, ShoppingCart, TrendingUp, Plus, Filter,
  MoreVertical, Edit3, Trash2, Printer, Clock, X,
  Search, Loader, FileText, User, CreditCard, Package
} from "lucide-react";
import {
  fetchBills,
  updateBill,
  deleteBill
} from "../../../features/billing/billingSlice";
import BillingForm from "./components/BillingForm";
import BillSummaryCard from "./BillSummaryCard";
import PrintPreviewModal from "./components/PrintPreviewModal";
// PrintPreviewModal

const MakeBill = () => {
  const dispatch = useDispatch();
  const { items: bills, loading, error } = useSelector(state => state.billing);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  // Add this line after getting bills from Redux state
  const billsArray = Array.isArray(bills) ? bills : [];

  // Then use billsArray instead of bills everywhere in the component:

  // Calculate summary statistics
  const summary = {
    totalSales: billsArray
      .filter(bill => bill.status === "completed" || bill.status === "printed")
      .reduce((sum, bill) => sum + bill.totalAmount, 0),
    todaySales: billsArray
      .filter(bill => {
        const today = new Date().toDateString();
        const billDate = new Date(bill.createdAt).toDateString();
        return (bill.status === "completed" || bill.status === "printed") && today === billDate;
      })
      .reduce((sum, bill) => sum + bill.totalAmount, 0),
    todayProfit: billsArray
      .filter(bill => {
        const today = new Date().toDateString();
        const billDate = new Date(bill.createdAt).toDateString();
        return (bill.status === "completed" || bill.status === "printed") && today === billDate;
      })
      .reduce((sum, bill) => sum + (bill.totalAmount * 0.2), 0),
    holdBills: billsArray.filter(bill => bill.status === "hold").length
  };

  // Filter bills based on status and search
// Filter bills based on status and search
const filteredBills = billsArray.filter(bill => {
  const statusMatch = filterStatus === "all" ? true : bill.status === filterStatus;
  const searchMatch = 
    (bill.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bill._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bill.paymentMethod || '').toLowerCase().includes(searchQuery.toLowerCase());
  return statusMatch && searchMatch;
});

  // console.log("the bill filter arer ", filteredBills)

  // Handle bill status update
  const updateBillStatus = async (billId, newStatus) => {
    try {
      const billToUpdate = billsArray.find(bill => bill._id === billId);
      dispatch(updateBill({
        id: billId,
        ...billToUpdate,
        status: newStatus
      }));
    } catch (error) {
      alert("Error updating bill: " + error.message);
    }
  };

  // Handle bill deletion
  const deleteBillHandler = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      dispatch(deleteBill(billId));
    } catch (error) {
      alert("Error deleting bill: " + error.message);
    }
  };

  // Create a function to refresh bills data
  const refreshBills = () => {
    dispatch(fetchBills());
  };

  // Handle printing
  const handlePrint = (bill) => {
    setPrintData(bill);
    setShowPrintPreview(true);
  };

  // Handle bill editing
  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setIsAddModalOpen(true);
  };

  // if (loading) {
  //   return (
  //     <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
  //       <p className="text-gray-600">Loading billing data...</p>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Billing Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your bills</p>
        </div>
        <button
          className="mt-4 md:mt-0 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => {
            setSelectedBill(null);
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={20} />
          Create New Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <BillSummaryCard
          title="Total Sales"
          value={summary.totalSales}
          icon={<DollarSign className="text-primary-600" size={24} />}
          color="blue"
          formatCurrency
        />
        <BillSummaryCard
          title="Today Sales"
          value={summary.todaySales}
          icon={<ShoppingCart className="text-green-600" size={24} />}
          color="green"
          formatCurrency
        />
        <BillSummaryCard
          title="Today Profit"
          value={summary.todayProfit}
          icon={<TrendingUp className="text-emerald-600" size={24} />}
          color="emerald"
          formatCurrency
        />
        {/* <BillSummaryCard
          title="Hold Bills"
          value={summary.holdBills}
          icon={<Clock className="text-amber-600" size={24} />}
          color="amber"
        /> */}
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center">
              <Filter size={18} className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all",
              //  "hold",
                "completed", "printed"].map(status => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === status
                    ? "bg-primary-100 text-primary-700 shadow-inner"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search bills..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
            {filterStatus === "all" ? "All Bills" : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Bills`}
          </h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-3">
              {filteredBills.length} {filteredBills.length === 1 ? "bill" : "bills"}
            </span>
            <button
              onClick={() => dispatch(fetchBills())}
              className="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh bills"
            >
              <Loader size={18} />
            </button>
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={56} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No bills found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : filterStatus !== "all"
                  ? `No ${filterStatus} bills available`
                  : "Create your first bill to get started"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button
                className="mt-4 flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg mx-auto hover:bg-primary-700 transition"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={18} />
                Create New Bill
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
              {filteredBills.map((bill, index) => (
              <div key={bill._id || `bill-${index}`} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bill.status === "hold" ? "bg-amber-100 text-amber-800" :
                        bill.status === "completed" ? "bg-green-100 text-green-800" :
                          bill.status === "printed" ? "bg-primary-100 text-primary-800" :
                            "bg-gray-100 text-gray-800"
                        }`}>
                        {(bill.status || 'UNKNOWN').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 text-lg">
                      Bill #{bill._id?.slice(-6).toUpperCase() || 'N/A'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User size={16} className="mr-1" />
                        {bill.customerName || "Walk-in Customer"}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Package size={16} className="mr-1" />
                        {bill.products?.length || 0} items
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard size={16} className="mr-1" />
                        {bill.paymentMethod || "UNSPECIFIED"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">
                        PKR {bill.totalAmount ? bill.totalAmount.toFixed(2) : "0"}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        className="p-2.5 text-primary-500 hover:text-primary-700 rounded-xl hover:bg-primary-50 transition-colors"
                        onClick={() => handlePrint(bill)}
                        title="Print bill"
                      >
                        <Printer size={18} />
                      </button>

                      <button
                        className="p-2.5 text-green-500 hover:text-green-700 rounded-xl hover:bg-green-50 transition-colors"
                        onClick={() => handleEditBill(bill)}
                        title="Edit bill"
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        className="p-2.5 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                        onClick={() => deleteBillHandler(bill._id)}
                        title="Delete bill"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl">
            <BillingForm
              onClose={() => {
                setIsAddModalOpen(false);
                setSelectedBill(null);
              }}
              onSuccess={refreshBills} // Add this line
              editBill={selectedBill}
            />
          </div>
        </div>
      )}

      {showPrintPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full">
            <PrintPreviewModal
              bill={printData}
              onClose={() => setShowPrintPreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MakeBill;