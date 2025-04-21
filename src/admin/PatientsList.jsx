import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientsList.css';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import Navbar from '../component/Navbar';

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

  // Mock data for patients
  const patients = [
    {
      id: 1,
      name: "John Smith",
      age: 45,
      gender: "Male",
      bloodGroup: "A+",
      condition: "Cardiac",
      admitDate: "2024-02-15",
      doctor: "Dr. Sarah Johnson",
      room: "301",
      contact: "+1234567890"
    },
    {
      id: 2,
      name: "Emma Wilson",
      age: 28,
      gender: "Female",
      bloodGroup: "O-",
      condition: "Neurology",
      admitDate: "2024-02-14",
      doctor: "Dr. Michael Chen",
      room: "205",
      contact: "+1234567891"
    },
    {
      id: 3,
      name: "David Brown",
      age: 8,
      gender: "Male",
      bloodGroup: "B+",
      condition: "Pediatric Care",
      admitDate: "2024-02-16",
      doctor: "Dr. Emily Brown",
      room: "103",
      contact: "+1234567892"
    }
  ];

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

  const handleEditSubmit = (editedPatient) => {
    // Here you would typically update the patient data in your backend
    // For now, we'll just close the popup and redirect
    setShowEditPopup(false);
    navigate('/admin/patients');
  };

  const handleDeleteConfirm = () => {
    // Here you would typically delete the patient from your backend
    // For now, we'll just close the popup
    setShowDeletePopup(false);
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
              <h2>Hospital patients</h2>
            </div>
            <div className="header-right">
              <div className="department-select">
                <select>
                  <option value="">All Departments</option>
                  <option value="cardiac">Cardiac</option>
                  <option value="neurology">Neurology</option>
                  <option value="pediatric">Pediatric</option>
                </select>
              </div>
              <div className="search-bar">
                <input type="text" placeholder="Search patients..." />
              </div>
            </div>
          </div>
        </div>

        <div className="patients-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Condition</th>
                <th>Admit Date</th>
                <th>Doctor</th>
                <th>Room</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, showAllPatients ? patients.length : 5).map(patient => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.bloodGroup}</td>
                  <td>{patient.condition}</td>
                  <td>{patient.admitDate}</td>
                  <td>{patient.doctor}</td>
                  <td>{patient.room}</td>
                  <td>{patient.contact}</td>
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
          {patients.length > 5 && (
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
      </div>
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
                <p><strong>Age:</strong> {selectedPatient.age}</p>
                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
                <p><strong>Condition:</strong> {selectedPatient.condition}</p>
                <p><strong>Admit Date:</strong> {selectedPatient.admitDate}</p>
                <p><strong>Doctor:</strong> {selectedPatient.doctor}</p>
                <p><strong>Room:</strong> {selectedPatient.room}</p>
                <p><strong>Contact:</strong> {selectedPatient.contact}</p>
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
                  <label>Name:</label>
                  <input
                    type="text"
                    value={selectedPatient.name}
                    onChange={(e) => setSelectedPatient({
                      ...selectedPatient,
                      name: e.target.value
                    })}
                  />
                </div>
                {/* Add similar form fields for other patient details */}
                <div className="popup-footer">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowEditPopup(false)}>Cancel</button>
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