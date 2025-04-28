import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './PatientDashboard.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import EditHistoryForm from './EditHistoryForm';
import MedicalHistoryItem from './MedicalHistoryItem';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
// import doctorImage from '../image/doctor.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState({
    appointments: true,
    medicalHistory: true,
    profile: true,
    bookAppointment: true
  });
  const [profileImage, setProfileImage] = useState(null);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAppointmentDropdown, setShowAppointmentDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMedicalHistoryDropdown, setShowMedicalHistoryDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // New: Dashboard API integration
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add user data check
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');
    
    console.log('PatientDashboard - User Data:', userData);
    console.log('PatientDashboard - User Role:', userRole);
    
    try {
      const parsedUserData = userData ? JSON.parse(userData) : null;
      console.log('Parsed User Data:', parsedUserData);
      
      if (!parsedUserData || userRole !== 'patient') {
        console.log('No valid user data or wrong role, redirecting to login');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const token = userData.token;
        if (!token) {
          setError('Please login to view dashboard');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_URL}/patient/patient-dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDashboard(data.data);
        } else {
          setError(data.message || 'Failed to load dashboard');
        }
      } catch (err) {
        setError('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Dummy data for medical history
  const [medicalHistory, setMedicalHistory] = useState([
    { 
      id: 1,
      date: "2023-12-15", 
      condition: "Hypertension", 
      doctor: "Dr. Sarah Johnson", 
      notes: "Prescribed medication and lifestyle changes",
      medications: "Lisinopril 10mg",
      followUp: "2024-03-15"
    },
    { 
      id: 2,
      date: "2023-11-20", 
      condition: "Annual Checkup", 
      doctor: "Dr. Michael Chen", 
      notes: "All vitals normal",
      medications: "None",
      followUp: "2024-11-20"
    }
  ]);

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleEditClick = (record) => {
    setEditingHistoryId(record.id);
    setEditFormData(record);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setMedicalHistory(prev => 
      prev.map(record => 
        record.id === editingHistoryId ? editFormData : record
      )
    );
    setEditingHistoryId(null);
    setEditFormData({});
  };

  const handleEditCancel = () => {
    setEditingHistoryId(null);
    setEditFormData({});
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAppointmentClick = () => {
    setShowAppointmentDropdown(!showAppointmentDropdown);
    setShowProfileDropdown(false);
    setShowMedicalHistoryDropdown(false);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowAppointmentDropdown(false);
    setShowMedicalHistoryDropdown(false);
  };

  const handleMedicalHistoryClick = () => {
    setShowMedicalHistoryDropdown(!showMedicalHistoryDropdown);
    setShowAppointmentDropdown(false);
    setShowProfileDropdown(false);
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <button className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
      </button>
      
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className={`main-content ${isSidebarOpen ? 'content-shifted' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        <div className="content-wrapper">
          <div className="patient-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
            <div className="banner-content-patient">
              <div className="doctor-profile">
                <img src={doctorImage} alt="Doctor" />
              </div>
              <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
            </div>
          </div>
          
          <div className="row3 stats-row d-flex align-items-stretch">
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="stat-card h-100">
                <div className="stat-icon appointments">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h4>Total Appointments</h4>
                  <div className="stat-number">{dashboard?.totalAppointments ?? '-'}</div>
                  {/* <div className="stat-trends">
                    <span className="trend up">Next: {dashboard?.recentAppointments?.[0]?.date ?? '-'}</span>
                  </div> */}
                </div>
              </div>
            </div>

            <div className="col-md-4 col-sm-12 mb-4">
              <div className="stat-card h-100">
                <div className="stat-icon records">
                  <i className="fas fa-notes-medical"></i>
                </div>
                <div className="stat-info">
                  <h4>Medical Records</h4>
                  <div className="stat-number">{dashboard?.medicalRecords ?? '-'}</div>
                  <div className="stat-trends">
                    <span className="trend up">Last Updated: Today</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-sm-12 mb-4">
              <div className="stat-card h-100">
                <div className="stat-icon prescriptions">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="stat-info">
                  <h4>Doctor Name</h4>
                  <div className="stat-number">{dashboard?.primaryDoctor?.fullName ?? '-'}</div>
                  <div className="stat-trends">
                    <span className="trend up">Primary Doctor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row4">
            <div className="col-md-8 col-sm-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 style={{padding: "15px 0px 0px 15px"}}>
                    <i className="fas fa-calendar-check"></i>
                    Appointments
                  </h3>
                </div>
                <div className="card-content">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard?.recentAppointments?.map((appointment, idx) => (
                        <tr key={idx}>
                          <td>{appointment.doctorName}</td>
                          <td>{appointment.date ? new Date(appointment.date).toLocaleDateString('en-US') : '-'}</td>
                          <td>{appointment.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="view-more-container">
                    <Link to="/all-appointments" className="view-more-link">
                      View All Appointments
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-sm-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 style={{padding: "15px 0px 0px 15px"}}>
                    <i className="fas fa-user-md"></i>
                    Primary Doctor
                  </h3>
                </div>
                <div className="card-content">
                  <div className="doctor-profile-details">
                    <div className="doctor-avatar">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <div className="doctor-info">
                      <h4>{dashboard?.primaryDoctor?.fullName ?? '-'}</h4>
                      <p className="specialization">
                        <i className="fas fa-stethoscope"></i>
                        {dashboard?.primaryDoctor?.specialization ?? '-'}
                      </p>
                      <p className="email">
                        <i className="fas fa-envelope"></i>
                        {dashboard?.primaryDoctor?.email ?? '-'}
                      </p>
                      <p className="experience">
                        <i className="fas fa-clock"></i>
                        {dashboard?.primaryDoctor?.experience ? `${dashboard.primaryDoctor.experience}+ Years Experience` : '-'}
                      </p>
                      <p className="availability">
                        <i className="fas fa-calendar-check"></i>
                        {dashboard?.primaryDoctor?.availability ?? '-'}
                      </p>
                      <button className="contact-doctor-btn">
                        <i className="fas fa-phone"></i>
                        Contact Doctor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row2">
            <div className="col-md-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3  style={{padding: "15px 0px 0px 15px"}}>
                    <i className="fas fa-notes-medical"></i>
                    Medical History
                  </h3>
                </div>
                <div className="card-content">
                  <div className="medical-history">
                    {medicalHistory.map((record) => (
                      <div key={record.id} className="history-item">
                        {editingHistoryId === record.id ? (
                          <EditHistoryForm
                            editFormData={editFormData}
                            handleEditChange={handleEditChange}
                            handleEditSubmit={handleEditSubmit}
                            handleEditCancel={handleEditCancel}
                          />
                        ) : (
                          <MedicalHistoryItem
                            record={record}
                            handleEditClick={handleEditClick}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="view-more-container">
                    <Link to="/medical-history" className="view-more-link">
                      View All History
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 