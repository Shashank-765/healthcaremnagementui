import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../doctor/DoctorDashboard.css';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import logoImage from '../image/logo.png';
import Navbar from '../component/Navbar';
import Sidebar from '../component/Sidebar';

const patientHistoryData = [
  {
    patientId: "P001",
    patientName: "John Doe",
    visitDate: "2024-02-20",
    visitTime: "10:00 AM",
    recoveryDate: "2024-02-27",
    department: "Cardiology"
  },
  {
    patientId: "P002",
    patientName: "Jane Smith",
    visitDate: "2024-02-19",
    visitTime: "11:30 AM",
    recoveryDate: "2024-02-26",
    department: "Neurology"
  },
  {
    patientId: "P003",
    patientName: "Mike Johnson",
    visitDate: "2024-02-18",
    visitTime: "2:15 PM",
    recoveryDate: "2024-02-25",
    department: "Orthopedics"
  }
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        },
        {
          label: 'Cancel Appointments',
          path: '/cancel-appointment',
          icon: 'fas fa-calendar-times'
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
              <p className="doc-stat-number">15</p>
              <small className="doc-stat-text doc-positive">Next: Tomorrow</small>
            </div>
          </div>
          <div className="doc-stat-card">
            <div className="doc-stat-icon">
              <i className="fas fa-user-injured"></i>
            </div>
            <div className="doc-stat-info">
              <h4>Total Patients</h4>
              <p className="doc-stat-number">8</p>
              <small className="doc-stat-text doc-neutral">Last Week</small>
            </div>
          </div>
          <div className="doc-stat-card">
            <div className="doc-stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="doc-stat-info">
              <h4>Total Hospital</h4>
              <p className="doc-stat-number">50+</p>
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
                  <tr>
                    <td>John Doe</td>
                    <td>10:00 AM</td>
                    <td><span className="status-badge confirmed">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>11:30 AM</td>
                    <td><span className="status-badge pending">Pending</span></td>
                  </tr>
                  <tr>
                    <td>Mike Johnson</td>
                    <td>2:00 PM</td>
                    <td><span className="status-badge confirmed">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td>Sarah Williams</td>
                    <td>3:30 PM</td>
                    <td><span className="status-badge pending">Pending</span></td>
                  </tr>
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

        <div className="doc-stats-grid">
          <div className="doc-stat-card">
            <div className="doc-stat-icon">
            <i className="fas fa-user-md"></i>
            </div>
            <div className="doc-stat-info">
              <h4>Surgery Schedule</h4>
              <div className="info-list-compact">
                    <p><i className="fas fa-calendar-alt"></i> Next: Tomorrow, 9:00 AM</p>
                    <p><i className="fas fa-clock"></i> Duration: 2 hours</p>
                    <p><i className="fas fa-hospital"></i> Room: OR-3</p>
                    <div className="status-tags">
                      <span className="status-badge confirmed">Available</span>
                      <span className="status-badge pending">In Surgery</span>
                    </div>
                  </div>
            </div>
          </div>
          <div className="doc-stat-card">
                <div className="doc-stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="doc-stat-info">
                  <h4>Consultation Hours</h4>
                  <div className="info-list-compact">
                    <p><i className="fas fa-sun"></i> Morning: 9:00 AM - 1:00 PM</p>
                    <p><i className="fas fa-moon"></i> Evening: 4:00 PM - 8:00 PM</p>
                    <p><i className="fas fa-money-bill-wave"></i> Fee: $100</p>
                    <div className="status-tags">
                      <span className="status-badge confirmed">Accepting Patients</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="doc-stat-card">
                <div className="doc-stat-icon">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <div className="doc-stat-info">
                  <h4>Available Services</h4>
                  <div className="info-list-compact">
                    <p><i className="fas fa-heart"></i> Cardiac Consultation</p>
                    <p><i className="fas fa-stethoscope"></i> General Check-up</p>
                    <p><i className="fas fa-file-medical"></i> Medical Reports</p>
                    <div className="status-tags">
                      <span className="status-badge confirmed">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
        <div className="patient-history-preview">
          <div className="section-header">
            <h2>Recent Patient History</h2>
          </div>
                <div className="table-responsive">
                  <table className="patient-history-table">
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Patient Name</th>
                        <th>Visit Date</th>
                        <th>Visit Time</th>
                        <th>Department</th>
                        <th>Recovery Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientHistoryData.map((record, index) => (
                        <tr key={index}>
                          <td>{record.patientId}</td>
                          <td>{record.patientName}</td>
                          <td>{record.visitDate}</td>
                          <td>{record.visitTime}</td>
                          <td>{record.department}</td>
                          <td>{record.recoveryDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 