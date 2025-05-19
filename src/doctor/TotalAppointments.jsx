import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TotalAppointments.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const TotalAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatientHistory, setNewPatientHistory] = useState({
    patientEmail: '',
    condition: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData || !userData.token) {
        setError('Authentication required');
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_URL}/appointment/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Full API Response:', response.data);

      if (response.data.success) {
        const appointments = response.data.data?.appointments || [];
        
        // Log each appointment to debug
        appointments.forEach((apt, index) => {
          console.log(`Appointment ${index}:`, {
            id: apt._id,
            patient: apt.patientName,
            date: apt.appointmentDate,
            time: apt.appointmentTime,
            status: apt.status
          });
        });

        // Only log status if appointments array has items
        if (appointments.length > 0) {
          console.log('First appointment status:', appointments[0].status);
        }

        setAppointments(appointments);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.response?.data?.message || 'Error fetching appointments');
      setAppointments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => 
    appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedAppointments = showAllAppointments ? filteredAppointments : filteredAppointments.slice(0, 5);

  const formatDateTime = (date, time) => {
    const formattedDate = new Date(date).toLocaleDateString();
    return `${formattedDate} ${time}`;
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
        setError('');
        setAppointments(prevAppointments =>
            prevAppointments.map(appointment =>
                appointment._id === appointmentId
                    ? { ...appointment, updating: true }
                    : appointment
            )
        );

        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            setError('Authentication required');
            return;
        }

        const response = await axios.put(
            `${API_URL}/appointment/update-status`,
            {
                appointmentId,
                status: newStatus.toLowerCase()
            },
            {
                headers: {
                    'Authorization': `Bearer ${userData.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            // Update the status in the UI immediately
            setAppointments(prevAppointments =>
                prevAppointments.map(appointment =>
                    appointment._id === appointmentId
                        ? { ...appointment, status: newStatus.toLowerCase(), updating: false }
                        : appointment
                )
            );
            setError('');
            fetchAppointments();
        } else {
            setError(response.data.message || 'Failed to update status');
            setAppointments(prevAppointments =>
                prevAppointments.map(appointment =>
                    appointment._id === appointmentId
                        ? { ...appointment, updating: false }
                        : appointment
                )
            );
        }
    } catch (error) {
        setError(error.response?.data?.message || 'Error updating status');
        setAppointments(prevAppointments =>
            prevAppointments.map(appointment =>
                appointment._id === appointmentId
                    ? { ...appointment, updating: false }
                    : appointment
            )
        );
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData || !userData.token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.delete(
        `${API_URL}/appointment/delete-appointment/${appointmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchAppointments();
        setShowDeleteModal(false);
      } else {
        setError(response.data.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError(error.response?.data?.message || 'Error deleting appointment');
    }
  };

  const handleCreateHistory = (appointment) => {
    setSelectedAppointment(appointment);
    setNewPatientHistory({
      patientEmail: appointment.email,
      condition: '',
      notes: ''
    });
    setShowCreateModal(true);
  };

  const handleSaveNewHistory = async () => {
    try {
      setLoading(true);
      console.log('Starting handleSaveNewHistory');
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('UserData in handleSaveNewHistory:', {
        hasData: !!userData,
        hasToken: !!userData?.token,
        role: userData?.role
      });

      if (!userData || !userData.token) {
        console.log('No userData or token in handleSaveNewHistory');
        setError('Authentication required');
        return;
      }

      if (userData.role !== 'doctor') {
        console.log('User is not a doctor in handleSaveNewHistory');
        setError('Only doctors can access this page');
        return;
      }

      if (!newPatientHistory.patientEmail || !newPatientHistory.condition || !newPatientHistory.notes) {
        console.log('Missing required fields in newPatientHistory');
        setError('Please fill in all required fields');
        return;
      }

      const historyData = {
        patientEmail: newPatientHistory.patientEmail.trim().toLowerCase(),
        doctorEmail: userData.email.trim().toLowerCase(),
        condition: newPatientHistory.condition.trim(),
        notes: newPatientHistory.notes.trim(),
        date: new Date()
      };

      console.log('Sending history data:', historyData);

      const response = await axios.post(
        `${API_URL}/medical-history/medical-create`, 
        historyData,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Create history response:', {
        success: response.data.success,
        message: response.data.message
      });

      if (response.data.success) {
        setShowCreateModal(false);
        setNewPatientHistory({
          patientEmail: '',
          condition: '',
          notes: ''
        });
        alert('Medical history created successfully!');
        // Redirect to patient history page
        navigate('/doctor/patient-history');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.log('Error in handleSaveNewHistory:', {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data
      });
      
      if (error.response?.status === 401) {
        console.log('Unauthorized error in handleSaveNewHistory');
        setError('Session expired. Please login again');
      } else {
        setError(error.response?.data?.message || 'Failed to create patient history');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
     <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSubmenuOpen={true}/>
      </div>
      <div className="main-content">
        <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor Profile" />
            </div>
            <h1>YOUR HEALTH IS OUR PRIORITY</h1>
          </div>
        </div>

        <div className="total-appointments-container">
          <div className="section-header">
            <h2>Total Appointments</h2>
            <div className="header-actions">
              <div className="search-boxs">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search by patient name, email or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading appointments...
            </div>
          ) : (
          <div className="table-responsive">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                    <th>Email</th>
                    <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {displayedAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.patientName}</td>
                      <td>{appointment.email}</td>
                      <td>
                        {appointment.appointmentDate && appointment.appointmentTime
                          ? `${new Date(appointment.appointmentDate).toLocaleDateString()} ${appointment.appointmentTime}`
                          : 'N/A'}
                      </td>
                      <td>
                        <select 
                          value={appointment.status || 'pending'}
                          onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                          className={`status-select ${appointment.status || 'pending'}`}
                          disabled={appointment.updating}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirm">Confirm</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {appointment.updating && <span className="updating-indicator"> ⏳</span>}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn create"
                            onClick={() => handleCreateHistory(appointment)}
                            title="Create Medical History"style={{color:"green" , fontSize: "24px"}}>
                            <i className="fas fa-file-medical"></i>
                          </button>
                          <button 
                            className="action-btn delete"
                              onClick={() => handleDelete(appointment._id)}
                            disabled={appointment.updating}
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
          )}

          {!loading && filteredAppointments.length > 5 && (
          <div className="view-more-container">
            <button 
              className="view-more-btn"
              onClick={() => setShowAllAppointments(!showAllAppointments)}
            >
              {showAllAppointments ? (
                <>View Less <i className="fas fa-chevron-up"></i></>
              ) : (
                <>View More <i className="fas fa-chevron-down"></i></>
              )}
            </button>
          </div>
          )}
        </div>
      </div>

      {/* Create Patient History Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>Create Patient Medical History</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="patient-form">
                <div className="form-group">
                  <label>Patient Email</label>
                  <input 
                    type="email" 
                    value={newPatientHistory.patientEmail}
                    onChange={(e) => setNewPatientHistory({
                      ...newPatientHistory,
                      patientEmail: e.target.value
                    })}
                    placeholder="Enter Patient Email"
                    required
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Condition</label>
                  <input 
                    type="text" 
                    value={newPatientHistory.condition}
                    onChange={(e) => setNewPatientHistory({
                      ...newPatientHistory,
                      condition: e.target.value
                    })}
                    placeholder="e.g., High Blood Pressure"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    value={newPatientHistory.notes}
                    onChange={(e) => setNewPatientHistory({
                      ...newPatientHistory,
                      notes: e.target.value
                    })}
                    placeholder="Enter patient notes"
                    required
                    rows={3}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="save-btn"
                onClick={handleSaveNewHistory}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Medical History'}
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalAppointments; 