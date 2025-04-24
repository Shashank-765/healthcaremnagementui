import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPatient.css';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import Navbar from '../component/Navbar';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AddPatient = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('patients');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    email: '',
    medicalCondition: '',
    admitDate: '',
    medicalDocument: '',
    roomNumber: '',
    assignedDoctor: '',
    medicalHistory: '',
    insuranceInformation: ''
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-close sidebar on mobile
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setPatientForm(prev => ({
      ...prev,
      profileImage: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get token and user role from cookies
      const token = Cookies.get('token');
      const userRole = Cookies.get('userRole');
      
      console.log('Current cookies:', {
        token: Cookies.get('token'),
        userRole: Cookies.get('userRole'),
        userId: Cookies.get('userId')
      });
      
      if (!token) {
        console.error('No token found in cookies');
        alert('Please login first');
        navigate('/admin/login');
        return;
      }

      if (userRole !== 'admin') {
        console.error('User is not an admin');
        alert('Please login as admin first');
        navigate('/admin/login');
        return;
      }

      // Create patient data object matching backend requirements
      const patientData = {
        fullName: patientForm.fullName,
        email: patientForm.email,
        medicalCondition: patientForm.medicalCondition,
        admitDate: patientForm.admitDate,
        medicalDocument: patientForm.medicalDocument,
        roomNumber: parseInt(patientForm.roomNumber),
        assignedDoctor: patientForm.assignedDoctor,
        medicalHistory: patientForm.medicalHistory,
        insuranceInformation: patientForm.insuranceInformation
      };

      console.log('Sending patient data:', patientData);

      const response = await fetch(`${API_URL}/patient/addpatient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData),
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          // Clear all auth cookies
          Cookies.remove('token');
          Cookies.remove('userRole');
          Cookies.remove('userId');
          alert('Session expired. Please login again.');
          navigate('/admin/login');
          return;
        }
        throw new Error(data.message || 'Failed to add patient');
      }

      console.log('Patient added successfully:', data);
      alert('Patient added successfully!');
      navigate('/admin/patients');
    } catch (error) {
      console.error('Error adding patient:', error.message);
      if (error.message.includes('token')) {
        // Clear all auth cookies
        Cookies.remove('token');
        Cookies.remove('userRole');
        Cookies.remove('userId');
        alert('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        alert(error.message || 'Failed to add patient. Please try again.');
      }
    }
  };

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

  return (
    <div className="add-patient-container">
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
      <div className={`add-patient-main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
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
            <div className="user-menu" onClick={handleUserClick}>
              <i className="fas fa-user-circle user-icon"></i>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-item">
                    <i className="fas fa-user"></i>
                    Profile
                  </div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </div>
                </div>
              )}
            </div>
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

        <div className="add-patient-header">
          <h2 style={{fontSize: "24px"}}>Add New Patient</h2>
        </div>

        <div className="add-patient-form-container">
          <form onSubmit={handleSubmit} className="add-patient-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={patientForm.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter patient's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={patientForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-stethoscope"></i>
                  Medical Condition
                </label>
                <input
                  type="text"
                  name="medicalCondition"
                  value={patientForm.medicalCondition}
                  onChange={handleInputChange}
                  placeholder="Enter medical condition"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-calendar"></i>
                  Admit Date
                </label>
                <input
                  type="date"
                  name="admitDate"
                  value={patientForm.admitDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-file-medical"></i>
                  Medical Document
                </label>
                <input
                  type="text"
                  name="medicalDocument"
                  value={patientForm.medicalDocument}
                  onChange={handleInputChange}
                  placeholder="Enter medical document details"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-door-open"></i>
                  Room Number
                </label>
                <input
                  type="number"
                  name="roomNumber"
                  value={patientForm.roomNumber}
                  onChange={handleInputChange}
                  placeholder="Enter room number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-user-md"></i>
                  Assigned Doctor
                </label>
                <input
                  type="text"
                  name="assignedDoctor"
                  value={patientForm.assignedDoctor}
                  onChange={handleInputChange}
                  placeholder="Enter doctor's name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-file-medical"></i>
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                value={patientForm.medicalHistory}
                onChange={handleInputChange}
                placeholder="Enter medical history"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-file-invoice"></i>
                Insurance Information
              </label>
              <input
                type="text"
                name="insuranceInformation"
                value={patientForm.insuranceInformation}
                onChange={handleInputChange}
                placeholder="Enter insurance details"
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/admin/patients')}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatient; 