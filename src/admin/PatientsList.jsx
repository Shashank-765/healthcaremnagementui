import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientsList.css';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import Navbar from '../component/Navbar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const PatientsList = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('patients');
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 1250) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
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

  const toggleView = () => {
    setShowAllPatients(!showAllPatients);
  };

  // Fetch patients data with filter
  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) {  // Only add if search query is not empty
        queryParams.append('fullName', searchQuery.trim());
      }

      const response = await axios.get(`${API_URL}/patient/allpatientdata?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Map the response data to match your table structure
        const formattedPatients = response.data.data.map(patient => ({
          _id: patient._id,
          name: patient.fullName,
          email: patient.email,
          admitDate: patient.admitDate,
          condition: patient.medicalCondition,
          room: patient.roomNumber,
          doctor: patient.assignedDoctor,
        }));
        
        setPatients(formattedPatients);
      } else {
        setError(response.data.message || 'Failed to fetch patients data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients data');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to include search query
  useEffect(() => {
    fetchPatients();
  }, [searchQuery]); // Re-fetch when search query changes

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Add handlers for popups
  const handleView = (patient) => {
    setSelectedPatient(patient);
    setShowViewPopup(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowEditPopup(true);
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setShowDeletePopup(true);
  };

  const handleAddPatient = () => {
    navigate('/admin/add-patient');
  };

  // Handle Edit Submit with API integration
  const handleEditSubmit = async (editedPatient) => {
    try {
      const updateData = {
        medicalCondition: editedPatient.condition,
        roomNumber: editedPatient.room,
        assignedDoctor: editedPatient.doctor
      };

      await axios.put(`${API_URL}/patient/update/${editedPatient.name}`, updateData);
      setShowEditPopup(false);
      fetchPatients(); 
    } catch (err) {
      console.error('Error updating patient:', err);
      alert('Failed to update patient information');
    }
  };

 const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/patient/delete-patientdata/${selectedPatient.name}`);
      setShowDeletePopup(false);
      fetchPatients(); // Refresh the list after delete
    } catch (err) {
      console.error('Error deleting patient:', err.message);
      // Handle error (show message to user)
    }
  };

  return (
    <div className="patients-list-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
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
      <div className="patients-main-content">
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
        <div className="doctor-listss">
          <div className="patients-header">
            <div className="header-content">
              <div className="header-left">
                <h2 style={{marginLeft:'20px'}}>Hospital patients</h2>
              </div>
              <div className="header-right">
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="Search patients by name..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            Loading patients...
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        ) : (
          <div className="patients-table">
            {patients.length === 0 ? (
              <div className="no-patients">
                <i className="fas fa-user-injured"></i>
                <p>No patients found</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Admit Date</th>
                    <th>Condition</th>
                    <th>Room</th>
                    <th>Doctor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, showAllPatients ? patients.length : 3).map(patient => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>
                      <td>{patient.email}</td>
                      <td>{patient.admitDate}</td>
                      <td>{patient.condition}</td>
                      <td>{patient.room}</td>
                      <td>{patient.doctor}</td>
                      <td>
                        <button className="view-btn" onClick={() => handleView(patient)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="edit-btn" onClick={() => handleEdit(patient)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(patient)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {patients.length > 3 && (
              <div className="view-more-less">
                <button 
                  className={showAllPatients ? "view-less-btn" : "view-more-btn"}
                  onClick={toggleView}
                >
                  <i className={`fas fa-chevron-${showAllPatients ? 'up' : 'down'}`}></i>
                  {showAllPatients ? 'View Less' : 'View More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Popups */}
      {showViewPopup && selectedPatient && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Patient Details</h3>
              <button className="close-btn" onClick={() => setShowViewPopup(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <div className="patient-details">
                <p><strong>Name:</strong> {selectedPatient.name}</p>
                <p><strong>Condition:</strong> {selectedPatient.condition}</p>
                <p><strong>Admit Date:</strong> {selectedPatient.admitDate}</p>
                <p><strong>Doctor:</strong> {selectedPatient.doctor}</p>
                <p><strong>Room:</strong> {selectedPatient.room}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditPopup && selectedPatient && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Edit Patient</h3>
              <button className="close-btn" onClick={() => setShowEditPopup(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit(selectedPatient);
              }}>
                <div className="form-group">
                  <label>Patient Name:</label>
                  <input
                    type="text"
                    value={selectedPatient.name}
                    disabled
                    className="disabled-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Medical Condition:</label>
                  <input
                    type="text"
                    value={selectedPatient.condition}
                    onChange={(e) => setSelectedPatient({
                      ...selectedPatient,
                      condition: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Room Number:</label>
                  <input
                    type="text"
                    value={selectedPatient.room}
                    onChange={(e) => setSelectedPatient({
                      ...selectedPatient,
                      room: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Doctor:</label>
                  <input
                    type="text"
                    value={selectedPatient.doctor}
                    onChange={(e) => setSelectedPatient({
                      ...selectedPatient,
                      doctor: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="popup-footer">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => setShowEditPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && selectedPatient && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setShowDeletePopup(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <p>Are you sure you want to delete patient {selectedPatient.name}?</p>
              <div className="popup-footer">
                <button className="delete-confirm-btn" onClick={handleDeleteConfirm}>Delete</button>
                <button className="cancel-btn" onClick={() => setShowDeletePopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList; 