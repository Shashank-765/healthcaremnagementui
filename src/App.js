import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './component/Login';
import Signup from './component/signup';
import AdminDashboard from './admin/AdminDashboard';
import DoctorsList from './admin/DoctorsList';
import PatientsList from './admin/PatientsList';
import AddDoctor from './admin/AddDoctor';
import AddPatient from './admin/AddPatient';
import ConfirmedAppointments from './admin/ConfirmedAppointments';
import PendingAppointments from './admin/PendingAppointments';
import './App.css';
import PatientDashboard from './patient/PatientDashboard';
import DoctorDashboard from './doctor/DoctorDashboard';
import AllAppointments from './patient/AllAppointments';
import BookAppointment from './patient/BookAppointment';
import MedicalHistory from './patient/MedicalHistory';
import Profile from './component/Profile';
import TotalAppointments from './doctor/TotalAppointments';
import CancelAppointments from './doctor/CancelAppointments';
import PatientHistory from './doctor/PatientHistory';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = ['doctor'] }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Patient Routes */}
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/all-appointments" element={<AllAppointments />} />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/medical-history" element={<MedicalHistory />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Doctor Routes */}
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      <Route path="/total-appointments" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <TotalAppointments />
        </ProtectedRoute>
      } />
      <Route path="/cancel-appointment" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <CancelAppointments />
        </ProtectedRoute>
      } />
      <Route path="/doctor-dashboard/patient-history" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <PatientHistory />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/doctors" element={<DoctorsList />} />
      <Route path="/admin/patients" element={<PatientsList />} />
      <Route path="/admin/add-doctor" element={<AddDoctor />} />
      <Route path="/admin/add-patient" element={<AddPatient />} />
      {/* <Route path="/admin/appointments" element={<Appointments />} /> */}
      <Route path="/admin/confirmed-appointments" element={<ConfirmedAppointments />} />
      <Route path="/admin/pending-appointments" element={<PendingAppointments />} />
      
    </Routes>
  );
}

export default App; 