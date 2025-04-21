import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CancelAppointment.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import logoImage from '../image/logo.png';

const CancelAppointment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    appointmentId: '',
    patientName: '',
    doctorName: '',
    department: '',
    date: '',
    time: '',
    reason: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Handle window resize
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmCancellation = () => {
    // Here you would typically make an API call to cancel the appointment
    console.log('Appointment cancelled:', {
      ...formData,
      cancellationDate: new Date().toISOString().split('T')[0]
    });
    setShowConfirmation(false);
    // Reset form
    setFormData({
      appointmentId: '',
      patientName: '',
      doctorName: '',
      department: '',
      date: '',
      time: '',
      reason: ''
    });
  };

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isSubmenuOpen={true}/>
      </div>
      <div className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
        {/* Option 1: Using Navbar component */}
        {/* <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}

        {/* Option 2: Direct navbar implementation */}
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
            <div className="user-menu">
              <div className="user-icon" onClick={handleUserClick}>
                <i className="fas fa-user-circle"></i>
              </div>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-item" onClick={() => navigate('/profile')}>
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

        {/* Rest of your content */}
        {/* Banner Section */}
        <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor Profile" />
            </div>
            <h1>YOUR HEALTH IS OUR PRIORITY</h1>
          </div>
        </div>
        <div className="cancel-appointment-container">
          <div className="cancel-appointment-header">
            <h2>Cancel Appointment</h2>
            <p>Please fill out the form below to cancel an appointment</p>
          </div>

          <form className="cancel-appointment-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointmentId">Appointment ID</label>
                <input
                  type="text"
                  id="appointmentId"
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleChange}
                  required
                  placeholder="Enter appointment ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientName">Patient Name</label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="doctorName">Doctor Name</label>
                <input
                  type="text"
                  id="doctorName"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  required
                  placeholder="Enter doctor name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Appointment Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Appointment Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Cancellation</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Please provide a detailed reason for cancellation..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/doctor-dashboard')}>
                Back to Dashboard
              </button>
              <button type="submit" className="submit-btn">
                Submit Cancellation Request
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Cancellation</h3>
              <button className="close-btn" onClick={() => setShowConfirmation(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="appointment-details">
                <p><strong>Appointment ID:</strong> {formData.appointmentId}</p>
                <p><strong>Patient:</strong> {formData.patientName}</p>
                <p><strong>Doctor:</strong> {formData.doctorName}</p>
                <p><strong>Department:</strong> {formData.department}</p>
                <p><strong>Date:</strong> {formData.date}</p>
                <p><strong>Time:</strong> {formData.time}</p>
                <p><strong>Reason:</strong> {formData.reason}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowConfirmation(false)}>
                No, Keep Appointment
              </button>
              <button className="delete-btn" onClick={confirmCancellation}>
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelAppointment; 