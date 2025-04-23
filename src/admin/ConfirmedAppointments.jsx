import React, { useState } from 'react';
import './AdminDashboard.css';
import './DoctorsList.css';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';

const ConfirmedAppointments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      icon: 'fas fa-th-large',
      label: 'Dashboard',
      path: '/admin/admin-dashboard'
    },
    {
      id: 'doctors',
      icon: 'fas fa-user-md',
      label: 'Doctors',
      path: '/admin/doctors',
      submenu: [
        { label: 'All Doctors', path: '/admin/doctors' },
        { label: 'Add Doctor', path: '/admin/add-doctor' }
      ]
    },
    {
      id: 'patients',
      icon: 'fas fa-user-injured',
      label: 'Patients',
      path: '/admin/patients',
      submenu: [
        { label: 'All Patients', path: '/admin/patients' },
        { label: 'Add Patient', path: '/admin/add-patient' }
      ]
    },
    {
      id: 'appointments',
      icon: 'fas fa-calendar-check',
      label: 'Appointments',
      path: '/admin/appointments',
      submenu: [
        { label: 'Confirmed Appointments', path: '/admin/confirmed-appointments' },
        { label: 'Pending Appointments', path: '/admin/pending-appointments' }
      ]
    }
  ];

  // Mock data for confirmed appointments
  const [confirmedAppointments] = useState([
    {
      id: 1,
      doctor: {
        name: "Dr. Sarah Johnson",
        specialization: "Cardiologist"
      },
      patient: {
        name: "John Doe",
        time: "Today, 10:00 AM",
        contact: "+1234567890"
      },
      date: "2024-03-15",
      status: "Confirmed"
    },
    // Add more mock data as needed
  ]);

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else {
      navigate(item.path);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const filteredAppointments = confirmedAppointments.filter(appointment =>
    appointment.doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <img src={logoImage} alt="Hospital Logo" />
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <div 
                  className={`menu-item ${expandedItem === item.id ? 'expanded' : ''}`}
                  onClick={() => handleMenuClick(item)}
                >
                  <div className="menu-title">
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                    {item.submenu && (
                      <i className={`fas fa-chevron-${expandedItem === item.id ? 'down' : 'right'} submenu-arrow`}></i>
                    )}
                  </div>
                </div>
                {item.submenu && expandedItem === item.id && (
                  <ul className="submenu">
                    {item.submenu.map((subItem, index) => (
                      <li 
                        key={index}
                        onClick={() => navigate(subItem.path)}
                        className="submenu-item"
                      >
                        {subItem.label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${isSidebarOpen ? '' : 'expanded'}`}>
        {/* Navbar with toggle */}
        <div className="navbar">
          <div className="navbar-left">
            <div className="mobile-toggle" onClick={toggleSidebar}>
              <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
            </div>
            <div className="navbar-logo">
              <img src={logoImage} alt="Hospital Logo" className="nav-logo" />
            </div>
          </div>
          <div className="navbar-right">
            <i className="fas fa-user-circle user-icon"></i>
          </div>
        </div>

        {/* Banner */}
        <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor" />
            </div>
            <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
          </div>
        </div>

        {/* Confirmed Appointments Content */}
        <div className="appointment-container-confirmed">
        <div className="page-header">
          <h2>Confirmed Appointments</h2>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>

        <div className="appointments-table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor Name</th>
                <th>Specialization</th>
                <th>Patient Name</th>
                <th>Date & Time</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>#{appointment.id}</td>
                  <td>{appointment.doctor.name}</td>
                  <td>{appointment.doctor.specialization}</td>
                  <td>{appointment.patient.name}</td>
                  <td>{appointment.patient.time}</td>
                  <td>{appointment.patient.contact}</td>
                  <td>
                    <span className="status-badge confirmed">
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn view" title="View Details">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="action-btn edit" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="action-btn delete" title="Cancel">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
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

export default ConfirmedAppointments; 