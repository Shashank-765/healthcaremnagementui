import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CancelAppointment.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import logoImage from '../image/logo.png';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const CancelAppointment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
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
    // Clear any previous error/success messages
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    let period = 'AM';
    let hour = parseInt(hours);

    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) {
        hour -= 12;
      }
    }
    if (hour === 0) {
      hour = 12;
    }

    // Ensure hour is two digits
    hour = hour.toString().padStart(2, '0');
    return `${hour}:${minutes} ${period}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate date is not in the past
    const selectedDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Cannot cancel past appointments');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmCancellation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData || !userData.token) {
        setError('Authentication required');
        return;
      }

      // Format the data
      const formattedData = {
        ...formData,
        appointmentDate: formatDate(formData.appointmentDate),
        appointmentTime: convertTo12Hour(formData.appointmentTime)
      };

      console.log('Sending cancellation request:', formattedData);

      const response = await axios.post(
        `${API_URL}/appointment/cancel-appointment`,
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Appointment cancelled successfully');
        setShowConfirmation(false);
        // Reset form
        setFormData({
          patientId: '',
          doctorId: '',
          department: '',
          appointmentDate: '',
          appointmentTime: '',
          reason: ''
        });
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/total-appointments');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 404) {
        setError('Appointment not found with the provided details. Please check all fields.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to cancel this appointment');
      } else {
        setError('Error cancelling appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Also update the display in the confirmation modal
  const displayTime = (time24) => {
    if (!time24) return '';
    return convertTo12Hour(time24);
  };

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
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

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form className="cancel-appointment-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientId">Patient ID</label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctorId">Doctor ID</label>
                <input
                  type="text"
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  placeholder="Enter doctor ID"
                />
              </div>
            </div>

            <div className="form-row">
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

              <div className="form-group">
                <label htmlFor="appointmentDate">Appointment Date</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointmentTime">Appointment Time</label>
                <input
                  type="time"
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Cancellation</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Please provide a detailed reason for cancellation..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => navigate('/doctor-dashboard')}
                disabled={loading}
              >
                Back to Dashboard
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Submit Cancellation Request'}
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
                <p><strong>Patient ID:</strong> {formData.patientId}</p>
                <p><strong>Doctor ID:</strong> {formData.doctorId}</p>
                <p><strong>Department:</strong> {formData.department}</p>
                <p><strong>Date:</strong> {formatDate(formData.appointmentDate)}</p>
                <p><strong>Time:</strong> {convertTo12Hour(formData.appointmentTime)}</p>
                <p><strong>Reason:</strong> {formData.reason}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                No, Keep Appointment
              </button>
              <button 
                className="delete-btn" 
                onClick={confirmCancellation}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelAppointment; 