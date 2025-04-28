import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../patient/Allappointments.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AllAppointments = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      console.log('User Data from localStorage:', userData);

      if (!userData) {
        setError('Please login to view appointments');
        setLoading(false);
        return;
      }

      const token = userData.token;
      console.log('Token:', token);

      if (!token) {
        setError('Authentication token missing');
        setLoading(false);
        return;
      }

      // Get patient email from user data
      const patientEmail = userData.email;
      console.log('Patient Email:', patientEmail);

      if (!patientEmail) {
        console.log('User Data Structure:', userData);
        setError('Patient email not found in user data');
        setLoading(false);
        return;
      }

      // Encode the email for the URL
      const encodedEmail = encodeURIComponent(patientEmail);
      console.log('Encoded Email:', encodedEmail);

      // Log the complete request details
      const requestUrl = `${API_URL}/appointment/patient?patientEmail=${encodedEmail}`;
      console.log('Making request to:', requestUrl);
      console.log('Request headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        setError('Session expired. Please login again.');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setAppointments(data.data);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error details:', error);
      setError('Error fetching appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(appointment =>
    appointment.doctorId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    navigate('/');
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData(appointment);
    setShowEditModal(true);
  };

  const handleDelete = async (appointment) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const token = userData.token;
      if (!token) {
        setError('Please login to delete appointments');
        return;
      }

      const response = await fetch(`${API_URL}/appointment/delete-appointment/id/${appointment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        fetchAppointments();
        setShowDeleteModal(false);
      } else {
        setError(data.message || 'Failed to delete appointment');
      }
    } catch (error) {
      setError('Error deleting appointment. Please try again.');
      console.error('Error:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update appointments');
        return;
      }

      const response = await fetch(`${API_URL}/appointment/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName: editFormData.patientId.fullName,
          doctorName: editFormData.doctorId.fullName,
          status: editFormData.status
        })
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh appointments list
        fetchAppointments();
    setShowEditModal(false);
      } else {
        setError(data.message || 'Failed to update appointment');
      }
    } catch (error) {
      setError('Error updating appointment. Please try again.');
      console.error('Error:', error);
    }
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
        {/* Banner */}
        <div className="patient-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor" />
            </div>
            <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
          </div>
        </div>
        {/* Appointments Card */}
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
              <div className="loading">Loading appointments...</div>
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
                {filteredAppointments.map(appointment => (
                    <tr key={appointment._id}>
                      <td>Dr. {appointment.doctorId?.fullName}</td>
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
                        onClick={() => { setSelectedAppointment(appointment); setShowDeleteModal(true); }}
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
                <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctorId?.fullName}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${selectedAppointment.status?.toLowerCase()}`}>
                    {selectedAppointment.status}
                  </span>
                </p>
                <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
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
                <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctorId?.fullName}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
              </div>
              <div className="modal-footer">
                <button className="delete-btn" onClick={() => handleDelete(selectedAppointment)}>Yes, Delete</button>
                <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>No, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments; 