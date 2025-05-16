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
  const [loading, setLoading] = useState(false);
  const [patientHistories, setPatientHistories] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    console.log('PatientHistory Component Mounted');
    fetchPatientHistories();
  }, [searchQuery]);

  const fetchPatientHistories = async () => {
    try { 
      setLoading(true);
      console.log('Starting fetchPatientHistories');
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('UserData from localStorage:', userData);
      
      if (!userData) {
        console.log('No userData found');
        setError('Authentication required');
        navigate('/login');
        return;
      }

      if (!userData.token) {
        console.log('No token found');
        setError('Authentication required');
        navigate('/login');
        return;
      }

      if (!userData.email) {
        console.log('No email found in userData');
        setError('Invalid user data');
        navigate('/login');
        return;
      }

      if (userData.role !== 'doctor') {
        console.log('User is not a doctor, role:', userData.role);
        setError('Only doctors can access this page');
        return;
      }

      const email = userData.email;
      console.log('Making API call with email:', email);
      
      const response = await axios.get(`${API_URL}/medical-history/personal-history/${email}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      
      console.log('API Response:', {
        success: response.data.success,
        dataLength: response.data.data?.length,
        firstRecord: response.data.data?.[0]
      });

      // Filter the data based on search query
      let filteredData = response.data.data;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = response.data.data.filter(history => 
          history.patientName?.toLowerCase().includes(query)
        );
      }
      
      setPatientHistories(filteredData);
    } catch (error) {
      console.log('Error in fetchPatientHistories:', {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data
      });
      
      if (error.response?.status === 401) {
        console.log('Unauthorized error - Session expired');
        setError('Session expired. Please login again');
      } else {
        console.log('Other error occurred');
        setError('Failed to fetch patient histories');
      }
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

  const handleViewClick = (history) => {
    if (!history || !history._id) {
      console.error('Invalid history data:', history);
      setError('Invalid medical history data');
      return;
    }

    setSelectedPatient({
      _id: history._id,
      patientId: history.patientId,
      patientName: history.patientName,
      doctorName: history.doctorName,
      condition: history.condition || '',
      notes: history.notes || '',
      date: history.date,
      version: history.version || 1
    });
    setShowViewModal(true);
    setEditMode(false);
  };

  const handleEditClick = (history) => {
    console.log('Editing history:', history);
    // Make sure we have all required data
    if (!history || !history._id) {
      console.error('Invalid history data:', history);
      setError('Invalid medical history data');
      return;
    }

    // Store the complete history object
    const selectedPatientData = {
      _id: history._id,
      patientId: history.patientId,
      patientName: history.patientName,
      doctorName: history.doctorName,
      condition: history.condition || '',
      notes: history.notes || '',
      date: history.date,
      version: history.version || 1
    };

    console.log('Setting selected patient data:', selectedPatientData);
    setSelectedPatient(selectedPatientData);

    const editHistoryData = {
      condition: history.condition || '',
      notes: history.notes || ''
    };
    console.log('Setting edit history data:', editHistoryData);
    setEditHistory(editHistoryData);

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
      setError(''); // Clear any previous errors
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData || !userData.token) {
        console.error('No user data or token found');
        setError('Authentication required');
        return;
      }

      if (!selectedPatient) {
        console.error('No selected patient data');
        setError('No patient record selected');
        return;
      }

      if (!selectedPatient._id) {
        console.error('Missing _id in selected patient:', selectedPatient);
        setError('Invalid patient record: Missing record ID');
        return;
      }

      if (!editHistory.condition || !editHistory.notes) {
        console.error('Missing required fields in edit history:', editHistory);
        setError('Condition and notes are required');
        return;
      }

      // Log the state before making the request
      console.log('Selected Patient:', selectedPatient);
      console.log('Edit History:', editHistory);

      const requestData = {
        historyId: selectedPatient._id,
        condition: editHistory.condition.trim(),
        notes: editHistory.notes.trim(),
        date: selectedPatient.date
      };

      console.log('Saving edit with data:', {
        ...requestData,
        doctorEmail: userData.email
      });

      const response = await axios.put(
        `${API_URL}/medical-history/edit/${userData.email}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // Add a 10 second timeout
        }
      );

      console.log('Edit response:', response.data);

      if (response.data.success) {
        setShowViewModal(false);
        setEditMode(false);
        setEditHistory(null);
        setSelectedPatient(null);
        await fetchPatientHistories(); // Refresh the list
        alert('Medical history updated successfully!');
      } else {
        console.error('Update failed:', response.data);
        setError(response.data.message || 'Failed to update medical history');
      }
    } catch (error) {
      console.error('Error updating medical history:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Medical history record not found');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid request data');
      } else {
        setError(error.response?.data?.message || 'Failed to update medical history. Please try again.');
      }
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
                <input 
                  type="text" 
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                  displayedRecords.map((history) => {
                    // Get the latest history record from the chain
                    const latestHistory = history.historyChain?.[0];
                    if (!latestHistory) {
                      console.error('No history record found in chain:', history);
                      return null;
                    }

                    // Format the date properly
                    const formattedDate = latestHistory.date 
                      ? new Date(latestHistory.date).toLocaleDateString()
                      : 'N/A';

                    console.log('Rendering history:', {
                      patientName: history.patientName,
                      doctorName: history.doctorName,
                      history
                    });

                    return (
                      <tr key={latestHistory._id}>
                        <td>{history.patientName || 'N/A'}</td>
                        <td>{history.doctorName || 'N/A'}</td>
                        <td>{latestHistory.condition || 'N/A'}</td>
                        <td>{latestHistory.notes || 'N/A'}</td>
                        <td>{formattedDate}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view"
                              onClick={() => handleViewClick({
                                ...history,
                                _id: latestHistory._id,
                                condition: latestHistory.condition,
                                notes: latestHistory.notes,
                                date: latestHistory.date,
                                version: latestHistory.version
                              })}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditClick({
                                ...history,
                                _id: latestHistory._id,
                                condition: latestHistory.condition,
                                notes: latestHistory.notes,
                                date: latestHistory.date,
                                version: latestHistory.version
                              })}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }).filter(Boolean)
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
    </div>
  );
};

export default PatientHistory; 