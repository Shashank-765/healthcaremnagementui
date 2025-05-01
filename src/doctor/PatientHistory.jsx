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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatientHistory, setNewPatientHistory] = useState({
    patientId: '',
    doctorId: '',
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
      const response = await axios.get(`${API_URL}/medical-history/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
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

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    // Add your save logic here
    setEditMode(false);
    setShowViewModal(false);
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
      await axios.post(`${API_URL}/api/v1/medical-history/medical-create`, newPatientHistory, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowCreateModal(false);
      fetchPatientHistories();
      // Reset form
      setNewPatientHistory({
        patientId: '',
        doctorId: '',
        condition: '',
        notes: ''
      });
    } catch (error) {
      setError('Failed to create patient history');
      console.error('Error creating patient history:', error);
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
                      <td>{history.patientId?.fullName || 'N/A'}</td>
                      <td>{history.doctorId?.fullName || 'N/A'}</td>
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
                            className="action-btn delete"
                            onClick={() => handleDeleteClick(history)}
                          >
                            <i className="fas fa-trash"></i>
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
                    value={selectedPatient?.patientId?.fullName || 'N/A'} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input 
                    type="text" 
                    value={selectedPatient?.doctorId?.fullName || 'N/A'} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <input 
                    type="text" 
                    value={selectedPatient?.condition} 
                    onChange={(e) => setSelectedPatient({
                      ...selectedPatient,
                      condition: e.target.value
                    })}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    value={selectedPatient?.notes} 
                    onChange={(e) => setSelectedPatient({
                      ...selectedPatient,
                      notes: e.target.value
                    })}
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
                  <button 
                    className="edit-btn"
                    onClick={handleEditClick}
                  >
                    Edit
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="save-btn"
                    onClick={handleSaveEdit}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                  >
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
              <h3>Create Medical History</h3>
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
                  <label>Patient ID</label>
                  <input 
                    type="text" 
                    value={newPatientHistory.patientId}
                    onChange={(e) => setNewPatientHistory({
                      ...newPatientHistory,
                      patientId: e.target.value
                    })}
                    placeholder="Enter Patient ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Doctor ID</label>
                  <input 
                    type="text" 
                    value={newPatientHistory.doctorId}
                    onChange={(e) => setNewPatientHistory({
                      ...newPatientHistory,
                      doctorId: e.target.value
                    })}
                    placeholder="Enter Doctor ID"
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