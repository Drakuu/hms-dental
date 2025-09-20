// OpdRefundList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getAllRefunds,
  selectRefunds,
  selectRefundLoading,
  selectRefundError,
  clearError,
  setFilters,
  clearFilters
} from '../../../features/refund/refundopdSlice';
import { FiSearch, FiFilter, FiCalendar, FiDollarSign, FiUser, FiFileText, FiPrinter } from 'react-icons/fi';
import { format, startOfDay, endOfDay, isToday, isYesterday, parseISO } from 'date-fns';
import { getRoleRoute } from "../../../utils/getRoleRoute"
import RefundReportModal from './components/RefundReportModal';
import RefundPrintTemplate from './RefundPrintTemplate';

const OpdRefundList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const refunds = useSelector(selectRefunds);
  const loading = useSelector(selectRefundLoading);
  const error = useSelector(selectRefundError);

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    dispatch(getAllRefunds());
  }, [dispatch]);

  useEffect(() => {
    const filters = {};

    // Date filters
    if (startDateFilter) {
      filters.startDate = startOfDay(new Date(startDateFilter)).toISOString();
    }

    if (endDateFilter) {
      filters.endDate = endOfDay(new Date(endDateFilter)).toISOString();
    }

    // Status filter
    if (statusFilter) {
      filters.status = statusFilter;
    }

    if (searchQuery) {
      filters.patientMRNo = searchQuery;
    }

    dispatch(setFilters(filters));
    dispatch(getAllRefunds(filters));
  }, [startDateFilter, endDateFilter, statusFilter, dispatch]);

  const handleSearch = () => {
    const filters = {};
    if (searchQuery) {
      filters.patientMRNo = searchQuery;
    }

    if (startDateFilter) {
      filters.startDate = startOfDay(new Date(startDateFilter)).toISOString();
    }

    if (endDateFilter) {
      filters.endDate = endOfDay(new Date(endDateFilter)).toISOString();
    }

    dispatch(setFilters(filters));
    dispatch(getAllRefunds(filters));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDateFilter('');
    setEndDateFilter('');
    setStatusFilter('');
    dispatch(clearFilters());
    dispatch(getAllRefunds());
  };

  const handleGenerateReport = async (dateRange) => {
    const filters = {
      startDate: startOfDay(new Date(dateRange.startDate)).toISOString(),
      endDate: endOfDay(new Date(dateRange.endDate)).toISOString()
    };

    await dispatch(getAllRefunds(filters));
    setPrintData({
      data: refunds,
      filters: dateRange
    });
    setShowReportModal(false);
    setShowPrintModal(true);
  };

  const handleRefundClick = (refund) => {
    // Navigate to refund detail page with patient data
    navigate(getRoleRoute(`/refund/details/${refund._id}`), {
      state: {
        refund,
        patientData: refund.patient
      }
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'online': return 'Online';
      default: return method || 'N/A';
    }
  };

  // Calculate daily totals
  const dailyTotal = refunds.reduce((total, refund) => total + (refund.refundAmount || 0), 0);
  const approvedTotal = refunds
    .filter(refund => refund.status === 'approved' || refund.status === 'processed')
    .reduce((total, refund) => total + (refund.refundAmount || 0), 0);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <FiFileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Refunds</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearError())}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-primary-600 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <div className="h-12 w-1 bg-primary-300 mr-4 rounded-full"></div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">OPD Refund Management</h1>
                <p className="text-primary-100 mt-1">View and manage outpatient department refunds</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center">
                  <FiDollarSign className="h-5 w-5 text-white mr-2" />
                  <span className="text-sm">Daily Refunds</span>
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(dailyTotal)}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center">
                  <FiUser className="h-5 w-5 text-white mr-2" />
                  <span className="text-sm">Total Refunds</span>
                </div>
                <p className="text-xl font-bold text-white">{refunds.length}</p>
              </div>

            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by MR Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter MR number..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <FiSearch
                  className="absolute left-3 top-3 text-gray-400 cursor-pointer"
                  onClick={handleSearch}
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processed">Processed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end space-x-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full h-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 rounded transition-colors px-4 py-2"
              >
                <FiPrinter className="h-5 w-5 mr-2" />
                <span className="text-sm">Generate Report</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <RefundReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onGenerateReport={handleGenerateReport}
          refunds={refunds}
        />
      )}

      {showPrintModal && printData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <RefundPrintTemplate
              data={printData.data}
              filters={printData.filters}
              onClose={() => setShowPrintModal(false)}
            />
          </div>
        </div>
      )}

      {/* Refunds List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Refund Records ({refunds.length})
          </h2>
          {(startDateFilter || endDateFilter) && (
            <p className="text-sm text-gray-600">
              Showing refunds from {startDateFilter || 'the beginning'} to {endDateFilter || 'now'}
            </p>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading refund records...</p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No refund records found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || statusFilter || startDateFilter || endDateFilter
                ? 'Try adjusting your search filters'
                : 'No refunds have been processed yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {refunds.map((refund) => (
                  <tr
                    key={refund._id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRefundClick(refund)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{refund._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Visit: {refund.visit?.slice(-6) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {refund.patient?.patient_Name || 'Unknown Patient'}
                      </div>
                      <div className="text-sm text-gray-500">
                        MR: {refund.patient?.patient_MRNo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(refund.refundAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Original: {formatCurrency(refund.originalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${refund.status === 'approved' || refund.status === 'processed'
                          ? 'bg-green-100 text-green-800'
                          : refund.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {refund.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPaymentMethodBadge(refund.refundMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(refund.refundDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefundClick(refund);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        {refunds.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {refunds.length} refund records
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Grand Total:</span> {formatCurrency(dailyTotal)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpdRefundList;