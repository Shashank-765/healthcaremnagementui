import React, { useState } from 'react';
import './AdminDashboard.css';
import './DoctorsList.css';
import './Appointments.css';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';

const PendingAppointments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  // Mock data for pending appointments
  const [pendingAppointments, setPendingAppointments] = useState([
    {
      id: 1,
      doctor: {
        name: "Dr. Emily Brown",
        specialization: "Pediatrician"
      },
      patient: {
        name: "David Smith",
        time: "Tomorrow, 09:00 AM",
        contact: "+1234567892",
        email: "david.smith@email.com",
        age: "35",
        gender: "Male",
        reason: "Regular checkup"
      },
      date: "2024-03-16",
      status: "Pending"
    },
    // Add more mock data as needed
  ]);

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
    navigate('/');
  };

  const handleStatusChange = (id, newStatus) => {
    setPendingAppointments(prev => 
      prev.map(apt => 
        apt.id === id 
          ? { ...apt, status: newStatus }
          : apt
      )
    );
    setShowEditModal(false);
  };

  const handleDeleteAppointment = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setPendingAppointments(prev => prev.filter(apt => apt.id !== id));
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
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div>

          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(appointment => (
                  <tr key={appointment.name}>
                    <td>{appointment.doctor.name}</td>
                    <td>{appointment.doctor.specialization}</td>
                    <td>{appointment.patient.name}</td>
                    <td>{appointment.patient.time}</td>
                    <td>{appointment.patient.contact}</td>
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
                        <button 
                          className="action-btn delete" 
                          title="Delete"
                          onClick={() => handleDeleteAppointment(appointment.name)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                    <p><strong>Contact:</strong> {selectedAppointment.patient.contact}</p>
                    <p><strong>Email:</strong> {selectedAppointment.patient.email}</p>
                    <p><strong>Age:</strong> {selectedAppointment.patient.age}</p>
                    <p><strong>Gender:</strong> {selectedAppointment.patient.gender}</p>
                  </div>
                  <div className="detail-section">
                    <h3>Appointment Information</h3>
                    <p><strong>Date & Time:</strong> {selectedAppointment.patient.time}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${selectedAppointment.status.toLowerCase()}`}>
                        {selectedAppointment.status}
                      </span>
                    </p>
                    <p><strong>Reason for Visit:</strong> {selectedAppointment.patient.reason}</p>
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
                  <h3>Change Status for Appointment #{selectedAppointment.name}</h3>
                  <div className="form-group">
                    <label>Status:</label>
                    <select 
                      value={selectedAppointment.status}
                      onChange={(e) => handleStatusChange(selectedAppointment.name, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-btn"
                      onClick={() => handleStatusChange(selectedAppointment.name, selectedAppointment.status)}
                    >
                      Save Changes
                    </button>
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