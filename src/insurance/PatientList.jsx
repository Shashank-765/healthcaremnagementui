import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminDashboard.css';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import Cookies from 'js-cookie';

// Dummy data for patients
const dummyPatients = [
  {
    _id: '1',
    patient: {
      name: 'John Doe',
      phone: '123-456-7890',
      email: 'john.doe@example.com',
    },
    hasPermission: true,
    isVerified: false
  },
  {
    _id: '2',
    patient: {
      name: 'Jane Smith',
      phone: '098-765-4321',
      email: 'jane.smith@example.com',
    },
    hasPermission: true,
    isVerified: true
  },
  {
    _id: '3',
    patient: {
      name: 'Alice Johnson',
      phone: '555-555-5555',
      email: 'alice.johnson@example.com',
    },
    hasPermission: false,
    isVerified: false
  },
];

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(dummyPatients);
  const [expandedItem, setExpandedItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: 'fas fa-th-large',
      label: 'Dashboard',
      path: '/insurance/dashboard'
    },
    {
      id: 'patientlist',
      icon: 'fas fa-user-injured',
      label: 'patient list',
      path: '/insurance/patient-list'
    }
  ];

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else {
      navigate(item.path);
    }
  };

  const handleViewPatient = (patient) => {
    navigate(`/insurance/patient/${patient._id}`, { state: { patient } });
  };

  const handlePermissionToggle = (patientId) => {
    setPatients(patients.map(patient => 
      patient._id === patientId 
        ? { ...patient, hasPermission: !patient.hasPermission }
        : patient
    ));
  };

  const handleVerificationToggle = (patientId) => {
    setPatients(patients.map(patient => 
      patient._id === patientId 
        ? { ...patient, isVerified: !patient.isVerified }
        : patient
    ));
  };

  const handleLogout = () => {
    Cookies.remove('token');
    navigate('/insurance/login');
  };

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

        {/* Patient List Table */}
        <div className="appointments-table-container">
      <h4>Patient List</h4>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.patient?.name || 'N/A'}</td>
                  <td>{patient.patient?.phone || 'N/A'}</td>
                  <td>{patient.patient?.email || 'N/A'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="action-btn view"
                      title="View Details"
                        onClick={() => handleViewPatient(patient)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                      <button
                        className={`action-btn ${patient.hasPermission ? 'permission-on' : 'permission-off'}`}
                        title={patient.hasPermission ? 'Disable Permission' : 'Enable Permission'}
                        onClick={() => handlePermissionToggle(patient._id)}
                      >
                        <i className={`fas fa-${patient.hasPermission ? 'toggle-on' : 'toggle-off'}`}></i>
                      </button>
                      <div className="verification-checkbox">
                        <input
                          type="checkbox"
                          checked={patient.isVerified}
                          onChange={() => handleVerificationToggle(patient._id)}
                          title="Insurance Verification"
                        />
                      </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default PatientList;