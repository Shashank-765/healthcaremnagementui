import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../doctor/DoctorDashboard.css';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import logoImage from '../image/logo.png';
import Navbar from '../component/Navbar';
import Sidebar from '../component/Sidebar';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    totalHospital: '50+',
    recentAppointments: [],
    patientHistory: [],
    doctorInfo: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('userRole');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    
    try {
      const parsedUserData = userData ? JSON.parse(userData) : null;
      console.log('Parsed User Data:', parsedUserData);
      
      if (!parsedUserData || !parsedUserData.token || parsedUserData.role !== 'doctor') {
        console.log('No valid user data or wrong role, redirecting to login');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
        return;
      }

      // If we reach here, user is authenticated and is a doctor
      console.log('User authenticated as doctor');

    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const token = userData.token;
        const doctorEmail = userData.email;
        if (!token || userData.role !== 'doctor') {
          setError('Please login as a doctor to view dashboard');
          setLoading(false);
          navigate('/', { replace: true });
          return;
        }


        if (!doctorEmail) {
          setError('Doctor email not found in token');
          setLoading(false);
          return;
        }

        console.log('Fetching dashboard data for doctor:', doctorEmail);

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
        console.error('Dashboard fetch error:', err);
        setError('Error loading dashboard');
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

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
      path: '/doctor-dashboard'
    },
    {
      id: 'appointments',
      icon: 'fas fa-calendar-alt',
      label: 'Appointments',
      submenu: [
        {
          label: 'Total Appointments',
          path: '/total-appointments',
          icon: 'fas fa-list-alt'
        }
      ]
    },
    {
      id: 'patient-history',
      icon: 'fas fa-history',
      label: 'Patient History',
      path: '/doctor-dashboard/patient-history'
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

  const weeklyStats = [
    { day: 'Mon', value: 12 },
    { day: 'Tue', value: 19 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 22 },
    { day: 'Fri', value: 18 },
    { day: 'Sat', value: 14 },
    { day: 'Sun', value: 10 }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
              <p className="doc-stat-number">{dashboardData.totalHospital}</p>
              <small className="doc-stat-text doc-attention">View All</small>
            </div>
          </div>
        </div>

        {/* Appointments and Statistics Row */}
        <div className="dashboard-row">
          {/* Recent Appointments Column */}
          <div className="dashboard-col-left">
            <div className="recent-appointments">
              <div className="section-header">
                <h2>Recent Appointments</h2>
              </div>
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentAppointments && dashboardData.recentAppointments.length > 0 ? (
                    dashboardData.recentAppointments.map((appointment, index) => (
                      <tr key={index}>
                        <td>{appointment.patientName}</td>
                        <td>{appointment.time}</td>
                        <td>
                          <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-appointments">
                        No recent appointments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient Statistics Column */}
          <div className="dashboard-col-right">
            <div className="statistics-card">
              <div className="section-header">
                <div>
                  <h2>Patient Statistics</h2>
                  <p className="stats-subtitle">Weekly Overview</p>
                </div>
              </div>
              <div className="stats-container">
                {weeklyStats.map((stat) => (
                  <div key={stat.day} className="stat-bar-container">
                    <div className="stat-bar-wrapper">
                      <div
                        className="stat-bar"
                        style={{ height: `${(stat.value / 25) * 100}%` }}
                      >
                        <span className="stat-value">{stat.value}</span>
                      </div>
                    </div>
                    <span className="stat-label">{stat.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 