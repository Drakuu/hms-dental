import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  NewOpd,
  ManageOpd,
  PatientAppointment,
  RefundManagement,
  OpdRefundList,
  OpdRefundDetail,
  Expenses,
  Summary,
  DentalProcedure,
  SkinProcedure,
  EyesProcedure,
  SaleDashboard,
  Inventory,
  Bills,
  HoldBill,
  SaleSummary,
} from '../pages/reception/ReceptionPages';
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';
import DeletedAppointmentsPage from '../components/ui/DeletedAppointmentsPage';

const ReceptionRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Receptionist', 'Admin']} />}>
        <Route element={<DynamicLayout />}>
          {/* Dashboard routes */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* OPD routes */}
          <Route path="opd/newopd" element={<NewOpd mode="create" />} />
          <Route path="opd/edit/:patientMRNo" element={<NewOpd mode="edit" />} />
          <Route path="opd/manage" element={<ManageOpd />} />

          {/* Appointment routes */}
          <Route path="patient-appointment" element={<PatientAppointment />} />
          <Route path="appointment/patient-appointment/deleted" element={<DeletedAppointmentsPage />} />


          {/* REFUND */}
          <Route path="refunds" element={<RefundManagement />} />
          <Route path="manage-refunds" element={<OpdRefundList />} />
          <Route path="refund/details/:id" element={<OpdRefundDetail />} />

          {/* Expense */}
          <Route path="expenses" element={<Expenses />} />

          {/* Summary */}
          <Route path="summary" element={<Summary />} />

          {/* Procedures */}
          <Route path="dental-procedure" element={<DentalProcedure />} />
          <Route path="skin-procedure" element={<SkinProcedure />} />
          <Route path="eyes-procedure" element={<EyesProcedure />} />

          {/* pos */}
          <Route path="sale-dashboard" element={<SaleDashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="bills" element={<Bills />} />
          <Route path="hold-bill" element={<HoldBill />} />
          <Route path="sale-summary" element={<SaleSummary />} />

        </Route>
      </Route>
    </Routes>
  );
};

export default ReceptionRoutes;