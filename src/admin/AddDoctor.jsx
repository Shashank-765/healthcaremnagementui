import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddDoctor.css';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const AddDoctor = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('doctors');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [errors, setErrors] = useState({
    contactnumber: ""
  });
  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    specialization: '',
    experience: '',
    availability: '',
    contactnumber: '',
    email: '',
    password: '',
    qualification: '',
    address: '',
    bio: '',
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
    },
    {
      id: 'patient history',
      icon: 'fas fa-user-injured',
      label: 'patient history',
      path: '/admin/history-list'
    },
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

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(number)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm(prev => ({
      ...prev,
      [name]: name === "contactnumber" ? value.replace(/[^\d]/g, '').slice(0, 10) : value
    }));

    if (name === "contactnumber") {
      const error = validatePhoneNumber(value.replace(/[^\d]/g, '').slice(0, 10));
      setErrors(prevErrors => ({
        ...prevErrors,
        contactnumber: error
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setDoctorForm(prev => ({
      ...prev,
      profileImage: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get token and user role from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;

      if (!token) {
        alert('No token found. Please login again.');
        navigate('/admin/login');
        return;
      }

      if (userData?.role !== 'admin') {
        console.error('User is not an admin');
        alert('Please login as admin first');
        navigate('/admin/login');
        return;
      }

      // Validate phone number
      const contactError = validatePhoneNumber(doctorForm.contactnumber);
      if (contactError) {
        setErrors({ contactnumber: contactError });
        setIsSubmitting(false);
        return;
      }

      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('fullName', doctorForm.fullName);
      formData.append('specialization', doctorForm.specialization);
      formData.append('experience', doctorForm.experience);
      formData.append('availability', doctorForm.availability);
      formData.append('contactnumber', doctorForm.contactnumber);
      formData.append('email', doctorForm.email);
      formData.append('password', doctorForm.password);
      formData.append('qualification', doctorForm.qualification);
      formData.append('address', doctorForm.address);
      formData.append('bio', doctorForm.bio);

      if (doctorForm.profileImage) {
        formData.append('profileimage', doctorForm.profileImage);
      }

      console.log('Sending doctor data:', Object.fromEntries(formData));

      const response = await fetch(`${API_URL}/doctor/adddoctor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        alert('Doctor added successfully!');
        navigate('/admin/doctors');
      } else {
        throw new Error(data.message || 'Failed to add doctor');
      }
    } catch (error) {
      console.error('Error adding doctor:', error.message);
      alert('Failed to add doctor: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-doctor-container">
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
      <div className={`add-doctor-main-content ${isSidebarOpen ? '' : 'expanded'}`}>
        {/* Navbar with toggle */}
        <div className="navbar">
          <div className="navbar-left">
            <div 
              className="mobile-toggle" 
              onClick={toggleSidebar}
              style={{ display: windowWidth <= 1250 ? 'flex' : 'none' }}
            >
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

        <div className="add-doctor-header">
          <h2>Add New Doctor</h2>
        </div>

        <div className="add-doctor-form-container">
          <form onSubmit={handleSubmit} className="add-doctor-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={doctorForm.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter doctor's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-stethoscope"></i>
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={doctorForm.specialization}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-clock"></i>
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={doctorForm.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 years"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-calendar"></i>
                  Availability
                </label>
                <input
                  type="text"
                  name="availability"
                  value={doctorForm.availability}
                  onChange={handleInputChange}
                  placeholder="e.g., Mon-Fri"
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
                  name="contactnumber"
                  value={doctorForm.contactnumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  required
                />
                {errors.contactnumber && <span className="error">{errors.contactnumber}</span>}
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-envelope"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={doctorForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-lock"></i>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={doctorForm.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-graduation-cap"></i>
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={doctorForm.qualification}
                  onChange={handleInputChange}
                  placeholder="e.g., MBBS, MD"
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
                value={doctorForm.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-info-circle"></i>
                Bio
              </label>
              <textarea
                name="bio"
                value={doctorForm.bio}
                onChange={handleInputChange}
                placeholder="Enter doctor's bio and achievements"
                required
              ></textarea>
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
              <button type="button" className="cancel-btn" onClick={() => navigate('/admin/doctors')}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor; 