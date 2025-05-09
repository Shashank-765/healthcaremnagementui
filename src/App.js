import React from 'react';
import './App.css';
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
import PatientDashboard from './patient/PatientDashboard';
import DoctorDashboard from './doctor/DoctorDashboard';
import AllAppointments from './patient/AllAppointments';
import BookAppointment from './patient/BookAppointment';
import MedicalHistory from './patient/MedicalHistory';
import Profile from './component/Profile';
import TotalAppointments from './doctor/TotalAppointments';
import PatientHistory from './doctor/PatientHistory';
import AdminSignup from './admin/adminSignup';
import AdminLogin from './admin/adminlogin';
import InsuranceSignup from './insurance/InsuranceSignup';
import InsuranceLogin from './insurance/InsuranceLogin';
import InsuranceDashboard from './insurance/InsuranceDashboard';
import InsurancePatientList from './insurance/PatientList';
import HistoryList from './admin/HistoryList';
// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = ['doctor'] }) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userRole = userData?.role;
  
  if (!userData || !userData.token || !userRole || !allowedRoles.includes(userRole)) {
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
      <Route path="/admin/signup" element={<AdminSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/history-list" element={<HistoryList />} />


       {/* Insurance Routes */}
      <Route path="/insurance/signup" element={<InsuranceSignup />} />
      <Route path="/insurance/login" element={<InsuranceLogin />} />
      <Route path ="/insurance/dashboard" element={<InsuranceDashboard />} />
      <Route path ="/insurance/patient-list" element={<InsurancePatientList />} />
    </Routes>
  );
}

export default App; 