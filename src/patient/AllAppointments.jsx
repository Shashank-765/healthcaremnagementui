import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Add authentication check
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const userData = localStorage.getItem('userData');
        const parsedUserData = userData ? JSON.parse(userData) : null;
        console.log('Parsed User Data:', parsedUserData);
        
        if (!parsedUserData || !parsedUserData.token || !parsedUserData._id || parsedUserData.role !== 'patient') {
          console.log('No valid user data or wrong role');
          setError('Please log in again from the patient dashboard');
          navigate('/patient-dashboard', { replace: true });
          return;
        }

        console.log('User authenticated as patient with ID:', parsedUserData._id);
        await fetchAppointments(parsedUserData);
      } catch (error) {
        console.error('Error in authentication check:', error);
        setError('Error checking authentication');
        navigate('/patient-dashboard', { replace: true });
      }
    };

    checkAuthAndFetchData();
  }, [navigate]);

  const fetchAppointments = async (userData) => {
    try {
      setLoading(true);
      setError('');

      if (!userData || !userData.token || !userData.email || !userData._id) {
        setError('Authentication data missing');
        setLoading(false);
        navigate('/patient-dashboard', { replace: true });
        return;
      }

      console.log('Making request with:', {
        token: userData.token,
        email: userData.email,
        userId: userData._id
      });

      const response = await axios.get(
        `${API_URL}/appointment/patient?patientEmail=${encodeURIComponent(userData.email)}&patientId=${userData._id}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
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
      
      if (error.response) {
        console.log('Error response:', error.response);
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);

        if (error.response.status === 401) {
          setError('Unable to fetch appointments. Please try again.');
          navigate('/patient-dashboard', { replace: true });
        } else {
          setError(error.response.data?.message || 'Error loading appointments');
        }
      } else if (error.request) {
        setError('No response received from server');
      } else {
        setError('Error loading appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(appointment =>
    appointment.doctorId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/patient-dashboard', { replace: true });
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
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        setError('Please login to delete appointments');
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
        fetchAppointments(JSON.parse(localStorage.getItem('userData')));
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
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                Loading appointments...
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