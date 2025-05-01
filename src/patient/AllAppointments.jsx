import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../patient/Allappointments.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AllAppointments = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async (userData) => {
    try {
      setLoading(true);
      setError('');

      if (!userData || !userData.token) {
        setError('Authentication data missing. Please log in.');
        setLoading(false);
        navigate('/patient-dashboard', { replace: true });
        return;
      }

      const response = await axios.get(
        `${API_URL}/appointment/patient`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        setAppointments(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/patient-dashboard', { replace: true });
      } else {
        setError(error.response?.data?.message || 'Error loading appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      fetchAppointments(userData);
    } else {
      setError('Please log in to view appointments');
      setLoading(false);
      navigate('/patient-dashboard', { replace: true });
    }
  }, [navigate]);

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.doctorId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (appointment) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        setError('Please log in to delete appointments');
        navigate('/patient-dashboard', { replace: true });
        return;
      }

      const response = await axios.delete(
        `${API_URL}/appointment/delete-appointment/id/${appointment._id}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await fetchAppointments(userData);
        setShowDeleteModal(false);
      } else {
        setError(response.data.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please try again from dashboard.');
        navigate('/patient-dashboard', { replace: true });
      } else {
        setError('Error deleting appointment. Please try again.');
      }
    }
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-container-patient">
      <button className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
      </button>

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isSubmenuOpen={true}
      />
      
      <div className={`main-content2 ${isSidebarOpen ? 'content-shifted' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        
        <div className="patient-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor" />
            </div>
            <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
          </div>
        </div>

        <div className="dashboard-card2">
          <div className="card-header">
            <h3>
              <i className="fas fa-calendar-check"></i>
              All Appointments
            </h3>
            <div className="search-container">
              <div className="search-box2">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="card-content">
            {error && <div className="error-message">{error}</div>}
            {loading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="no-appointments">
                No appointments found
              </div>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>Dr. {appointment.doctorId?.fullName || 'N/A'}</td>
                      <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                      <td>{appointment.appointmentTime}</td>
                      <td>
                        <span className={`status-badge ${appointment.status?.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button 
                          className="action-btn view"
                          onClick={() => handleView(appointment)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Appointment Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="appointment-details">
                <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctorId?.fullName || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${selectedAppointment.status?.toLowerCase()}`}>
                    {selectedAppointment.status}
                  </span>
                </p>
                <p><strong>Reason:</strong> {selectedAppointment.reason || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h3>Delete Appointment</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this appointment?</p>
              <div className="appointment-summary">
                <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctorId?.fullName || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
              </div>
              <div className="modal-footer">
                <button className="delete-btn" onClick={() => handleDelete(selectedAppointment)}>
                  Yes, Delete
                </button>
                <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;