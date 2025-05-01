import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import './DoctorsList.css';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const ConfirmedAppointments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  // Fetch confirmed appointments
  useEffect(() => {
    const fetchConfirmedAppointments = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        
        if (!token) {
          navigate('/admin/login');
          return;
        }

        console.log('Token being sent:', token);

        const queryParams = new URLSearchParams();
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        queryParams.append('page', currentPage);

        const response = await axios.get(
          `${API_URL}/admin/confirmed-appointments?${queryParams.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('API Response:', response.data);

        if (response.data.success) {
          const formattedAppointments = response.data.data.map(appointment => ({
            _id: appointment._id,
            doctor: {
              name: appointment.doctorId?.fullName || 'N/A',
              specialization: appointment.doctorId?.specialization || 'N/A'
            },
            patient: {
              name: appointment.patientId?.fullName || 'N/A'
            },
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            status: appointment.status || 'Confirmed'
          }));
          setConfirmedAppointments(formattedAppointments);
          setTotalPages(response.data.pagination.totalPages);
          setTotalAppointments(response.data.pagination.totalAppointments);
        } else {
          setError(response.data.message || 'Failed to fetch appointments');
        }
      } catch (error) {
        console.error('Full error object:', error);
        setError(error.response?.data?.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls
    const timeoutId = setTimeout(() => {
      fetchConfirmedAppointments();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, navigate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSpecializationChange = async (e) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      setSelectedSpecialization(e.target.value);
    } catch (error) {
      console.error('Error changing specialization:', error);
      setError(error.response?.data?.message || 'Failed to update specialization filter');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    navigate('/');
  };

  const handleViewAppointment = async (appointment) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      setSelectedAppointment(appointment);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error viewing appointment:', error);
      setError(error.response?.data?.message || 'Failed to view appointment details');
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAppointment(null);
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

        {/* Confirmed Appointments Content */}
        <div className="appointment-container-confirmed">
          <div className="page-header">
            <h2>Confirmed Appointments</h2>
            <div className="header-actions">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by doctor or patient name..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div>

          <div className="appointments-table-container">
            {loading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                Loading appointments...
              </div>
            ) : error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Patient Name</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedAppointments.map(appointment => (
                    <tr key={appointment._id}>
                      <td>{appointment.doctor.name}</td>
                      <td>{appointment.doctor.specialization}</td>
                      <td>{appointment.patient.name}</td>
                      <td>{new Date(appointment.appointmentDate).toLocaleDateString()} {appointment.appointmentTime}</td>
                      <td>
                        <span className="status-badge confirmed">
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="action-btn view" 
                            title="View Details"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
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

        {/* View Appointment Modal */}
        {showViewModal && selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Appointment Details</h3>
                <button className="close-btn" onClick={closeViewModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="appointment-details">
                  <div className="detail-row">
                    <span className="detail-label">Doctor Name:</span>
                    <span className="detail-value">{selectedAppointment.doctor.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Specialization:</span>
                    <span className="detail-value">{selectedAppointment.doctor.specialization}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Patient Name:</span>
                    <span className="detail-value">{selectedAppointment.patient.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{selectedAppointment.appointmentTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span className="status-badge confirmed">{selectedAppointment.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmedAppointments; 