import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import departmentReducer from "../features/department/DepartmentSlice";
import doctorReducer from "../features/doctor/doctorSlice";
import staffReducer from "../features/staff/staffslice"
import patientReducer from "../features/patient/patientSlice";
import refundOpdReducer from "../features/refund/refundopdSlice";
import expensesReducer from "../features/expenses/expensesSlice";
import appointmentReducer from "../features/appointments/appointmentSlice";
import productReducer from "../features/product/productSlice";
import billingReducer from "../features/billing/billingSlice";
import summaryReducer from "../features/summary/Slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    department: departmentReducer,
    doctor: doctorReducer,
    staff: staffReducer,
    patients: patientReducer,
    refund: refundOpdReducer,
    expenses: expensesReducer,
    appointments: appointmentReducer,
    products: productReducer,
    billing: billingReducer,
    summary: summaryReducer,


  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
