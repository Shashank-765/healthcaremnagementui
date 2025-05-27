import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../doctor/DoctorDashboard.css';
import '../component/Navbar.css';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import logoImage from '../image/logo.png';
import Navbar from '../component/Navbar';
import Sidebar from '../component/Sidebar';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    totalMedicalHistory: 0,
    recentAppointments: [],
    patientHistory: [],
    doctorInfo: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('userRole');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState(null);
  const [reviewSummary, setReviewSummary] = useState({ totalReviews: 0, averageRating: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    
    try {
      const parsedUserData = userData ? JSON.parse(userData) : null;
      
      if (!parsedUserData || !parsedUserData.token || parsedUserData.role !== 'doctor') {
        setError('jwt token is expired please login again as a doctor');
        return;
      }

    } catch (error) {
      setError('Error loading user data');
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const token = userData.token;
        const doctorEmail = userData.email;
        
        if (!token || userData.role !== 'doctor') {
          setError('jwt token is expired please login again as a doctor');
          setLoading(false);
          return;
        }

        if (!doctorEmail) {
          setError('Doctor email not found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/doctor/dashboard/${doctorEmail}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load dashboard');
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please login again');
        } else {
          setError('Error loading dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Check if doctor is in adddoctor
    const checkApproval = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const token = userData.token;
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const res = await axios.get(`${API_URL}/doctor/readdoctorstransfer/${userData.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setIsApproved(!!res.data.data && res.data.data._id);
      } catch (err) {
        console.error('Error checking approval:', err);
        setIsApproved(false);
      }
    };
    checkApproval();
  }, []);

  const handleToggleApproval = async () => {
    if (isApproved) return; // Do nothing if already approved

    setIsApproved(true);
    setHasBeenClicked(true); 
    setApproving(true);
    setApprovalError(null);

    try {
      // Toggling ON: call dashboard API to auto-approve (backend will add to adddoctorModel if needed)
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const token = userData.token;
      const doctorEmail = userData.email;
      await axios.get(`${API_URL}/doctor/dashboard/${doctorEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      setApprovalError('Approval failed. Please try again.');
    } finally {
      setLoading(false);
      setApproving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: 'fas fa-th-large',
      label: 'Dashboard',
      path: '/doctor/doctor-dashboard'
    },
    {
      id: 'appointments',
      icon: 'fas fa-calendar-alt',
      label: 'Appointments',
      submenu: [
        {
          label: 'Total Appointments',
          path: '/doctor/total-appointments',
          icon: 'fas fa-list-alt'
        }
      ]
    },
    {
      id: 'patient-history',
      icon: 'fas fa-history',
      label: 'Patient History',
      path: '/doctor/patient-history'
    }
  ];

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else {
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (e, path) => {
    e.stopPropagation();
    navigate(path);
    setExpandedItem(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fetch review summary
  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const token = userData.token;
        const doctorEmail = userData.email;
        if (!token || userData.role !== 'doctor') return;

        // Use query param for doctorEmail
        const response = await axios.get(
          `${API_URL}/doctor/reviewsummary?doctorEmail=${encodeURIComponent(doctorEmail)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.data.success) {
          setReviewSummary({
            totalReviews: response.data.data.totalRatings,
            averageRating: Number(response.data.data.averageRating)
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchReviewSummary();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div className="main-content">
        <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Banner Section */}
        <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor Profile" />
            </div>
            <h1>YOUR HEALTH IS OUR PRIORITY</h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="doc-stats-grid">
          <div className="doc-stat-card">
            <div className="doc-stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="doc-stat-info">
              <h4>Total Appointments</h4>
              <p className="doc-stat-number">{dashboardData.totalAppointments}</p>
              <small className="doc-stat-text doc-positive">Next: Tomorrow</small>
            </div>
          </div>
          <div className="doc-stat-card">
            <div className="doc-stat-icon">
              <i className="fas fa-user-injured"></i>
            </div>
            <div className="doc-stat-info">
              <h4>Total Patients</h4>
              <p className="doc-stat-number">{dashboardData.totalPatients}</p>
              <small className="doc-stat-text doc-neutral">Last Week</small>
            </div>
          </div>
          <div className="doc-stat-card">
            <div className="doc-stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="doc-stat-info">
              <h4>Total Medical History</h4>
              <p className="doc-stat-number">{dashboardData.totalMedicalHistory}</p>
              <small className="doc-stat-text doc-attention">View All</small>
            </div>
          </div>
          <div className="doc-stat-card">
            <div className="doc-stat-icon">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="doc-stat-info">
              <h4>For Appointment</h4>
              <p className="doc-stat-number">
                {isApproved ? "Available" : "Not Available"}
              </p>
              <div style={{ marginTop: 8 }}>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isApproved}
                    onChange={handleToggleApproval}
                    disabled={isApproved || approving || hasBeenClicked}
                  />
                  <span className="slider round"></span>
                </label>
                {approving && <span style={{ marginLeft: 8 }}>Processing...</span>}
                {approvalError && <div style={{ color: 'red', marginTop: 4 }}>{approvalError}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments and Review Row */}
        <div className="row dashboard-row-equal" style={{marginTop: '0'}}>
          {/* Recent Appointments Column */}
          <div className="col-md-9" style={{paddingRight: '16px'}}>
            <div className="recent-appointments">
              <div className="section-header">
                <h2>Recent Appointments</h2>
              </div>
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentAppointments && dashboardData.recentAppointments.length > 0 ? (
                    dashboardData.recentAppointments.map((appointment, index) => (
                      <tr key={index}>
                        <td>{appointment.patientName}</td>
                        <td>{appointment.appointmentDate + ' ' + appointment.appointmentTime}</td>
                        <td>
                          <span className={`status-badge ${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-appointments">
                        No recent appointments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
                <button className="view-more-btn" onClick={() => navigate('/doctor/total-appointments')}>
                  View More
                </button>
              </div>
            </div>
          </div>
          {/* Review Summary Card */}
          <div className="col-md-3" style={{paddingLeft: '0'}}>
            <div className="review-summary-card full-height">
              <h4 style={{marginBottom: '16px'}}>Reviews Summary</h4>
              <div style={{fontSize: '2.2rem', fontWeight: 700, color: '#4a90e2'}}>
                {reviewSummary.averageRating ? reviewSummary.averageRating.toFixed(1) : '0.0'}
                <span style={{fontSize: '1.2rem', color: '#ffc107', marginLeft: 8}}>
                  {[1,2,3,4,5].map(star => (
                    <FaStar key={star} color={star <= Math.round(reviewSummary.averageRating) ? '#ffc107' : '#e4e5e9'} />
                  ))}
                </span>
              </div>
              <div style={{margin: '8px 0 0 0', color: '#888', fontSize: '1rem'}}>
                Overall Rating
              </div>
              <div style={{marginTop: '18px', fontSize: '1.1rem', color: '#333'}}>
                <b>{reviewSummary.totalReviews}</b> patient review{reviewSummary.totalReviews === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;