import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorsList.css';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import Navbar from '../component/Navbar';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:5000/api/v1';

const DoctorsList = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('doctors');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    reason: ''
  });
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [originalEmail, setOriginalEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const userData = JSON.parse(localStorage.getItem('userData'));

  // Fetch doctors data with filters and pagination
  const fetchDoctors = async (page = 1) => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;   
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchQuery) {
        queryParams.append('fullName', searchQuery);
      }
      if (selectedSpecialization) {
        queryParams.append('specialization', selectedSpecialization);
      }
      queryParams.append('page', page);
      queryParams.append('limit', 10);

      console.log('Fetching doctors with params:', queryParams.toString());

      const response = await axios.get(`${API_URL}/doctor/readdoctors?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        console.log('Raw doctors data received:', response.data.data);
        
        // Process each doctor to get experience from IPFS
        const doctorsWithUpdates = await Promise.all(response.data.data.map(async (doctor) => {
          try {
            // If IPFS data exists, try to get experience from there
            if (doctor.ipfsCID && doctor.ipfsIV) {
              const ipfsData = await axios.get(`${API_URL}/doctor/getipfsdata/${doctor._id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('IPFS data for doctor:', doctor._id, ipfsData.data);
              
              return {
                ...doctor,
                experience: ipfsData.data.experience || doctor.experience || 0,
                availability: doctor.availability || 'Available'
              };
            }
            
            return {
              ...doctor,
              experience: doctor.experience || 0,
              availability: doctor.availability || 'Available'
            };
          } catch (error) {
            console.error('Error fetching IPFS data for doctor:', doctor._id, error);
            return {
              ...doctor,
              experience: doctor.experience || 0,
              availability: doctor.availability || 'Available'
            };
          }
        }));

        console.log('Processed doctors data:', doctorsWithUpdates);
        setDoctors(doctorsWithUpdates);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.page || 1);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors data');
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to include filters and pagination
  useEffect(() => {
    fetchDoctors(currentPage);
    // eslint-disable-next-line
  }, [searchQuery, selectedSpecialization, currentPage]);

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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
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
    Cookies.remove('adminToken');
    navigate('/admin/login');
  };

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleSchedule = (doctor) => {
    setSelectedDoctor(doctor);
    setShowScheduleModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedDoctor(null);
    setScheduleForm({
      date: '',
      time: '',
      name: '',
      email: '',
      phone: '',
      reason: ''
    });
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Schedule Form Submitted:', {
      doctor: selectedDoctor,
      appointment: scheduleForm
    });
    closeScheduleModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleView = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewPopup(true);
  };

  const handleDelete = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeletePopup(true);
  };

  const handleAddDoctor = () => {
    navigate('/admin/add-doctor');
  };

  const handleDeleteConfirm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;   
      if (!token) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        token = userData?.token;
      }

      const response = await axios.delete(`${API_URL}/doctor/deletedoctors/${selectedDoctor.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Remove the deleted doctor from the state
        setDoctors(doctors.filter(doctor => doctor.email !== selectedDoctor.email));
        setShowDeletePopup(false);
        fetchDoctors(); // <-- Refetch from backend
      } else {
        setError('Failed to delete doctor');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setError('Failed to delete doctor');
    }
  };

  // Pagination controls
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="doctors-list-container">
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
      <div className={`doctors-main-content ${isSidebarOpen ? '' : 'expanded'}`}>
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
          {/* <div className="navbar-right">
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
          </div> */}
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

        <div className="doctor-listss">
          <div className="doctors-header">
            <div className="header-content">
              <div className="header-left">
                <h2>Hospital Doctors</h2>
              </div>
              <div className="header-right">
                <div className="department-select">
                  <select value={selectedSpecialization} onChange={handleSpecializationChange}>
                    <option value="">All Specializations</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="Search doctors..." 
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
            Loading doctors...
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        ) : (
          <div className="doctors-table">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Contact Number</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doctor => {
                  console.log('Rendering doctor:', doctor); // Debug log
                  return (
                    <tr key={doctor._id}>
                      <td>{doctor.fullName}</td>
                      <td>{doctor.specialization}</td>
                      <td>{doctor.experience}</td>
                      <td>{doctor.contactnumber}</td>
                      <td>{doctor.email}</td>
                      <td className="action-buttons">
                        <button className="view-btn" onClick={() => handleView(doctor)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(doctor)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination Controls - ConfirmedAppointments style */}
            <div className="pagination-container">
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            <style jsx>{`
              .pagination-container {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
                padding: 10px;
              }

              .pagination {
                display: flex;
                align-items: center;
                gap: 10px;
                background: white;
                padding: 8px 16px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }

              .pagination-btn {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.3s ease;
              }

              .pagination-btn:hover:not(:disabled) {
                background: #e9ecef;
                border-color: #ced4da;
              }

              .pagination-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              .page-info {
                font-size: 14px;
                color: #495057;
                font-weight: 500;
              }
            `}</style>
          </div>
        )}

        {/* View Modal */}
        {showViewPopup && selectedDoctor && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-header">
                <h3>Doctor Details</h3>
                <button className="close-btn" onClick={() => setShowViewPopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="popup-body">
                <div className="doctor-profile-view">
                  <div className="profile-image">
                    {selectedDoctor.profileImage ? (
                      <img src={selectedDoctor.profileImage} alt={selectedDoctor.name} />
                    ) : (
                      <i className="fas fa-user-md"></i>
                    )}
                  </div>
                  <div className="doctor-details">
                    <p><strong>Full Name:</strong> {selectedDoctor.fullName}</p>
                    <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                    <p><strong>Experience:</strong> {selectedDoctor.experience}</p>
                    <p><strong>Availability:</strong> {selectedDoctor.availability}</p>
                    <p><strong>Contact Number:</strong> {selectedDoctor.contactnumber}</p>
                    <p><strong>Email:</strong> {selectedDoctor.email}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeletePopup && selectedDoctor && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-header">
                <h3>Confirm Delete</h3>
                <button className="close-btn" onClick={() => setShowDeletePopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="popup-body">
                <p>Are you sure you want to delete Dr. {selectedDoctor.fullName}?</p>
                <div className="popup-footer">
                  <button className="delete-confirm-btn" onClick={handleDeleteConfirm}>Delete</button>
                  <button className="cancel-btn" onClick={() => setShowDeletePopup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && selectedDoctor && (
          <div className="modal-overlay" onClick={closeScheduleModal}>
            <div className="modal-content schedule-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Schedule Appointment</h2>
                <button className="close-button" onClick={closeScheduleModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="schedule-doctor-info">
                  <div className="profile-image">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div className="doctor-details">
                    <h3>{selectedDoctor.name}</h3>
                    <p>{selectedDoctor.specialization}</p>
                    <p><i className="fas fa-calendar"></i> Available: {selectedDoctor.availability}</p>
                  </div>
                </div>

                <form onSubmit={handleScheduleSubmit} className="schedule-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="fas fa-calendar"></i>
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={scheduleForm.date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <i className="fas fa-clock"></i>
                        Preferred Time
                      </label>
                      <select
                        name="time"
                        value={scheduleForm.time}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Time</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="fas fa-user"></i>
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={scheduleForm.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <i className="fas fa-phone"></i>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={scheduleForm.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="fas fa-envelope"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={scheduleForm.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="fas fa-notes-medical"></i>
                      Reason for Visit
                    </label>
                    <textarea
                      name="reason"
                      value={scheduleForm.reason}
                      onChange={handleInputChange}
                      placeholder="Briefly describe your reason for visit"
                      required
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={closeScheduleModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Confirm Appointment
                    </button>
                  </div>
                </form>
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
    </div>
  );
};

export default DoctorsList; 