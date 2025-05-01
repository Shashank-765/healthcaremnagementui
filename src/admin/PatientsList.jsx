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
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Not Admitted") return "Not Admitted";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) {
        queryParams.append('fullName', searchQuery.trim());
      }

      const response = await axios.get(`${API_URL}/patient/allpatientdata?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const formattedPatients = response.data.data.map(patient => ({
          _id: patient._id,
          name: patient.name || patient.fullName || 'N/A',
          email: patient.email || 'N/A',
          admitDate: formatDate(patient.admitDate),
          condition: patient.condition || patient.medicalCondition || 'Not Specified',
          room: patient.room || patient.roomNumber || 'Not Assigned',
          doctor: patient.doctor || patient.assignedDoctor || 'Not Assigned',
          isAdded: patient.isAdded
        }));
        
        setPatients(formattedPatients);
        setError(null);
      } else {
        // Check for specific IPFS errors
        if (response.data.message?.includes("IPFS") || response.data.message?.includes("defaultCID")) {
          setPatients([]);
          setError("Database initialization required. Please add a patient to initialize the system.");
        } else {
          setError(response.data.message || 'Failed to fetch patients data');
        }
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      // Handle specific IPFS errors
      if (err.response?.data?.message?.includes("IPFS") || 
          err.response?.data?.message?.includes("defaultCID")) {
        setPatients([]);
        setError("Database initialization required. Please add a patient to initialize the system.");
      } else {
        setError('Unable to fetch patients data. Please try again later.');
      }
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

  const handleTransferToAddPatient = async (patient) => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/transfer-patient-signup`,
        {
          patientEmail: patient.email
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Remove the transferred patient from the list
        setPatients(patients.filter(p => p.email !== patient.email));
        alert('Patient transferred successfully to Add Patient collection');
      } else {
        // Show error popup if patient already exists
        setErrorMessage(response.data.message || 'Patient already exists in Add Patient collection');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error transferring patient:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to transfer patient');
      setShowErrorPopup(true);
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
          <div className="error-message" style={{ textAlign: 'center', padding: '20px' }}>
            <i className="fas fa-exclamation-circle" style={{ color: '#ff6b6b', marginRight: '10px' }}></i>
            <p style={{ margin: '10px 0' }}>{error}</p>
            {error.includes("No patient records found") && (
              <button 
                onClick={() => navigate('/admin/add-patient')} 
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                <i className="fas fa-plus" style={{ marginRight: '5px' }}></i>
                Add New Patient
              </button>
            )}
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
                    <tr key={patient._id} className={patient.isAdded ? 'added-patient' : 'signup-patient'}>
                      <td>{patient.name || 'N/A'}</td>
                      <td>{patient.email || 'N/A'}</td>
                      <td>{patient.admitDate || 'Not Admitted'}</td>
                      <td>{patient.condition || 'Not Specified'}</td>
                      <td>{patient.room || 'Not Assigned'}</td>
                      <td>{patient.doctor || 'Not Assigned'}</td>
                      <td>
                        <button className="view-btn" onClick={() => handleView(patient)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        {patient.isAdded ? (
                          <>
                            <button className="edit-btn" onClick={() => handleEdit(patient)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(patient)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        ) : (
                          <button 
                            className="transfer-btn" 
                            onClick={() => handleTransferToAddPatient(patient)}
                            title="Transfer to Hospital Records"
                          >
                            <i className="fas fa-exchange-alt"></i>
                          </button>
                        )}
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

      {showErrorPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Error</h3>
              <button className="close-btn" onClick={() => setShowErrorPopup(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <p>{errorMessage}</p>
              <div className="popup-footer">
                <button className="ok-btn" onClick={() => setShowErrorPopup(false)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList; 