import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import './DoctorsList.css';
import './Appointments.css';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const PendingAppointments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);

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

  // Fetch pending appointments
  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        setLoading(true);
        // Use Cookies instead of localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = userData?.token;   
         if (!token) {
          navigate('/admin/login');
          return;
        }

        // Add console.log to debug token
        console.log('Token being sent:', token);

        const queryParams = new URLSearchParams();
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        queryParams.append('page', currentPage);

        const response = await axios.get(
          `${API_URL}/admin/pending-appointments?${queryParams.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Add console.log to debug response
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
            status: appointment.status || 'Pending'
          }));
          setPendingAppointments(formattedAppointments);
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
      fetchPendingAppointments();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, navigate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

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
    Cookies.remove('adminToken');
    navigate('/admin/login');
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(
        `${API_URL}/admin/update-appointment-status/${appointmentId}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPendingAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        );
        setShowEditModal(false);
        alert('Appointment status updated successfully');
      } else {
        setError(response.data.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setPendingAppointments(prev => prev.filter(apt => apt._id !== id));
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredAppointments = pendingAppointments.filter(appointment =>
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

        {/* Pending Appointments Content */}
        <div className="appointment-container-pending">
          <div className="page-header">
            <h2>Pending Appointments</h2>
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
                    {/* <th>Date & Time</th> */}
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(appointment => (
                    <tr key={appointment._id}>
                      <td>{appointment.doctor.name}</td>
                      <td>{appointment.doctor.specialization}</td>
                      <td>{appointment.patient.name}</td>
                      {/* <td>{appointment.appointmentTime}</td> */}
                      <td>
                        <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="action-btn edit" 
                            title="Edit Status"
                            onClick={() => handleEdit(appointment)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn view" 
                            title="View Details"
                            onClick={() => handleViewDetails(appointment)}
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

        {/* View Details Modal */}
        {showViewModal && selectedAppointment && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Appointment Details</h2>
                <button className="close-button" onClick={() => setShowViewModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="appointment-details-grid">
                  <div className="detail-section">
                    <h3>Doctor Information</h3>
                    <p><strong>Name:</strong> {selectedAppointment.doctor.name}</p>
                    <p><strong>Specialization:</strong> {selectedAppointment.doctor.specialization}</p>
                  </div>
                  <div className="detail-section">
                    <h3>Patient Information</h3>
                    <p><strong>Name:</strong> {selectedAppointment.patient.name}</p>
                  </div>
                  <div className="detail-section">
                    <h3>Appointment Information</h3>
                    {/* <p><strong>Date & Time:</strong> {selectedAppointment.appointmentTime}</p> */}
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${selectedAppointment.status.toLowerCase()}`}>
                        {selectedAppointment.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Status Modal */}
        {showEditModal && selectedAppointment && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Appointment Status</h2>
                <button className="close-button" onClick={() => setShowEditModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="status-edit-form">
                  <h3>Change Status for Appointment #{selectedAppointment._id}</h3>
                  <div className="form-group">
                    <label>Status:</label>
                    <select 
                      value={selectedAppointment.status}
                      onChange={(e) => handleStatusChange(selectedAppointment._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirm">Confirm</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    {/* <button 
                      className="cancel-btn"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button> */}
                    {/* <button 
                      className="save-btn"
                      onClick={() => handleStatusChange(selectedAppointment._id, selectedAppointment.status)}
                    >
                      Save Changes
                    </button> */}
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

export default PendingAppointments; 