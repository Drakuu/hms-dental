import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
   const jwtLoginToken = localStorage.getItem("jwtLoginToken");
   if (!jwtLoginToken) {
      console.warn("JWT token not found in localStorage!");
      throw new Error('No JWT token found. Please log in.');
   }
   return {
      headers: {
         Authorization: `Bearer ${jwtLoginToken}`,
      },
   };
};


// Async thunks for billing
export const fetchBills = createAsyncThunk(
  "billing/fetchBills",
  async (_, { rejectWithValue }) => {
    try {
      // console.log("Making API call to:", `${API_URL}/bills`);
      const response = await axios.get(`${API_URL}/bills`, getAuthHeaders());
      // console.log("API Response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addBill = createAsyncThunk(
   "billing/addBill",
   async (bill) => {
      const response = await axios.post(`${API_URL}/bills`, bill, getAuthHeaders());
      return response.data;
   }
);

export const updateBill = createAsyncThunk(
   "billing/updateBill",
   async ({ id, ...bill }) => {
      const response = await axios.put(`${API_URL}/bills/${id}`, bill, getAuthHeaders());
      return response.data;
   }
);

export const deleteBill = createAsyncThunk(
   "billing/deleteBill",
   async (id) => {
      await axios.delete(`${API_URL}/bills/${id}`, getAuthHeaders());
      return id;
   }
);

const billingSlice = createSlice({
   name: "billing",
   initialState: {
      items: [],
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
         // Fetch bills
         .addCase(fetchBills.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchBills.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
         })
         .addCase(fetchBills.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
         })
         // Add bill
         .addCase(addBill.fulfilled, (state, action) => {
            state.items.push(action.payload);
         })
         // Update bill
         .addCase(updateBill.fulfilled, (state, action) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
               state.items[index] = action.payload;
            }
         })
         // Delete bill
         .addCase(deleteBill.fulfilled, (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
         });
   },
});

export default billingSlice.reducer;