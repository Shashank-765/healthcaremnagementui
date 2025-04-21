import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPatient.css';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import Navbar from '../component/Navbar';

const AddPatient = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('patients');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    condition: '',
    admitDate: '',
    doctor: '',
    room: '',
    contact: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    insuranceInfo: '',
    profileImage: null
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Patient Form Submitted:', patientForm);
    // After successful submission, redirect to patients list
    navigate('/admin/patients');
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
                  name="name"
                  value={patientForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter patient's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-birthday-cake"></i>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={patientForm.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-venus-mars"></i>
                  Gender
                </label>
                <select
                  name="gender"
                  value={patientForm.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-tint"></i>
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={patientForm.bloodGroup}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
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
                  name="condition"
                  value={patientForm.condition}
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
                  <i className="fas fa-user-md"></i>
                  Assigned Doctor
                </label>
                <input
                  type="text"
                  name="doctor"
                  value={patientForm.doctor}
                  onChange={handleInputChange}
                  placeholder="Enter doctor's name"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-door-open"></i>
                  Room Number
                </label>
                <input
                  type="text"
                  name="room"
                  value={patientForm.room}
                  onChange={handleInputChange}
                  placeholder="Enter room number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-phone"></i>
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={patientForm.contact}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-phone-alt"></i>
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={patientForm.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-map-marker-alt"></i>
                Address
              </label>
              <input
                type="text"
                name="address"
                value={patientForm.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                required
              />
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
                name="insuranceInfo"
                value={patientForm.insuranceInfo}
                onChange={handleInputChange}
                placeholder="Enter insurance details"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-image"></i>
                Profile Image
              </label>
              <input
                type="file"
                name="profileImage"
                onChange={handleImageChange}
                accept="image/*"
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