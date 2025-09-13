import React, { useState, useEffect } from "react";
import {
  DollarSignIcon,
  UserIcon,
  StethoscopeIcon,
  BuildingIcon,
  PlusIcon,
  EyeIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XIcon,
  LoaderIcon
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createExpense, getExpenses, updateExpense, deleteExpense } from "../../../features/expenses/expensesSlice";
import { fetchAllDoctors } from "../../../features/doctor/doctorSlice";
import EditExpenseModal from "./Editexpense";
import DeleteExpenseModal from "./Deleteexpense";
import ExpensePDF from "./Pdfexpense";

export default function Expenses() {
  const [formData, setFormData] = useState({
    doctor: "",
    doctorWelfare: "",
    otExpenses: "",
    otherExpenses: "",
    description: "",
  });

  const [showSummary, setShowSummary] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [localExpenses, setLocalExpenses] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const dispatch = useDispatch();
  const { expenses, isLoading, isError, isSuccess, message } = useSelector((state) => state.expenses);

  const { doctors = [] } = useSelector((state) => state.doctor);
console.log({doctors})



  useEffect(() => {
    dispatch(getExpenses());
    dispatch(fetchAllDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (expenses && Array.isArray(expenses)) {
      // Filter out any null/undefined expenses
      const validExpenses = expenses.filter(expense => expense && typeof expense === 'object');
      setLocalExpenses(validExpenses);
    }
  }, [expenses]);

  useEffect(() => {
    if (isError) console.error("Error:", message);
  }, [isError, message]);

  const validateForm = () => {
    const errors = {};

    const welfare = parseFloat(formData.doctorWelfare);
    const ot = parseFloat(formData.otExpenses);
    const other = parseFloat(formData.otherExpenses);

    if (isNaN(welfare) || welfare < 0) {
      errors.doctorWelfare = "Please enter a valid welfare amount";
    }

    if (isNaN(ot) || ot < 0) {
      errors.otExpenses = "Please enter a valid OT expenses amount";
    }

    if (isNaN(other) || other < 0) {
      errors.otherExpenses = "Please enter a valid other expenses amount";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const expenseData = {
      doctor: formData.doctor || "Unassigned",
      doctorWelfare: parseFloat(formData.doctorWelfare) || 0,
      otExpenses: parseFloat(formData.otExpenses) || 0,
      otherExpenses: parseFloat(formData.otherExpenses) || 0,
      description: formData.description,
    };

    setIsCreating(true);
    try {
      const result = await dispatch(createExpense(expenseData)).unwrap();

      // Update local expenses state immediately with the new expense
      setLocalExpenses(prev => [...prev, result]);

      // Clear form and close modal
      setFormData({ doctor: "", doctorWelfare: "", otExpenses: "", otherExpenses: "", description: "" });
      setShowAddForm(false);

      // Refresh the expenses from the server to ensure consistency
      dispatch(getExpenses());

    } catch (err) {
      console.error("Create failed:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = (expense) => {
    setDeletingExpense(expense);
  };

  const handleGeneratePDF = (doctor, summary) => {
    setPdfData({ doctor, summary });
  };

  const toggleSummary = () => {
    if (!showSummary) {
      setIsSummaryLoading(true);
      // Small delay to show loading state
      setTimeout(() => {
        setIsSummaryLoading(false);
        setShowSummary(true);
      }, 300);
    } else {
      setShowSummary(false);
    }
  };

  const getDoctorSummary = () => {
    const summary = {};

    // Safely process expenses with validation
    localExpenses.forEach((expense) => {
      // Skip invalid expenses
      if (!expense || typeof expense !== 'object') return;

      const key = expense.doctor || "Unassigned";
      if (!summary[key]) {
        summary[key] = {
          total: 0,
          welfare: 0,
          ot: 0,
          other: 0,
          count: 0,
          expenses: []
        };
      }

      // Safely access properties with fallback values
      const welfare = Number(expense.doctorWelfare) || 0;
      const ot = Number(expense.otExpenses) || 0;
      const other = Number(expense.otherExpenses) || 0;

      summary[key].welfare += welfare;
      summary[key].ot += ot;
      summary[key].other += other;
      summary[key].total += welfare + ot + other;
      summary[key].count += 1;
      summary[key].expenses.push(expense);
    });

    return summary;
  };

  const getGrandTotal = () => {
    return localExpenses.reduce((total, expense) => {
      // Skip invalid expenses
      if (!expense || typeof expense !== 'object') return total;

      const welfare = Number(expense.doctorWelfare) || 0;
      const ot = Number(expense.otExpenses) || 0;
      const other = Number(expense.otherExpenses) || 0;

      return total + welfare + ot + other;
    }, 0);
  };

  return (
    <div className="w-full space-y-6">
      {/* Status Messages */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-md">
          <AlertCircleIcon className="h-5 w-5" />
          <p>{message || "An error occurred while processing your request"}</p>
        </div>
      )}

      {isSuccess && message && (
        <div className="flex items-center gap-2 p-4 bg-green-100 text-green-700 rounded-md">
          <CheckCircleIcon className="h-5 w-5" />
          <p>{message}</p>
        </div>
      )}

      {/* Card */}
      <div className="shadow-lg rounded-lg overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-1 bg-white h-16 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Hospital Expenses Management
              </h1>
              <p className="text-teal-100">
                Please fill in the expense details below
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Section title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 bg-teal-600 h-6 rounded-full" />
            <h2 className="text-lg font-semibold text-gray-800">
              Expense Information
            </h2>
          </div>

          {/* Add Expense Button */}
          <div className="flex justify-between mb-6">
            <button
              type="button"
              onClick={toggleSummary}
              className="flex items-center border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 h-10 rounded-md"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {showSummary ? "Hide Summary" : "View Summary"}
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center bg-teal-600 hover:bg-teal-700 text-white px-6 h-10 rounded-md"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Expense
            </button>
          </div>

          {/* Add Expense Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Add New Expense</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  onSubmit={handleSubmit}
                >
                  {/* Doctor */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Doctor</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 pointer-events-none" />
                      <select
                        value={formData.doctor}
                        onChange={(e) => handleInputChange("doctor", e.target.value)}
                        className="pl-10 w-full h-10 rounded-md border border-gray-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d?.user?.user_Name}>
                            {d?.user?.user_Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="relative">
                      <BuildingIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 pointer-events-none" />
                      <input
                        placeholder="Enter expense description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="pl-10 w-full h-10 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Doctor Welfare */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Doctor Welfare
                    </label>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 pointer-events-none" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.doctorWelfare}
                        onChange={(e) =>
                          handleInputChange("doctorWelfare", e.target.value)
                        }
                        className={`pl-10 w-full h-10 rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-teal-600 ${formErrors.doctorWelfare ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                    </div>
                    {formErrors.doctorWelfare && (
                      <p className="text-red-500 text-sm">{formErrors.doctorWelfare}</p>
                    )}
                  </div>

                  {/* OT Expenses */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      OT Expenses
                    </label>
                    <div className="relative">
                      <StethoscopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 pointer-events-none" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.otExpenses}
                        onChange={(e) =>
                          handleInputChange("otExpenses", e.target.value)
                        }
                        className={`pl-10 w-full h-10 rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-teal-600 ${formErrors.otExpenses ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                    </div>
                    {formErrors.otExpenses && (
                      <p className="text-red-500 text-sm">{formErrors.otExpenses}</p>
                    )}
                  </div>

                  {/* Other Expenses */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Other Expenses
                    </label>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 pointer-events-none" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.otherExpenses}
                        onChange={(e) =>
                          handleInputChange("otherExpenses", e.target.value)
                        }
                        className={`pl-10 w-full h-10 rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-teal-600 ${formErrors.otherExpenses ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                    </div>
                    {formErrors.otherExpenses && (
                      <p className="text-red-500 text-sm">{formErrors.otherExpenses}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 md:col-span-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex items-center bg-teal-600 hover:bg-teal-700 text-white px-6 h-10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        "Processing..."
                      ) : (
                        <>
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Expense
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {showSummary && (
        <div className="shadow-lg rounded-lg overflow-hidden bg-white">
          <div className="bg-teal-600 px-6 py-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-1 bg-white h-8 rounded-full" />
              <h2 className="text-xl font-bold">Expenses Summary by Doctor</h2>
            </div>
          </div>

          <div className="p-6">
            {isSummaryLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoaderIcon className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">Loading summary...</span>
              </div>
            ) : localExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No expenses found. Please add some expenses first.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(getDoctorSummary()).map(([doctor, summary]) => (
                  <div
                    key={doctor}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {doctor}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(summary.expenses[0])}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(summary.expenses[0])}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleGeneratePDF(doctor, summary)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          PDF
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-blue-600 font-medium">Doctor Welfare</p>
                        <p className="text-xl font-bold text-blue-800">
                          PKR {summary.welfare.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-green-600 font-medium">OT Expenses</p>
                        <p className="text-xl font-bold text-green-800">
                          PKR {summary.ot.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-orange-600 font-medium">
                          Other Expenses
                        </p>
                        <p className="text-xl font-bold text-orange-800">
                          PKR {summary.other.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-teal-50 p-3 rounded">
                        <p className="text-teal-600 font-medium">Total</p>
                        <p className="text-xl font-bold text-teal-800">
                          PKR {summary.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {summary.count} expense entries
                    </p>
                  </div>
                ))}

                {/* Grand Total Summary */}
                <div className="border-2 border-teal-600 rounded-lg p-6 bg-teal-50 mt-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-teal-800 mb-2">
                      Grand Total Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-blue-600 font-medium">
                          Total Doctor Welfare
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          PKR{" "}
                          {Object.values(getDoctorSummary())
                            .reduce((sum, doc) => sum + doc.welfare, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-green-600 font-medium">
                          Total OT Expenses
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          PKR{" "}
                          {Object.values(getDoctorSummary())
                            .reduce((sum, doc) => sum + doc.ot, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-orange-600 font-medium">
                          Total Other Expenses
                        </p>
                        <p className="text-2xl font-bold text-orange-800">
                          PKR{" "}
                          {Object.values(getDoctorSummary())
                            .reduce((sum, doc) => sum + doc.other, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow border-2 border-teal-600">
                        <p className="text-teal-600 font-medium">Overall Total</p>
                        <p className="text-3xl font-bold text-teal-800">
                          PKR {getGrandTotal().toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-4">
                      Total Entries: {localExpenses.length} | Doctors Involved:{" "}
                      {Object.keys(getDoctorSummary()).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          doctors={doctors}
          
          onUpdateSuccess={() => dispatch(getExpenses())}
        />
      )}

      {deletingExpense && (
        <DeleteExpenseModal
          expense={deletingExpense}
          onClose={() => setDeletingExpense(null)}
          onDeleteSuccess={() => dispatch(getExpenses())}
        />
      )}

      {pdfData && (
        <ExpensePDF
          data={pdfData}
          onClose={() => setPdfData(null)}
        />
      )}
    </div>
  );
}