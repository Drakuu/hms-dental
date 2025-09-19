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


// Async thunks for products
export const fetchProducts = createAsyncThunk(
   "products/fetchProducts",
   async () => {
      const response = await axios.get(`${API_URL}/products`, getAuthHeaders());
      return response.data;
   }
);

export const addProduct = createAsyncThunk(
   "products/addProduct",
   async (product) => {
      const response = await axios.post(`${API_URL}/products`, product, getAuthHeaders());
      return response.data;
   }
);

export const updateProduct = createAsyncThunk(
   "products/updateProduct",
   async ({ id, ...product }) => {
      const response = await axios.put(`${API_URL}/products/${id}`, product, getAuthHeaders());
      return response.data;
   }
);

export const deleteProduct = createAsyncThunk(
   "products/deleteProduct",
   async (id) => {
      await axios.delete(`${API_URL}/products/${id}`, getAuthHeaders());
      return id;
   }
);

const productSlice = createSlice({
   name: "products",
   initialState: {
      items: [],
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
         // Fetch products
         .addCase(fetchProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
         })
         .addCase(fetchProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
         })
         // Add product
         .addCase(addProduct.fulfilled, (state, action) => {
            state.items.push(action.payload);
         })
         // Update product
         .addCase(updateProduct.fulfilled, (state, action) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
               state.items[index] = action.payload;
            }
         })
         // Delete product
         .addCase(deleteProduct.fulfilled, (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
         });
   },
});

export default productSlice.reducer;