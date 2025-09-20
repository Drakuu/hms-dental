import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSummary,
  setFilters,
  resetFilters,
  applyFilters,
  setReportModalOpen,
  setPrintData
} from '../../../features/summary/Slice';
import ReportModal from './ReportModal';
import FinancialPrintTemplate from './FinancialPrintTemplate';

const Summary = () => {
  const dispatch = useDispatch();
  const {
    data,
    filteredData,
    filters,
    stats,
    loading,
    error,
    reportModalOpen,
    printData
  } = useSelector(state => state.summary);

  useEffect(() => {
    dispatch(fetchSummary());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      dispatch(applyFilters());
    }
  }, [data, filters, dispatch]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  // handleGenerateReport function:
  const handleGenerateReport = () => {
    // Prepare refund data with patient and doctor names
    const refundsWithDetails = data?.totalRefunds?.map(refund => {
      const patient = data.totalPatients.find(p => p._id === refund.patient);
      const visit = data.totalPatients.flatMap(p => p.visits).find(v => v._id === refund.visit);
      const doctor = data.totalDoctors.find(d => d._id === visit?.doctor);

      return {
        ...refund,
        patientName: patient?.patient_Name || 'Unknown',
        doctorName: doctor?.user?.user_Name || 'Unknown'
      };
    }) || [];
  
    dispatch(setPrintData({
      data: filteredData,
      filters,
      stats,
      refunds: refundsWithDetails
    }));
    dispatch(setReportModalOpen(false));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-50">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md border border-gray-100">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchSummary())}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Doctor Financial Summary</h1>
            <p className="text-gray-600 mt-1">Track revenue distribution between hospital and doctors</p>
          </div>
          <button
            onClick={() => dispatch(setReportModalOpen(true))}
            className="mt-4 md:mt-0 flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-primary-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.totalRevenue.toFixed(2)} PKR</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Hospital Share</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.hospitalRevenue.toFixed(2)} PKR</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Doctor Share</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.doctorRevenue.toFixed(2)} PKR</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Refunds</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.totalRefunds.toFixed(2)} PKR</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <button
              onClick={handleResetFilters}
              className="text-sm text-primary-500 hover:text-primary-700 flex items-center mt-2 md:mt-0 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
              <select
                value={filters.selectedDoctor}
                onChange={(e) => handleFilterChange('selectedDoctor', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              >
                <option value="">All Doctors</option>
                {data?.totalDoctors?.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor?.user?.user_Name || "NA"} ({doctor.doctor_Specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-700">No data available</h3>
              <p className="mt-2 text-gray-500">Try adjusting your filters to see results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refunds</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Share</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Share</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item["Doctor Name"]}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item["Specialization"]}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{item["Patient Count"]} patients</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{item["Total Amount (PKR)"]} PKR</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">{item["Refunds (PKR)"]} PKR</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-primary-800">{item["Net Amount (PKR)"]} PKR</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">{item["Hospital Share (PKR)"]} PKR</td>
                      <td className="px-6 py-4 whitespace-nowrap text-purple-600 font-medium">{item["Doctor Share (PKR)"]} PKR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refunds Details Section */}
        {data?.totalRefunds?.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Refund Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Reason</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.totalRefunds.map((refund, index) => {
                    const patient = data.totalPatients.find(p => p._id === refund.patient);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient ? patient.patient_Name : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {refund.originalAmount} PKR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {refund.refundAmount} PKR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {refund.refundReason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(refund.refundDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Modal */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => dispatch(setReportModalOpen(false))}
          filters={filters}
          onFilterChange={handleFilterChange}
          onGenerateReport={handleGenerateReport}
          filteredData={filteredData}
          doctors={data?.totalDoctors || []}
        />

        {/* Print Modal */}
        {printData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <FinancialPrintTemplate
                data={printData.data}
                filters={printData.filters}
                stats={printData.stats}
                refunds={printData.refunds || []}
                onClose={() => dispatch(setPrintData(null))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;