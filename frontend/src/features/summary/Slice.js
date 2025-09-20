// features/summary/summarySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
// Async thunk for fetching summary data
export const fetchSummary = createAsyncThunk(
   'summary/fetchSummary',
   async (_, { rejectWithValue }) => {
      try {
         const response = await axios.get(`${API_URL}/summary/summary`);
         return response.data.data;
      } catch (error) {
         return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary data');
      }
   }
);

const summarySlice = createSlice({
   name: 'summary',
   initialState: {
      data: null,
      filteredData: [],
      filters: {
         startDate: new Date().toISOString().split('T')[0],
         endDate: new Date().toISOString().split('T')[0],
         selectedDoctor: '',
      },
      stats: {
         totalRevenue: 0,
         hospitalRevenue: 0,
         doctorRevenue: 0,
         totalRefunds: 0
      },
      loading: false,
      error: null,
      reportModalOpen: false,
      printData: null
   },
   reducers: {
      setFilters: (state, action) => {
         state.filters = { ...state.filters, ...action.payload };
      },
      resetFilters: (state) => {
         state.filters = {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            selectedDoctor: '',
         };
      },
      applyFilters: (state) => {
         if (!state.data) return;

         const { startDate, endDate, selectedDoctor } = state.filters;
         const start = new Date(startDate);
         const end = new Date(endDate);
         end.setHours(23, 59, 59, 999);

         let totalRevenue = 0;
         let hospitalRevenue = 0;
         let doctorRevenue = 0;
         let totalRefunds = 0;

         const doctorSummaries = state.data.totalDoctors.map(doctor => {
            let doctorTotalAmount = 0;
            let doctorRefunds = 0;
            const patientNames = new Set();

            state.data.totalPatients.forEach(patient => {
               patient.visits.forEach(visit => {
                  const visitDate = new Date(visit.visitDate);

                  if (visitDate >= start && visitDate <= end &&
                     visit.doctor === doctor._id &&
                     (selectedDoctor === '' || doctor._id === selectedDoctor)) {

                     doctorTotalAmount += visit.amountPaid;
                     patientNames.add(patient.patient_Name);

                     const visitRefunds = state.data.totalRefunds.filter(
                        refund => refund.visit === visit._id
                     );

                     visitRefunds.forEach(refund => {
                        doctorRefunds += refund.refundAmount;
                        totalRefunds += refund.refundAmount;
                     });
                  }
               });
            });

            const netAmount = Math.max(0, doctorTotalAmount - doctorRefunds);
            const hospitalShare = netAmount * (doctor.doctor_Contract.hospital_Percentage / 100);
            const doctorShare = netAmount * (doctor.doctor_Contract.doctor_Percentage / 100);

            totalRevenue += netAmount;
            hospitalRevenue += hospitalShare;
            doctorRevenue += doctorShare;

            return {
               "Doctor Name": doctor?.user?.user_Name,
               "Specialization": doctor.doctor_Specialization,
               "Patient Names": Array.from(patientNames).join(', '),
               "Patient Count": patientNames.size,
               "Total Amount (PKR)": doctorTotalAmount.toFixed(2),
               "Refunds (PKR)": doctorRefunds.toFixed(2),
               "Net Amount (PKR)": netAmount.toFixed(2),
               "Hospital Share (PKR)": hospitalShare.toFixed(2),
               "Doctor Share (PKR)": doctorShare.toFixed(2),
               doctorId: doctor._id
            };
         });

         state.filteredData = doctorSummaries.filter(
            summary => summary["Patient Count"] > 0 &&
               (selectedDoctor === '' || summary.doctorId === selectedDoctor)
         );

         state.stats = {
            totalRevenue,
            hospitalRevenue,
            doctorRevenue,
            totalRefunds
         };
      },
      setReportModalOpen: (state, action) => {
         state.reportModalOpen = action.payload;
      },
      setPrintData: (state, action) => {
         state.printData = {
            data: action.payload.data,
            filters: action.payload.filters,
            stats: action.payload.stats,
            refunds: action.payload.refunds || []
         };
      }
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchSummary.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchSummary.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = null;
         })
         .addCase(fetchSummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         });
   }
});

export const {
   setFilters,
   resetFilters,
   applyFilters,
   setReportModalOpen,
   setPrintData
} = summarySlice.actions;

export default summarySlice.reducer;