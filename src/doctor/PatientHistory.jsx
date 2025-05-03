import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientHistory.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const PatientHistory = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editHistory, setEditHistory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatientHistory, setNewPatientHistory] = useState({
    patientEmail: '',
    doctorEmail: '',
    condition: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [patientHistories, setPatientHistories] = useState([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchPatientHistories();
   
  }, []);

  const fetchPatientHistories = async () => {
    try { 
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const email = userData?.email; // or userData?._id
      const response = await axios.get(`${API_URL}/medical-history/personal-history/${email}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      setPatientHistories(response.data.data);
    } catch (error) {
      setError('Failed to fetch patient histories');
      console.log('Error fetching patient histories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // Add your delete logic here
    setShowDeleteModal(false);
    setSelectedPatient(null);
  };

  const handleViewClick = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
    setEditMode(false);
  };

  const handleEditClick = (history) => {
    setSelectedPatient(history);
    setEditHistory({
      condition: history.condition,
      notes: history.notes
    });
    setShowViewModal(true);
    setEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditHistory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      console.log('Selected patient for edit:', selectedPatient._id);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const email = userData?.email;
      const response = await axios.put(
        `${API_URL}/medical-history/edit/${selectedPatient._id}`,
        {
          condition: editHistory.condition,
          notes: editHistory.notes
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        setShowViewModal(false);
        setEditMode(false);
        fetchPatientHistories();
        alert('Medical history updated successfully!');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update medical history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setShowViewModal(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreateHistory = () => {
    setShowCreateModal(true);
  };

  const handleSaveNewHistory = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log("Full userData:", userData);

      if (!userData || !userData.token || !userData.email) {
        setError('Not authenticated. Please login again.');
        return;
      }

      if (!newPatientHistory.patientEmail || !newPatientHistory.condition || !newPatientHistory.notes) {
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

      console.log("Sending history data:", historyData);

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

      if (response.data.success) {
        setShowCreateModal(false);
        fetchPatientHistories();
        setNewPatientHistory({
          patientEmail: '',
          condition: '',
          notes: ''
        });
        // Show success message
        alert('Medical history created successfully!');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Full error details:', error.response?.data);
      if (error.response?.status === 401) {
        // Handle unauthorized error
        localStorage.clear(); // Clear invalid credentials
        navigate('/medical-history'); // Redirect to login
        setError('Session expired. Please login again.');
      } else {
        setError(error.response?.data?.message || 'Failed to create patient history');
      }
    } finally {
      setLoading(false);
    }
  };

  const displayedRecords = showAllRecords ? patientHistories : patientHistories.slice(0, 3);
     

  return (
    <div className="dashboard-container">
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div className="main-content">
        <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Banner Section */}
        <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor Profile" />
            </div>
            <h1>YOUR HEALTH IS OUR PRIORITY</h1>
          </div>
        </div>
        <div className="patient-history-container">
          <div className="section-header">
            <h2>Patient History</h2>
            <div className="header-actions">
              <div className="search-boxs">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search patient history..."/>
              </div>
              <button 
                className="create-history-btn"
                onClick={handleCreateHistory}
              >
                <i className="fas fa-plus"></i> Create Patient History
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="patient-history-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor Name</th>
                  <th>Condition</th>
                  <th>Notes</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center text-red-500">{error}</td>
                  </tr>
                ) : patientHistories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">No patient histories found</td>
                  </tr>
                ) : (
                  displayedRecords.map((history) => (
                    <tr key={history._id}>
                      <td>{history.patientName || 'N/A'}</td>
                      <td>{history.doctorName || 'N/A'}</td>
                      <td>{history.condition}</td>
                      <td>{history.notes}</td>
                      <td>{new Date(history.date).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            onClick={() => handleViewClick(history)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditClick(history)}
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="view-more-container">
            <button 
              className="view-more-btn"
              onClick={() => setShowAllRecords(!showAllRecords)}
            >
              {showAllRecords ? (
                <>View Less <i className="fas fa-chevron-up"></i></>
              ) : (
                <>View More <i className="fas fa-chevron-down"></i></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>{editMode ? 'Edit Medical History' : 'Medical History Details'}</h3>
              <button 
                className="close-btn"
                onClick={handleCancelEdit}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="patient-form">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    value={selectedPatient?.patientName || 'N/A'} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input 
                    type="text" 
                    value={selectedPatient?.doctorName || 'N/A'} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <input 
                    type="text"
                    name="condition"
                    value={editMode ? editHistory?.condition : selectedPatient?.condition}
                    onChange={editMode ? handleEditChange : undefined}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    name="notes"
                    value={editMode ? editHistory?.notes : selectedPatient?.notes}
                    onChange={editMode ? handleEditChange : undefined}
                    disabled={!editMode}
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={selectedPatient?.date?.split('T')[0]} 
                    onChange={(e) => setSelectedPatient({
                      ...selectedPatient,
                      date: e.target.value
                    })}
                    disabled={!editMode}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              {!editMode ? (
                <>
                  <button className="cancel-btn" onClick={() => setShowViewModal(false)}>
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button className="save-btn" onClick={handleSaveEdit} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this record?</p>
              <p><strong>Patient:</strong> {selectedPatient?.patientId?.fullName}</p>
              <p><strong>Date:</strong> {selectedPatient?.date ? new Date(selectedPatient.date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Patient History Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>Create patient Medical History</h3>
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
                  />
                </div>

                <div className="form-group">
                  <label>Doctor Email</label>
                  <input 
                    type="email" 
                    value={newPatientHistory.doctorEmail}
                    onChange={(e) => setNewPatientHistory({
                      ...newPatientHistory,
                      doctorEmail: e.target.value
                    })}
                    placeholder="Enter Doctor Email"
                    required
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

export default PatientHistory; 