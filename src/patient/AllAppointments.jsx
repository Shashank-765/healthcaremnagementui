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
  const [ratingDoctor, setRatingDoctor] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [selectedDoctorEmail, setSelectedDoctorEmail] = useState('');
  const [selectedDoctorName, setSelectedDoctorName] = useState('');

  const fetchAppointments = async (userData) => {
    try {
      setLoading(true);
      setError('');

      if (!userData || !userData.token) {
        setError('Authentication data missing. Please log in.');
        setLoading(false);
        navigate('/patient/patient-dashboard', { replace: true });
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
        console.log('Raw appointments data:', response.data.data);
        const formattedAppointments = response.data.data.map(appointment => {
          console.log('Processing appointment:', {
            id: appointment._id,
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
            doctor: appointment.doctor
          });
          return appointment;
        });
        console.log('Formatted appointments:', formattedAppointments);
        setAppointments(formattedAppointments);
        if (!formattedAppointments || formattedAppointments.length === 0) {
          setError('You have no appointments yet. Book your first appointment!');
        }
      } else {
        setError(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/patient/patient-dashboard', { replace: true });
      } else if (error.response?.status === 404) {
        if (error.response.data?.message?.includes('No appointments found')) {
          setError('You have no appointments yet. Book your first appointment!');
          setAppointments([]);
        } else {
          setError('Appointments endpoint not found. Please check the API configuration.');
        }
      } else {
        setError(error.response?.data?.message || 'Error loading appointments. Please try again later.');
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
      navigate('/patient/patient-dashboard', { replace: true });
    }
  }, [navigate]);

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (appointment) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        setError('Please log in to delete appointments');
        navigate('/patient/patient-dashboard', { replace: true });
        return;
      }
      const response = await axios({
        method: 'delete',
        url: `${API_URL}/appointment/delete-appointment/${appointment._id}`,
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200 && response.data.success) {
        // Remove the deleted appointment from the state
        setAppointments(prevAppointments =>
          prevAppointments.filter(apt => apt._id !== appointment._id)
        );
        setShowDeleteModal(false);
        setSelectedAppointment(null);
      } else {
        setError(response.data?.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Delete error:', error.message);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        setError('Session expired. Please try again from dashboard.');
        navigate('/patient/patient-dashboard', { replace: true });
      } else if (error.response?.status === 404) {
        setError('Appointment not found or already deleted');
      } else {
        setError(error.response?.data?.message || 'Error deleting appointment. Please try again.');
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

  const handleRatingSubmit = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        setError('Please log in to submit rating');
        return;
      }

      const response = await axios.post(
        `${API_URL}/doctor/rate-doctor`,
        {
          doctorName: selectedDoctorName,
          rating,
          comment: ratingComment
        },
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setShowRatingModal(false);
        setRating(0);
        setRatingComment('');
        // You can add a success message here
      }
    } catch (error) {
      // Check for the specific backend error message
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "You have already rated this doctor"
      ) {
        alert("You have already rated this doctor."); // <-- You can use a custom modal/toast here
        setShowRatingModal(false);
      } else {
        setError('Failed to submit rating. Please try again.');
      }
    }
  };

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
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading appointments...</span>
                </div>
              </div>
            ) : error ? (
              <div className="error-container">
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="no-records-container">
                <div className="no-records">
                  <i className="fas fa-calendar-times"></i>
                  <span>No appointments found</span>
                </div>
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
                      <td>Dr. {appointment.doctor?.name || 'N/A'}</td>
                      <td>{appointment.formattedDate || appointment.appointmentDate}</td>
                      <td>{appointment.formattedTime || appointment.appointmentTime}</td>
                      <td>
                        <span className={`status-badge ${appointment.status?.toLowerCase()}`}>
                          {appointment.status?.toUpperCase()}
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
                        <button
                          className="action-btn rate"
                          onClick={() => {
                            setSelectedDoctorName(appointment.doctor.name);
                            setShowRatingModal(true);
                          }}
                        >
                          <i className="fas fa-star"></i>
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
                <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctor?.name || 'N/A'}</p>
                <p><strong>Department:</strong> {selectedAppointment.department || 'N/A'}</p>
                <p><strong>Date:</strong> {selectedAppointment.formattedDate || selectedAppointment.appointmentDate}</p>
                <p><strong>Time:</strong> {selectedAppointment.formattedTime || selectedAppointment.appointmentTime}</p>
                <p><strong>Status:</strong>
                  <span className={`status-badge ${selectedAppointment.status?.toLowerCase()}`}>
                    {selectedAppointment.status?.toUpperCase()}
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
                <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctor?.name || 'N/A'}</p>
                <p><strong>Date:</strong> {selectedAppointment.formattedDate || selectedAppointment.appointmentDate}</p>
                <p><strong>Time:</strong> {selectedAppointment.formattedTime || selectedAppointment.appointmentTime}</p>
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

      {/* Add Rating Modal */}
      {showRatingModal && (
        <div className="modal-overlay">
          <div className="modal-content rating-modal">
            <div className="modal-header">
              <h3>Rate Doctor</h3>
              <button className="close-btn" onClick={() => setShowRatingModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fas fa-star ${star <= rating ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    style={{ cursor: 'pointer', fontSize: '24px', color: star <= rating ? '#ffd700' : '#ccc' }}
                  />
                ))}
              </div>
              <textarea
                placeholder="Add your comment (optional)"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="rating-comment"
              />
              <div className="modal-footer">
                <button className="submit-btn" onClick={handleRatingSubmit}>
                  Submit Rating
                </button>
                <button className="cancel-btn" onClick={() => setShowRatingModal(false)}>
                  Cancel
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